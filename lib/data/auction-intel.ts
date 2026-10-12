import { loadTbills, tenors, type TbillAuction, type Tenor } from "./kenya-tbills";

export { checkBid, priceFor, WHT, type BidCheck, type BidVerdict } from "@/lib/auction-math";

/**
 * Auction intelligence for Kenya's weekly Treasury bill auction.
 *
 * Before: the likely range for each tenor's average accepted rate at the next auction, from the last 26 weekly
 * moves (the 10th to 90th percentile added to the latest rate), with its track record over every auction since
 * 2011. A range, never a single "prediction": the CBK sets the cut-off on the day.
 *
 * After: "did my bid win?" from what the CBK publishes. It publishes the weighted average of accepted bids, not
 * the cut-off, so a competitive bid at or below the average was accepted; above it, the answer depends on the
 * unpublished cut-off unless the CBK accepted nearly every bid it received. Non-competitive bids are issued at
 * the average.
 *
 * Price and return use the CBK's own discount convention, which reproduces its "price per Kshs 100": a 365-day
 * year (price = 100 / (1 + rate × days / 36,500)). Interest is taxed at 15% withholding.
 */

const WINDOW = 26;

function quantile(sorted: number[], q: number) {
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

function series(rows: TbillAuction[], tenor: Tenor) {
  return rows.filter((r) => r.tenor === tenor).sort((a, b) => a.value_date.localeCompare(b.value_date));
}

function band(rates: number[], end: number) {
  const moves = rates.slice(end - WINDOW, end).map((r, i, all) => (i ? r - all[i - 1] : NaN)).filter(Number.isFinite);
  const sorted = [...moves].sort((a, b) => a - b);
  const last = rates[end - 1];
  return { low: last + quantile(sorted, 0.1), high: last + quantile(sorted, 0.9), typical: quantile([...moves.map(Math.abs)].sort((a, b) => a - b), 0.5) };
}

export type Outlook = {
  tenor: Tenor;
  last: TbillAuction;
  low: number;
  high: number;
  typicalMove: number; // median absolute weekly move, percentage points
  trackRecord: { tested: number; inside: number }; // how often the actual rate fell inside the range
};

export type NextAuction = { valueDate: string; bidsClose: string };

/** The next auction: the CBK auctions every week, bids closing at 2 p.m. on the Thursday before the Monday value date. */
export function nextAuction(rows = loadTbills().rows): NextAuction | null {
  const last = rows[0]?.value_date;
  if (!last) return null;
  const value = new Date(`${last}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 7);
  const close = new Date(value);
  close.setUTCDate(close.getUTCDate() - 4);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { valueDate: iso(value), bidsClose: iso(close) };
}

export function outlook(rows = loadTbills().rows): Outlook[] {
  return tenors.flatMap((tenor) => {
    const s = series(rows, tenor);
    if (s.length < WINDOW + 2) return [];
    const rates = s.map((r) => r.weighted_avg_rate);
    let tested = 0;
    let inside = 0;
    for (let i = WINDOW + 1; i < rates.length; i++) {
      const b = band(rates, i);
      tested++;
      if (rates[i] >= b.low && rates[i] <= b.high) inside++;
    }
    const b = band(rates, rates.length);
    return [{ tenor, last: s[s.length - 1], low: b.low, high: b.high, typicalMove: b.typical, trackRecord: { tested, inside } }];
  });
}

export function latestAuctions(rows = loadTbills().rows): Partial<Record<Tenor, TbillAuction>> {
  const out: Partial<Record<Tenor, TbillAuction>> = {};
  for (const r of rows) if (!out[r.tenor]) out[r.tenor] = r;
  return out;
}
