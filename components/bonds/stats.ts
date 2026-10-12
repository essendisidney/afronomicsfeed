import { bondMarkets, loadBondMarket, type BondMarket, type BondRow } from "@/lib/data/sovereign-bonds";

/** Shared, build-time helpers for the per-market bond auction pages. Pure functions over repo data. */

export const shortName = (market: BondMarket) => (market.slug === "waemu" ? "WAEMU" : market.country);

/** "Côte d’Ivoire" -> "cote-divoire", matching the slugs the WAEMU reader uses. */
export const issuerSlug = (name: string) =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export type Issuer = { slug: string; name: string; results: number };

/** Issuing countries in a pooled market (WAEMU), most results first. */
export function issuersOf(rows: BondRow[]): Issuer[] {
  const counts = new Map<string, number>();
  for (const r of rows) if (r.issue) counts.set(r.issue, (counts.get(r.issue) ?? 0) + 1);
  return [...counts.entries()].map(([name, results]) => ({ slug: issuerSlug(name), name, results })).sort((a, b) => b.results - a.results);
}

/** Markets that have at least one result in the repo, in the library's order. */
export function marketsWithRows() {
  return bondMarkets.map((market) => ({ market, ...loadBondMarket(market.slug) })).filter((m) => m.rows.length > 0);
}

export type Bucket = { key: "short" | "medium" | "long"; label: string; color: string };

export const buckets: Bucket[] = [
  { key: "short", label: "Under 5 years", color: "var(--series-1)" },
  { key: "medium", label: "5 to 10 years", color: "var(--series-2)" },
  { key: "long", label: "Over 10 years", color: "var(--series-3)" },
];

export function bucketOf(tenor: number | null): Bucket["key"] | null {
  if (tenor == null) return null;
  if (tenor < 5) return "short";
  if (tenor <= 10) return "medium";
  return "long";
}

const median = (values: number[]) => {
  if (!values.length) return null;
  const v = [...values].sort((a, b) => a - b);
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
};

/** The date one year before an ISO date, as ISO. */
export const yearBefore = (iso: string) => `${Number(iso.slice(0, 4)) - 1}${iso.slice(4)}`;

export type BondFacts = {
  newest: string;
  newestIsFuture: boolean;
  first: string;
  results: number;
  auctionDays: number;
  longest: BondRow | null;
  windowFrom: string;
  range: { min: number; max: number } | null;
  medianCover: number | null;
  coverCount: number;
};

/** Headline facts. Rows are newest first. `today` is ISO (UTC) so a scheduled settlement is never shown as past. */
export function bondFacts(rows: BondRow[], today: string): BondFacts | null {
  if (!rows.length) return null;
  const newest = rows[0].date;
  const latest = rows.filter((r) => r.date === newest);
  const longest = latest.reduce<BondRow | null>((best, r) => (best == null || (r.tenor_years ?? -1) > (best.tenor_years ?? -1) ? r : best), null);
  const windowFrom = yearBefore(newest);
  const window = rows.filter((r) => r.date > windowFrom);
  const rates = window.map((r) => r.rate);
  const covers = window.map((r) => r.bid_cover).filter((v): v is number => v != null && Number.isFinite(v));
  return {
    newest,
    newestIsFuture: newest > today,
    first: rows[rows.length - 1].date,
    results: rows.length,
    auctionDays: new Set(rows.map((r) => r.date)).size,
    longest,
    windowFrom,
    range: rates.length ? { min: Math.min(...rates), max: Math.max(...rates) } : null,
    medianCover: median(covers),
    coverCount: covers.length,
  };
}

/** Rows within one date, sorted by tenor; dates newest first. */
export const tableOrder = (rows: BondRow[]) =>
  [...rows].sort((a, b) => b.date.localeCompare(a.date) || (a.tenor_years ?? 0) - (b.tenor_years ?? 0));

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const longDate = (iso: string) => dayFmt.format(new Date(`${iso}T12:00:00Z`));
export const todayIso = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

export const tenorText = (t: number | null) => (t == null ? "—" : `${Number.isInteger(t) ? t : t.toFixed(1)}y`);

export const millions = (m: number | null) =>
  m == null ? "—" : m.toLocaleString("en-US", { maximumFractionDigits: m >= 100 ? 0 : 1 });
