/**
 * The quarterly treasury benchmark (founder-strategy-pack.md section D, M phase 3; /benchmarking). A client's holdings
 * for a quarter, each beside what the same shillings would have earned at the Central Bank of Kenya's Treasury bill
 * auction of the nearest tenor, in the same weeks. Facts only: no recommendation, no rating of anyone (D-028, D-035).
 *
 * Pure functions with no imports, so tests run them directly under node (tests/site/test_benchmark.py).
 *
 * Method (also printed on the page):
 *   - Days counted are the days a holding was held inside the quarter (start inclusive, end exclusive), on a 365-day year.
 *   - Earned = amount x the holding's own annual rate x days / 365, before tax.
 *   - Yardstick = amount x the weighted average rate of the CBK bill auction of the nearest tenor (91, 182 or 364 days)
 *     whose value date is the latest on or before the holding's start (or the quarter's start if later), x days / 365.
 *   - Holdings of more than 400 days have no like-for-like bill; they are compared with the 364-day bill and flagged.
 */

export type HoldingKind = "tbill" | "bond" | "deposit" | "fund" | "other";
export const KINDS: HoldingKind[] = ["tbill", "bond", "deposit", "fund", "other"];

export type Holding = { line: number; name: string; kind: HoldingKind; amountKes: number; ratePct: number; start: string; end: string };
export type Auction = { tenor: number; value_date: string; weighted_avg_rate: number; source?: string | null };

export type BenchLine = Holding & {
  days: number;
  earnedKes: number;
  tenor: number;
  auctionDate: string | null;
  auctionRate: number | null;
  auctionSource: string | null;
  yardstickKes: number | null;
  differenceKes: number | null;
  note: string | null;
};

export type Benchmark = {
  quarter: string;
  from: string;
  to: string;
  lines: BenchLine[];
  totalAmountKes: number;
  earnedKes: number;
  yardstickKes: number;
  differenceKes: number;
  earnedRatePct: number | null;
  yardstickRatePct: number | null;
};

const DAY = 86_400_000;
const MAX_ROWS = 200;
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));
const t = (s: string) => Date.parse(`${s}T00:00:00Z`);
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);

/** "2026-Q3" → the quarter's first day and the day after its last. */
export function quarterRange(quarter: string): { from: string; to: string } | null {
  const m = /^(\d{4})-Q([1-4])$/.exec(quarter);
  if (!m) return null;
  const y = Number(m[1]);
  const q = Number(m[2]);
  const from = `${y}-${String((q - 1) * 3 + 1).padStart(2, "0")}-01`;
  const to = q === 4 ? `${y + 1}-01-01` : `${y}-${String(q * 3 + 1).padStart(2, "0")}-01`;
  return { from, to };
}

/** Split one CSV line, honouring double-quoted fields. */
function cells(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cur += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      out.push(cur.trim());
      cur = "";
    } else cur += c;
  }
  out.push(cur.trim());
  return out;
}

export const TEMPLATE_HEADER = "name,kind,amount_kes,rate_pct,start,end";

/**
 * Read a holdings CSV: a header with name, kind, amount_kes, rate_pct, start, end (any order, any case), then one
 * holding a line. Returns the holdings and every problem with its line number; nothing is guessed.
 */
