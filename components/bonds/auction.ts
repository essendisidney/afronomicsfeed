import { getBondMarket, loadBondMarket, type BondMarket, type BondRow } from "@/lib/data/sovereign-bonds";
import { shortDate } from "@/lib/data/auction-week";
import { issuerSlug, issuersOf, shortName, type Issuer } from "./stats";

/**
 * One bond auction (one market, or one WAEMU issuer, on one date): its lines, each set against the previous sale of
 * the same tenor, and the neighbouring auctions. Pure functions over the repo data, used by the dated pages
 * (/markets/bonds/{market}/{date}, /markets/bonds/waemu/{issuer}/{date}, /markets/kenya-bonds/{date}).
 */

export const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Dated auction pages built ahead of time: the last 24 months. Older dates render on first request. */
export const STATIC_MONTHS = 24;

/** Where an auction's dated page lives. Kenya keeps its long-standing /markets/kenya-bonds/{date} pages. */
export function bondAuctionPath(slug: string, date: string, issuerName?: string | null) {
  if (slug === "kenya") return `/markets/kenya-bonds/${date}`;
  if (slug === "waemu") return issuerName ? `/markets/bonds/waemu/${issuerSlug(issuerName)}/${date}` : null;
  return `/markets/bonds/${slug}/${date}`;
}

/** The market page an auction belongs to. */
export const bondMarketPath = (slug: string, issuer?: Issuer | null) =>
  slug === "kenya" ? "/markets/kenya-bonds" : `/markets/bonds/${slug}${issuer ? `/${issuer.slug}` : ""}`;

const EGYPT_KIND: Record<string, string> = {
  fixed: "fixed-rate",
  floating: "floating-rate",
  zero: "zero-coupon",
};

/** "10-year", "1.5-year", "6-month". */
export function tenorLabel(years: number | null) {
  if (years == null) return "unstated-tenor";
  if (years < 1) return `${Math.round(years * 12)}-month`;
  return `${Number.isInteger(years) ? years : Number(years.toFixed(1))}-year`;
}

/**
 * Rows that count as "the same tenor" for a comparison, as on /markets/auction-week: Kenya's tenor is a bond's
 * original term and most sales reopen old lines, so there it is the same bond; Egypt splits fixed, floating and
 * zero-coupon bonds; Morocco's tenor is the time left to maturity (2.6 years, then 2.5 on the next reopening), so
 * there it is the same ISIN; everywhere else it is the tenor in years.
 */
export function seriesOf(market: BondMarket, r: BondRow) {
  if (market.slug === "kenya" && r.issue) return `bond:${r.issue}`;
  if (market.slug === "morocco" && r.isin) return `isin:${r.isin}`;
  const kind = market.slug === "egypt" && r.issue ? r.issue : "";
  return `${kind}:${r.tenor_years ?? ""}`;
}

export const egyptKind = (market: BondMarket, r: BondRow) => (market.slug === "egypt" && r.issue ? (EGYPT_KIND[r.issue] ?? r.issue) : null);

/** A Kenya buyback is the government buying its own bonds back, not a sale, so it is never "the previous sale". */
const isSale = (market: BondMarket, r: BondRow) => !(market.slug === "kenya" && r.type === "buyback");

export type AuctionLine = BondRow & {
  label: string; // "10-year", "3-year fixed-rate"
  prev: BondRow | null;
  /** Change from the previous sale of the same tenor, in basis points, to 0.1. Null when there is none. */
  bps: number | null;
  /** Why there is no comparison: no earlier sale, or more than one sale of that tenor on the previous date. */
  noPrev: "first" | "ambiguous" | null;
};

export type BondAuction = {
  market: BondMarket;
  issuer: Issuer | null;
  date: string;
  settlement: boolean;
  lines: AuctionLine[];
  lead: AuctionLine;
  newer: string | null;
  older: string | null;
  sources: string[];
  path: string;
  marketPath: string;
  place: string;
  totals: {
    offered: number | null;
    received: number | null;
    accepted: number | null;
    cover: number | null;
  };
};

const sum = (values: (number | null)[]) => {
  const v = values.filter((x): x is number => x != null && Number.isFinite(x));
  return v.length ? v.reduce((a, b) => a + b, 0) : null;
};

/** The rows of one market's scope: a whole market, or one WAEMU issuer. Null when the scope does not exist. */
export function auctionScope(slug: string, issuerSlugParam?: string | null) {
  const market = getBondMarket(slug);
  if (!market) return null;
  const { rows, updatedAt } = loadBondMarket(market.slug);
  if (market.slug === "waemu") {
    if (!issuerSlugParam) return null;
    const issuer = issuersOf(rows).find((i) => i.slug === issuerSlugParam);
    if (!issuer) return null;
    return {
      market,
      issuer,
      rows: rows.filter((r) => r.issue === issuer.name),
      updatedAt,
    };
  }
  if (issuerSlugParam) return null;
  return { market, issuer: null, rows, updatedAt };
}

/** Distinct dates of a scope, newest first. */
export const datesOf = (rows: BondRow[]) => [...new Set(rows.map((r) => r.date))].sort((a, b) => b.localeCompare(a));

