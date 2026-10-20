/**
 * WAEMU auction demand (/markets/waemu-demand): how heavily each of the eight West African governments' auctions on
 * UMOA-Titres are bid. Free of imports so tests run it directly (tests/site/test_waemu_demand.py); the page reads
 * data/waemu/auctions.json through lib/data/waemu-demand.ts.
 *
 * One auction is one issue page: a treasury's bills and bonds sold together on one day. UMOA-Titres prints the amount
 * sought once for the whole issue (repeated on every line), and the bids per line, so:
 *   bid cover = bids summed over the issue's lines / amount sought.
 * Lines printed with a negative amount are buybacks ("rachat"), and pure buyback or exchange pages are not sales of new
 * debt: both are left out. A cover above MAX_COVER means a figure was misread from the page (one 2025 Senegal page
 * gave an amount sought of 24 million), so that auction is left out too. The one-year yield is the weighted average
 * yield of the issue's 11- to 13-month bill.
 */

export const MAX_COVER = 25;

export type RawLine = {
  country?: unknown;
  instrument?: unknown;
  operation_date?: unknown;
  months?: unknown;
  sought_xof_m?: unknown;
  bids_xof_m?: unknown;
  accepted_xof_m?: unknown;
  weighted_yield?: unknown;
  source?: unknown;
};

export type Auction = {
  country: string;
  date: string;
  source: string;
  /** XOF millions. */
  sought: number;
  bids: number;
  accepted: number;
  cover: number;
  oneYear: number | null;
  lines: number;
};

export type CountryDemand = {
  country: string;
  latest: Auction;
  /** The most recent auctions, newest first (up to `window`). */
  recent: Auction[];
  /** Median bid cover of the `window` latest auctions, and of the `window` before them (null below 3 auctions). */
  median: number;
  previous: number | null;
  /** The latest one-year bill yield and the date of the auction that set it. */
  oneYear: { rate: number; date: string } | null;
};

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
const str = (v: unknown) => (typeof v === "string" && v ? v : null);

/** Pure buyback or exchange operations: not auctions of new debt even when a line's amounts are positive. */
const NOT_A_SALE = /\/(rachat-simultanee|echange)/;

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Every new-issue auction, newest first. */
export function auctions(lines: RawLine[]): Auction[] {
  const groups = new Map<string, RawLine[]>();
  for (const l of lines) {
    const country = str(l.country);
    const date = str(l.operation_date);
    const source = str(l.source) ?? "";
    if (!country || !date || NOT_A_SALE.test(source)) continue;
    if ([l.sought_xof_m, l.bids_xof_m, l.accepted_xof_m].some((v) => (num(v) ?? 0) < 0)) continue;
    const key = `${country}|${date}|${source}`;
    groups.set(key, [...(groups.get(key) ?? []), l]);
  }
  const out: Auction[] = [];
  for (const [key, ls] of groups) {
    const [country, date, source] = key.split("|");
    const sought = num(ls[0].sought_xof_m);
    if (!sought || sought <= 0) continue;
    const bids = ls.reduce((t, l) => t + (num(l.bids_xof_m) ?? 0), 0);
    const accepted = ls.reduce((t, l) => t + (num(l.accepted_xof_m) ?? 0), 0);
    const bill = ls.find((l) => l.instrument === "BAT" && (num(l.months) ?? 0) >= 11 && (num(l.months) ?? 0) <= 13 && num(l.weighted_yield) != null);
    if (bids / sought > MAX_COVER) continue;
    out.push({ country, date, source, sought, bids, accepted, cover: bids / sought, oneYear: bill ? num(bill.weighted_yield) : null, lines: ls.length });
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || a.country.localeCompare(b.country));
}

/** Per country: the latest auction, the median cover of the last `window` auctions and of the `window` before. */
export function demandByCountry(all: Auction[], window = 8): CountryDemand[] {
  const byCountry = new Map<string, Auction[]>();
  for (const a of all) byCountry.set(a.country, [...(byCountry.get(a.country) ?? []), a]);
  const out: CountryDemand[] = [];
  for (const [country, list] of byCountry) {
    const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
    const recent = sorted.slice(0, window);
    const before = sorted.slice(window, window * 2);
    const bill = sorted.find((a) => a.oneYear != null);
    out.push({
      country,
      latest: sorted[0],
      recent,
      median: median(recent.map((a) => a.cover))!,
      previous: before.length >= 3 ? median(before.map((a) => a.cover)) : null,
      oneYear: bill ? { rate: bill.oneYear!, date: bill.date } : null,
    });
  }
  return out.sort((a, b) => b.median - a.median);
}
