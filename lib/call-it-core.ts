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

/** A stored guess as the score emails read it (supabase/migrations/0045_call_it_scores.sql, af_call_it_entries). */
export type Entry = Guess & { id: string; email: string; handle: string | null; show: boolean; scored_at: string | null };
export type Placed = { id: string; place: number; missBps: number; perTenor: Partial<Record<Tenor, number>> };

/** Every entry's place, named or not, best first; entries with the same mean miss share a place. */
export function placeAll(entries: (Guess & { id: string })[], actual: Partial<Record<Tenor, number>>): Placed[] {
  const scored = scoreBoard(
    entries.map((e) => ({ handle: e.id, g91: e.g91, g182: e.g182, g364: e.g364 })),
    actual,
  );
  return scored.map((s) => ({
    id: s.handle,
    missBps: s.missBps,
    perTenor: s.perTenor,
    place: 1 + scored.filter((o) => o.missBps < s.missBps).length,
  }));
}

const ordinal = (n: number) => {
  const t = n % 100;
  return `${n}${t >= 11 && t <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] ?? "th"}`;
};
const bps = (n: number) => `${Math.round(n * 10) / 10} bp${Math.round(n * 10) === 10 ? "" : "s"}`;
const pct = (n: number) => `${n.toFixed(2)}%`;
const dayLabel = (iso: string) =>
  new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const closeLabel = (iso: string) => {
  const d = new Date(iso);
  const day = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Africa/Nairobi" });
  const time = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Africa/Nairobi" }).replace(":00", "").replace(" pm", " p.m.").replace(" am", " a.m.");
  return `${day} at ${time} Nairobi time`;
};

export type ScoreNote = {
  subject: string;
  lead: string[];
  rows: { tenor: Tenor; call: string; result: string; miss: string; ours: string }[];
  after: string[];
};

/**
 * One player's score email, as text: their calls against the CBK result, their place, how our own published range
 * did on the same bills, the named leaders, and the round now open. The words only; lib/call-it-mail.ts lays them out.
 */
export function scoreNote(input: {
  entry: Guess;
  placed: Placed;
  players: number;
  actual: Partial<Record<Tenor, number>>;
  range: Partial<Record<Tenor, { low: number; high: number }>>;
  /** How many callers share this player's place, the player included. */
  atPlace: number;
  /** Named callers (they chose to show a name), best first, with their place among all callers. */
  leaders: { handle: string; missBps: number; place: number }[];
  valueDate: string;
  next: Round;
}): ScoreNote {
  const { entry, placed, players, actual, range, atPlace, leaders, valueDate, next } = input;
  const rows = TENORS.filter((t) => entry[`g${t}` as keyof Guess] != null).map((t) => {
    const call = entry[`g${t}` as keyof Guess] as number;
    const a = actual[t];
    const r = range[t];
    return {
      tenor: t,
      call: pct(call),
      result: a == null ? "no result" : pct(a),
      miss: placed.perTenor[t] == null ? "–" : bps(placed.perTenor[t]!),
      ours: r ? `${pct(r.low)} to ${pct(r.high)}` : "–",
    };
  });

  // Our call on the same bills: the middle of our published range, scored the same way as the reader's.
  const ourMisses = TENORS.filter((t) => placed.perTenor[t] != null && range[t] && actual[t] != null).map((t) =>
    Math.round(Math.abs((range[t]!.low + range[t]!.high) / 2 - actual[t]!) * 100),
  );
  const ourMiss = ourMisses.length ? ourMisses.reduce((x, y) => x + y, 0) / ourMisses.length : null;
  const won = placed.place === 1;
  const shared = won && atPlace > 1;

  const subject = won
    ? `Call it: you ${shared ? "shared" : "won"} this week's round`
    : `Call it: ${bps(placed.missBps)} off, ${ordinal(placed.place)} of ${players}`;
  const lead = [
    `The Central Bank of Kenya has published the Treasury bill results for ${dayLabel(valueDate)}.`,
    players === 1
      ? `You were the only caller this round, and you missed by ${bps(placed.missBps)} on average (100 bps is one percentage point).`
      : `You missed by ${bps(placed.missBps)} on average (100 bps is one percentage point), ${won ? (shared ? "level first" : "the closest call") : `${atPlace > 1 ? "joint " : ""}${ordinal(placed.place)}`} of ${players} callers.`,
  ];
  const after: string[] = [];
  if (ourMiss != null)
    after.push(
      placed.missBps < ourMiss
        ? `You beat us. The middle of our published range missed the same bills by ${bps(ourMiss)}.`
        : placed.missBps === ourMiss
          ? `You matched us: the middle of our published range also missed by ${bps(ourMiss)}.`
          : `The middle of our published range missed the same bills by ${bps(ourMiss)}, so we were closer this time.`,
    );
  const named = leaders.slice(0, 3);
  if (named.length) after.push(`Top of the board: ${named.map((l) => `${ordinal(l.place)} ${l.handle} (${bps(l.missBps)})`).join(", ")}.`);
  after.push(`The next round is open until ${closeLabel(next.closesAt)}, for the bills dated ${dayLabel(next.valueDate)}.`);
  return { subject, lead, rows, after };
}