export function bondAuction(slug: string, date: string, issuerSlugParam?: string | null): (BondAuction & { updatedAt: string | null }) | null {
  if (!ISO_DATE.test(date)) return null;
  const scope = auctionScope(slug, issuerSlugParam);
  if (!scope) return null;
  const { market, issuer, rows, updatedAt } = scope;
  const today = rows.filter((r) => r.date === date);
  if (!today.length) return null;

  const history = new Map<string, BondRow[]>();
  for (const r of rows) {
    if (r.date >= date || !isSale(market, r)) continue;
    const k = seriesOf(market, r);
    history.set(k, [...(history.get(k) ?? []), r]);
  }

  const lines: AuctionLine[] = [...today]
    .sort((a, b) => (a.tenor_years ?? 0) - (b.tenor_years ?? 0) || (a.issue ?? "").localeCompare(b.issue ?? ""))
    .map((r) => {
      const kind = egyptKind(market, r);
      const label = `${tenorLabel(r.tenor_years)}${kind ? ` ${kind}` : ""}`;
      const earlier = history.get(seriesOf(market, r)) ?? [];
      if (!earlier.length) return { ...r, label, prev: null, bps: null, noPrev: "first" as const };
      const prevDate = earlier.reduce((max, p) => (p.date > max ? p.date : max), earlier[0].date);
      let candidates = earlier.filter((p) => p.date === prevDate);
      // Two sales of the same tenor on the previous date: the same ISIN decides; otherwise no comparison is made.
      if (candidates.length > 1 && r.isin) candidates = candidates.filter((p) => p.isin === r.isin);
      if (candidates.length !== 1)
        return {
          ...r,
          label,
          prev: null,
          bps: null,
          noPrev: "ambiguous" as const,
        };
      const prev = candidates[0];
      return {
        ...r,
        label,
        prev,
        bps: Math.round((r.rate - prev.rate) * 1000) / 10,
        noPrev: null,
      };
    });

  // The headline line: the largest amount accepted; without amounts, the longest tenor.
  const lead = [...lines].sort((a, b) => (b.accepted_m ?? -Infinity) - (a.accepted_m ?? -Infinity) || (b.tenor_years ?? 0) - (a.tenor_years ?? 0))[0];

  const dates = datesOf(rows);
  const i = dates.indexOf(date);
  const offered = market.slug === "kenya" ? (today.find((r) => r.offered_m != null)?.offered_m ?? null) : sum(today.map((r) => r.offered_m));
  const received = sum(today.map((r) => r.received_m));
  const accepted = sum(today.map((r) => r.accepted_m));
  return {
    market,
    issuer,
    date,
    settlement: market.dateKind === "settlement",
    lines,
    lead,
    newer: dates[i - 1] ?? null,
    older: dates[i + 1] ?? null,
    sources: [...new Set(today.map((r) => r.source).filter((s) => /^https?:\/\//.test(s)))],
    path: bondAuctionPath(market.slug, date, issuer?.name) ?? "",
    marketPath: bondMarketPath(market.slug, issuer),
    place: issuer ? issuer.name : shortName(market),
    totals: {
      offered,
      received,
      accepted,
      cover: received != null && accepted ? Math.round((received / accepted) * 100) / 100 : null,
    },
    updatedAt,
  };
}

/** "16.85%": two decimals for titles and headline figures. */
export const pct2 = (rate: number) => `${rate.toFixed(2)}%`;

/** Signed basis points: "+45", "−12.3", "0". */
export const signedBps = (bps: number) => {
  const abs = String(Number(Math.abs(bps).toFixed(1)));
  return bps > 0 ? `+${abs}` : bps < 0 ? `−${abs}` : "0";
};

/**
 * The page title, with the market, the instrument, the date and the headline rate:
 * "Uganda 10-year bond auction, 7 Oct 2026: 16.85%" for one line, "Uganda bond auction, 7 Oct 2026: 20-year at 16.93%"
 * for several. A settlement-dated market says "settlement", so the date is never passed off as the auction day.
 */
export function auctionTitle(a: Pick<BondAuction, "place" | "date" | "settlement" | "lines" | "lead">) {
  const when = `${a.settlement ? "settlement " : ""}${shortDate(a.date)}`;
  const tenor = tenorLabel(a.lead.tenor_years);
  return a.lines.length === 1
    ? `${a.place} ${tenor} bond auction, ${when}: ${pct2(a.lead.rate)}`
    : `${a.place} bond auction, ${when}: ${tenor} at ${pct2(a.lead.rate)}`;
}

/** Each in-scope (market, issuer, date) whose date falls in the last `months` months, for generateStaticParams. */
export function recentAuctions(slug: BondMarket["slug"], months: number, now = Date.now()) {
  const d = new Date(now);
  d.setUTCMonth(d.getUTCMonth() - months);
  const from = d.toISOString().slice(0, 10);
  const { rows } = loadBondMarket(slug);
  const seen = new Set<string>();
  const out: { date: string; issuer: string | null }[] = [];
  for (const r of rows) {
    if (r.date < from) continue;
    const issuer = slug === "waemu" ? (r.issue ? issuerSlug(r.issue) : null) : null;
    if (slug === "waemu" && !issuer) continue;
    const k = `${issuer ?? ""}|${r.date}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ date: r.date, issuer });
  }
  return out;
}

/** Every dated auction page of a market (all dates, for the sitemap). */
export function allAuctionPaths(slug: BondMarket["slug"]) {
  const { rows } = loadBondMarket(slug);
  const seen = new Set<string>();
  const out: { path: string; date: string }[] = [];
  for (const r of rows) {
    const path = bondAuctionPath(slug, r.date, r.issue);
    if (!path || seen.has(path)) continue;
    seen.add(path);
    out.push({ path, date: r.date });
  }
  return out;
}
