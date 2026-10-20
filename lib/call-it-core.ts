/**
 * "Call it" (/markets/kenya-tbills/call-it, phase-7b-plan.md 7b-4 item 1): readers guess this week's Kenya Treasury
 * bill averages before bids close, and are scored when the CBK publishes. Free of imports so tests run it directly
 * (tests/site/test_call_it.py); the page and app/api/call-it use it, and supabase/migrations/0044_call_it.sql stores
 * the guesses.
 */

export const TENORS = [91, 182, 364] as const;
export type Tenor = (typeof TENORS)[number];
export type Guess = { g91: number | null; g182: number | null; g364: number | null };
export type Round = { valueDate: string; closesAt: string };
export type Scored = { handle: string; missBps: number; tenors: number; perTenor: Partial<Record<Tenor, number>> };

const DAY = 86_400_000;
const iso = (t: number) => new Date(t).toISOString();

/**
 * The auction readers are guessing now: the earliest one in the forecast ledger whose bids have not closed, so the
 * game and our published range always point at the same auction. Without one, the next Thursday 11:00 UTC (14:00
 * Nairobi, when CBK bids close), with the value date the Monday after.
 */
export function nextRound(nowIso: string, ledger: { auction_value_date: string; bids_close: string }[]): Round {
  const now = Date.parse(nowIso);
  const open = ledger
    .filter((r) => Date.parse(r.bids_close) > now)
    .sort((a, b) => a.bids_close.localeCompare(b.bids_close) || a.auction_value_date.localeCompare(b.auction_value_date))[0];
  if (open) return { valueDate: open.auction_value_date, closesAt: iso(Date.parse(open.bids_close)) };
  const d = new Date(now);
  let close = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + ((4 - d.getUTCDay() + 7) % 7), 11);
  if (close <= now) close += 7 * DAY;
  return { valueDate: iso(close + 4 * DAY).slice(0, 10), closesAt: iso(close) };
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HANDLE = /^[A-Za-z0-9 _.-]{2,24}$/;

function rate(v: unknown): number | null | "bad" {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(String(v).replace(",", ".").replace(/%$/, "").trim());
  if (!Number.isFinite(n) || n <= 0 || n >= 40) return "bad";
  return Math.round(n * 1000) / 1000;
}

/** A reader's entry, checked: an email, at least one rate between 0 and 40%, an optional handle. */
export function parseEntry(
  body: unknown,
): { ok: true; value: Guess & { email: string; handle: string | null; show: boolean } } | { ok: false; reason: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const email = String(b.email ?? "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 200) return { ok: false, reason: "Please enter a valid email address." };
  const g = { g91: rate(b.g91), g182: rate(b.g182), g364: rate(b.g364) };
  if (Object.values(g).some((v) => v === "bad")) return { ok: false, reason: "Each rate is a percentage between 0 and 40, like 8.75." };
  if (g.g91 == null && g.g182 == null && g.g364 == null) return { ok: false, reason: "Call at least one of the three rates." };
  const handle = String(b.handle ?? "").trim() || null;
  if (handle && !HANDLE.test(handle)) return { ok: false, reason: "A name for the board is 2 to 24 letters, numbers, spaces, dots, dashes or underscores." };
  return { ok: true, value: { ...(g as Guess), email, handle, show: Boolean(b.show) && Boolean(handle) } };
}

/** How far each guess was from the result: the mean miss in basis points over the tenors called; best first. */
export function scoreBoard(guesses: (Guess & { handle: string })[], actual: Partial<Record<Tenor, number>>): Scored[] {
  return guesses
    .map((g) => {
      const perTenor: Partial<Record<Tenor, number>> = {};
      for (const t of TENORS) {
        const v = g[`g${t}` as keyof Guess];
        const a = actual[t];
        if (v != null && a != null) perTenor[t] = Math.round(Math.abs(v - a) * 100);
      }
      const misses = Object.values(perTenor) as number[];
      return { handle: g.handle, perTenor, tenors: misses.length, missBps: misses.length ? misses.reduce((x, y) => x + y, 0) / misses.length : Infinity };
    })
    .filter((s) => s.tenors > 0)
    .sort((a, b) => a.missBps - b.missBps || b.tenors - a.tenors || a.handle.localeCompare(b.handle));
}