export function parseHoldings(csv: string): { holdings: Holding[]; errors: string[] } {
  const lines = csv.replace(/^﻿/, "").split(/\r?\n/);
  const errors: string[] = [];
  const holdings: Holding[] = [];
  const header = cells(lines[0] ?? "").map((h) => h.toLowerCase());
  const need = TEMPLATE_HEADER.split(",");
  const missing = need.filter((h) => !header.includes(h));
  if (missing.length) return { holdings, errors: [`Line 1: the header needs ${need.join(", ")}; missing ${missing.join(", ")}.`] };
  const col = (row: string[], h: string) => row[header.indexOf(h)] ?? "";
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    if (holdings.length + errors.length >= MAX_ROWS) {
      errors.push(`More than ${MAX_ROWS} holdings: split the file.`);
      break;
    }
    const row = cells(lines[i]);
    const n = i + 1;
    const name = col(row, "name").slice(0, 120);
    const kind = col(row, "kind").toLowerCase() as HoldingKind;
    const amount = Number(col(row, "amount_kes").replace(/[\s,]/g, ""));
    const rate = Number(col(row, "rate_pct").replace(/%$/, ""));
    const start = col(row, "start");
    const end = col(row, "end");
    const bad: string[] = [];
    if (!name) bad.push("no name");
    if (!KINDS.includes(kind)) bad.push(`kind must be one of ${KINDS.join(", ")}`);
    if (!(amount > 0 && amount <= 1e12)) bad.push("amount_kes must be a positive number");
    if (!(rate >= 0 && rate <= 60)) bad.push("rate_pct must be between 0 and 60");
    if (!isDate(start) || !isDate(end)) bad.push("start and end must be dates as YYYY-MM-DD");
    else if (t(end) <= t(start)) bad.push("end must be after start");
    if (bad.length) errors.push(`Line ${n}: ${bad.join("; ")}.`);
    else holdings.push({ line: n, name, kind, amountKes: amount, ratePct: rate, start, end });
  }
  if (!holdings.length && !errors.length) errors.push("No holdings found below the header.");
  return { holdings, errors };
}

const nearestTenor = (days: number) => [91, 182, 364].reduce((a, b) => (Math.abs(b - days) < Math.abs(a - days) ? b : a));

/** The latest auction of a tenor on or before a date. */
function auctionOn(auctions: Auction[], tenor: number, date: string): Auction | null {
  let best: Auction | null = null;
  for (const a of auctions) {
    if (a.tenor !== tenor || !(a.weighted_avg_rate > 0) || a.value_date > date) continue;
    if (!best || a.value_date > best.value_date) best = a;
  }
  return best;
}

const round = (x: number) => Math.round(x);

export function benchmark(quarter: string, holdings: Holding[], auctions: Auction[]): Benchmark | null {
  const range = quarterRange(quarter);
  if (!range) return null;
  const q0 = t(range.from);
  const q1 = t(range.to);
  const lines: BenchLine[] = holdings.map((h) => {
    const from = Math.max(t(h.start), q0);
    const to = Math.min(t(h.end), q1);
    const days = Math.max(0, Math.round((to - from) / DAY));
    const term = Math.round((t(h.end) - t(h.start)) / DAY);
    const tenor = term > 400 ? 364 : nearestTenor(term);
    const earned = (h.amountKes * h.ratePct * days) / 36500;
    const a = days > 0 ? auctionOn(auctions, tenor, iso(from)) : null;
    const yard = a ? (h.amountKes * a.weighted_avg_rate * days) / 36500 : null;
    let note: string | null = null;
    if (days === 0) note = "Not held during the quarter.";
    else if (!a) note = "No auction of this tenor on record before the start date.";
    else if (term > 400) note = "Held longer than a year: no like-for-like bill, compared with the 364-day bill.";
    return {
      ...h,
      days,
      earnedKes: round(earned),
      tenor,
      auctionDate: a?.value_date ?? null,
      auctionRate: a?.weighted_avg_rate ?? null,
      auctionSource: a?.source ?? null,
      yardstickKes: yard == null ? null : round(yard),
      differenceKes: yard == null ? null : round(earned - yard),
      note,
    };
  });
  const compared = lines.filter((l) => l.yardstickKes != null);
  const sum = (f: (l: BenchLine) => number, ls = lines) => ls.reduce((s, l) => s + f(l), 0);
  const dayKes = sum((l) => l.amountKes * l.days, compared);
  const earnedKes = sum((l) => l.earnedKes, compared);
  const yardstickKes = sum((l) => l.yardstickKes ?? 0, compared);
  return {
    quarter,
    from: range.from,
    to: iso(q1 - DAY),
    lines,
    totalAmountKes: sum((l) => l.amountKes),
    earnedKes,
    yardstickKes,
    differenceKes: earnedKes - yardstickKes,
    earnedRatePct: dayKes > 0 ? Math.round(((earnedKes * 36500) / dayKes) * 100) / 100 : null,
    yardstickRatePct: dayKes > 0 ? Math.round(((yardstickKes * 36500) / dayKes) * 100) / 100 : null,
  };
}
