import { billMarkets, latestBills, loadBillMarket, type BillMarket, type BillRow } from "@/lib/data/sovereign-bills";
import { bondMarkets, loadBondMarket, type BondMarket, type BondRow } from "@/lib/data/sovereign-bonds";

/**
 * Everything on the monitor is computed here from the repository's own auction files, on each build or revalidation.
 * Nothing is typed in by hand: a figure that cannot be computed comes back as null and the page prints "—".
 */

const DAY = 86_400_000;
const toMs = (iso: string) => Date.parse(`${iso}T00:00:00Z`);
const shift = (iso: string, days: number) => new Date(toMs(iso) + days * DAY).toISOString().slice(0, 10);

function median(values: number[]): number | null {
  if (!values.length) return null;
  const v = [...values].sort((a, b) => a - b);
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

const mean = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null);

/** Which rows count as "the same bond line" when comparing with three months earlier. */
function sameLine(slug: BondMarket["slug"], a: BondRow, b: BondRow) {
  if (a.tenor_years == null || b.tenor_years == null) return false;
  if (Math.round(a.tenor_years) !== Math.round(b.tenor_years)) return false;
  // Egypt: fixed, zero-coupon and floating bonds of one tenor price differently. WAEMU: the issue field is the country.
  if (slug === "egypt" || slug === "waemu") return a.issue === b.issue;
  return true;
}

export type MarketSummary = {
  market: BondMarket;
  label: string;
  dateLabel: "Auction date" | "Settlement date";
  latestDate: string;
  latestIsFuture: boolean;
  results90: number;
  headline: BondRow;
  /** Latest headline rate minus the mean rate of the same line 75–105 days before the newest auction, in basis points. */
  change: { bps: number; n: number; from: string; to: string } | null;
  cover90: { median: number; n: number } | null;
  cover12m: { median: number; n: number } | null;
  recent: BondRow[];
  groups: { issuer: string; count12m: number; rows: BondRow[] }[] | null;
};

export type BillSummary = { market: BillMarket; row: BillRow };

export type MonitorData = {
  today: string;
  asOf: { date: string; market: string; dateLabel: string } | null;
  markets: MarketSummary[];
  bills: BillSummary[];
};

export function buildMonitor(today = new Date().toISOString().slice(0, 10)): MonitorData {
  const since90 = shift(today, -90);
  const since12m = shift(since90, -365);

  const markets: MarketSummary[] = bondMarkets.flatMap((market) => {
    const rows = loadBondMarket(market.slug).rows; // newest first
    if (!rows.length) return [];
    const latestDate = rows[0].date;
    const newest = rows.filter((r) => r.date === latestDate);
    const maxTenor = Math.max(...newest.map((r) => r.tenor_years ?? -1));
    const headline =
      newest
        .filter((r) => (r.tenor_years ?? -1) === maxTenor)
        .sort((a, b) => (b.accepted_m ?? -1) - (a.accepted_m ?? -1))[0] ?? newest[0];

    const from = shift(latestDate, -105);
    const to = shift(latestDate, -75);
    const earlier = rows.filter((r) => r.date >= from && r.date <= to && sameLine(market.slug, r, headline)).map((r) => r.rate);
    const earlierMean = mean(earlier);
    const change =
      earlierMean == null || headline.tenor_years == null
        ? null
        : { bps: Math.round((headline.rate - earlierMean) * 100), n: earlier.length, from, to };

    const covers = (lo: string, hi: string | null) =>
      rows.filter((r) => r.date > lo && (hi == null || r.date <= hi) && r.bid_cover != null).map((r) => r.bid_cover as number);
    const c90 = covers(since90, null);
    const c12 = covers(since12m, since90);
    const m90 = median(c90);
    const m12 = median(c12);

    let groups: MarketSummary["groups"] = null;
    if (market.slug === "waemu") {
      const yearAgo = shift(today, -365);
      const byIssuer = new Map<string, BondRow[]>();
      for (const r of rows) {
        const key = r.issue ?? "Unknown issuer";
        byIssuer.set(key, [...(byIssuer.get(key) ?? []), r]);
      }
      groups = [...byIssuer.entries()]
        .map(([issuer, list]) => ({ issuer, count12m: list.filter((r) => r.date > yearAgo).length, rows: list.slice(0, 5) }))
        .filter((g) => g.count12m > 0)
        .sort((a, b) => b.count12m - a.count12m || b.rows[0].date.localeCompare(a.rows[0].date))
        .slice(0, 3);
    }

    return [
      {
        market,
        label: market.slug === "waemu" ? "WAEMU" : market.country,
        dateLabel: market.dateKind === "settlement" ? "Settlement date" : "Auction date",
        latestDate,
        latestIsFuture: latestDate > today,
        results90: rows.filter((r) => r.date > since90).length,
        headline,
        change,
        cover90: m90 == null ? null : { median: m90, n: c90.length },
        cover12m: m12 == null ? null : { median: m12, n: c12.length },
        recent: rows.slice(0, 5),
        groups,
      },
    ];
  });

  // "As of" never shows a future day: settlement dates after today (Egypt's bonds settle a day after the auction)
  // are skipped in favour of the newest result already in the past.
  const newest = [...markets].filter((m) => m.latestDate <= today).sort((a, b) => b.latestDate.localeCompare(a.latestDate))[0];

  const bills: BillSummary[] = billMarkets.flatMap((market) => {
    const latest = latestBills(loadBillMarket(market.slug).rows);
    const pick = latest.get(364) ?? latest.get(182) ?? latest.get(91);
    return pick ? [{ market, row: pick.latest }] : [];
  });

  return {
    today,
    asOf: newest ? { date: newest.latestDate, market: newest.label, dateLabel: newest.dateLabel.toLowerCase() } : null,
    markets,
    bills,
  };
}

// Formatting. One place, so every table reads the same way.
export const fmtDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const fmtRate = (v: number) => `${v.toFixed(2)}%`;
export const fmtCover = (v: number) => `${v.toFixed(2)}×`;
export const fmtTenor = (years: number | null) => (years == null ? "—" : `${Number(years.toFixed(1))}y`);
export const fmtAmount = (v: number | null) => (v == null ? "—" : Math.round(v).toLocaleString("en-US"));
export const fmtBps = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : "±"}${Math.abs(v)}`;
