/**
 * Writer for the Afronomics Supabase database.
 *
 * With SUPABASE_SERVICE_ROLE_KEY set, the server writes tables directly. Without it, writes go
 * through narrow, validated database functions (af_subscribe, af_archive_fx, af_archive_wire)
 * using the project's publishable key, which is public by design.
 */
const PROJECT_URL = "https://ugjpcybhqwvzidcbqpik.supabase.co";
const PUBLISHABLE_KEY = "sb_publishable_pytbevd21MRA9Vgasf0TLw_kAugNejO";

function url() {
  return (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? PROJECT_URL).replace(/\/$/, "");
}

export function serviceConfig() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return key ? { url: url(), key } : null;
}

function headers(key: string): Record<string, string> {
  // New-style publishable keys are not JWTs and must not be sent as a bearer token.
  return key.startsWith("sb_publishable_")
    ? { apikey: key, "Content-Type": "application/json" }
    : { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

type Result = { ok: true; value: unknown } | { ok: false; reason: string };

/** Call a database function. Uses the service key when present, otherwise the publishable key. */
export async function rpc(fn: string, args: Record<string, unknown>): Promise<Result> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? PUBLISHABLE_KEY;
  const response = await fetch(`${url()}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify(args),
    cache: "no-store",
  }).catch(() => null);
  if (!response) return { ok: false, reason: "network" };
  const text = await response.text();
  if (!response.ok) return { ok: false, reason: `${response.status} ${text.slice(0, 200)}` };
  return { ok: true, value: text ? JSON.parse(text) : null };
}

/** Direct table upsert — service key only (used for payment records, which must not be publicly writable). */
export async function upsertRows(table: string, rows: unknown[], onConflict: string, mode: "merge" | "ignore" = "merge") {
  const cfg = serviceConfig();
  if (!cfg) return { ok: false as const, reason: "SUPABASE_SERVICE_ROLE_KEY is not set." };
  if (rows.length === 0) return { ok: true as const, count: 0 };
  const response = await fetch(`${cfg.url}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: {
      ...headers(cfg.key),
      Prefer: `resolution=${mode === "merge" ? "merge-duplicates" : "ignore-duplicates"},return=minimal`,
    },
    body: JSON.stringify(rows),
    cache: "no-store",
  }).catch(() => null);
  if (!response || !response.ok) {
    return { ok: false as const, reason: response ? `${response.status} ${(await response.text()).slice(0, 200)}` : "network" };
  }
  return { ok: true as const, count: rows.length };
}

/** Read-only database function call, cached for `revalidate` seconds so pages stay static (ISR). */
export async function rpcRead(fn: string, args: Record<string, unknown>, revalidate = 3600): Promise<Result> {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? PUBLISHABLE_KEY;
  const response = await fetch(`${url()}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify(args),
    next: { revalidate },
  }).catch(() => null);
  if (!response) return { ok: false, reason: "network" };
  const text = await response.text();
  if (!response.ok) return { ok: false, reason: `${response.status} ${text.slice(0, 200)}` };
  return { ok: true, value: text ? JSON.parse(text) : null };
}
