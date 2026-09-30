/** Minimal server-side writer for the Afronomics Supabase database (service role, REST). */
export function storeConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

export async function upsertRows(table: string, rows: unknown[], onConflict: string, mode: "merge" | "ignore" = "merge") {
  const cfg = storeConfig();
  if (!cfg) return { ok: false as const, reason: "Database is not configured." };
  if (rows.length === 0) return { ok: true as const, count: 0 };
  const response = await fetch(`${cfg.url}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
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
