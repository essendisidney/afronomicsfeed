/**
 * "This week in African government debt auctions": a factual weekly wrap computed from the bill and bond auction files.
 *
 * Everything below `buildAuctionWeek` is pure: it takes normalised results (full history, so each result can be compared
 * with the previous sale of the same tenor) and returns the numbers, the per-market tables and template sentences.
 * `loadAuctionWeek` is the only part that reads the data files. `auctionWeekSelfCheck` runs the computation on a small
 * fixture with known answers (scripts/auction-week-check.ts runs it, plus invariants on the live data).
 */

import { billMarkets, loadBillMarket } from "./sovereign-bills";
import { bondMarkets, loadBondMarket } from "./sovereign-bonds";

export type Instrument = "bill" | "bond";

/** One result: one tenor (or one bond line) sold by one market on one date. */
export type AuctionResult = {
  market: string; // country key, e.g. "kenya", "senegal"
  instrument: Instrument;
  date: string; // YYYY-MM-DD as the publisher records it (see dateKind)
  dateKind: "auction" | "settlement" | "value";
  /** Results with the same market and series are the "same tenor" for comparisons. */
  series: string;
  tenorDays: number; // for ordering
  tenorLabel: string; // "91-day", "10-year"
  detail: string | null; // bond line or kind: "FXD1/2018/015", "floating-rate", "switch"
  rate: number; // % a year, as published
  offered: number | null; // millions of local currency
  received: number | null;
  accepted: number | null;
  bidCover: number | null; // bids received / amount accepted
  source: string;
};

export type MarketMeta = {
  key: string;
  country: string;
  group: string | null; // "WAEMU" for the eight UMOA-Titres issuers
  currency: string;
  bondSlug: string | null;
  billSlug: string | null;
  billHref: string | null;
  publishers: { bill?: string; bond?: string };
  rateNotes: { bill?: string; bond?: string };
};

export type Compared = AuctionResult & {
  prev: { date: string; rate: number } | null;
  /** Change from the previous sale of the same series, in basis points, rounded to 0.1. Null when there is none. */
  bps: number | null;
};

export type WeekMove = { result: AuctionResult; prev: AuctionResult; bps: number };
export type CoverPick = { result: AuctionResult; ties: number };

export type MarketWeek = {
  meta: MarketMeta;
  auctions: number;
  results: Compared[];
  accepted: number | null; // millions of meta.currency, summed over results that give it
  acceptedMissing: number; // results with no accepted amount
  direction: "rose" | "fell" | "unchanged" | "mixed" | "none";
  sources: string[];
};

export type AuctionWeek = {
  window: { start: string; end: string };
  previous: { start: string; end: string };
  auctions: number;
  marketsActive: number;
  resultCount: number;
  accepted: { currency: string; total: number; results: number; missing: number }[];
  changes: { comparable: number; rose: number; fell: number; unchanged: number };
  largestChange: Compared | null;
  weekMove: WeekMove | null;
  weekPairs: number; // series sold in both weeks
  coverHigh: CoverPick | null;
  coverLow: CoverPick | null;
  markets: MarketWeek[];
  summary: string[];
};

/* ---------- small helpers (exported for the components, so text and tables format alike) ---------- */

const DAY = 86_400_000;
export const addDays = (iso: string, days: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dateParts = (iso: string) => ({ d: Number(iso.slice(8, 10)), m: Number(iso.slice(5, 7)) - 1, y: iso.slice(0, 4) });
/** "13 Oct 2026" (fixed month names, so the output never depends on the runtime's locale data) */
export const shortDate = (iso: string) => {
  const p = dateParts(iso);
  return `${p.d} ${MONTHS[p.m].slice(0, 3)} ${p.y}`;
};
/** "13 October 2026" */
export const longDate = (iso: string) => {
  const p = dateParts(iso);
  return `${p.d} ${MONTHS[p.m]} ${p.y}`;
};
/** "7–13 Oct 2026", "30 Sep – 6 Oct 2026", "29 Dec 2025 – 4 Jan 2026" */
export function rangeLabel(start: string, end: string) {
  const a = dateParts(start);
  const b = dateParts(end);
  const mon = (m: number) => MONTHS[m].slice(0, 3);
  if (a.y === b.y && a.m === b.m) return `${a.d}–${b.d} ${mon(b.m)} ${b.y}`;
  if (a.y === b.y) return `${a.d} ${mon(a.m)} – ${b.d} ${mon(b.m)} ${b.y}`;
  return `${shortDate(start)} – ${shortDate(end)}`;
}

/** A rate as published, with at least two decimals and at most four: 12 → "12.00%", 16.925 → "16.925%". */
export function fmtRate(rate: number) {
  const fixed = rate.toFixed(4).replace(/0+$/, "");
  const [whole, dec = ""] = fixed.split(".");
  return `${whole}.${dec.padEnd(2, "0")}%`;
}
/** Basis points to one decimal, without sign: 45 → "45", 12.26 → "12.3". */
export const fmtBpsAbs = (bps: number) => String(Number(Math.abs(bps).toFixed(1)));
/** Signed basis points for tables: "+45", "−12.3", "0". */
export const fmtBpsSigned = (bps: number) => (bps > 0 ? `+${fmtBpsAbs(bps)}` : bps < 0 ? `−${fmtBpsAbs(bps)}` : "0");
export const fmtCover = (v: number) => `${v.toFixed(2)}×`;
/** Millions with one decimal and thousands separators: "28,602.5". */
export const fmtMillions = (m: number) => m.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
/** Millions in words-friendly units: under a thousand millions in m, else bn with one decimal. */
export function fmtAmount(currency: string, m: number) {
  return m >= 1000 ? `${currency} ${(m / 1000).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}bn` : `${currency} ${fmtMillions(m)}m`;
}

const roundBps = (rateNow: number, ratePrev: number) => Math.round((rateNow - ratePrev) * 1000) / 10;

/** "Nigeria's 10-year bond", "Kenya's 15-year bond FXD1/2018/015", "Egypt's 1.5-year floating-rate bond". */
export function resultName(r: AuctionResult, metas: Map<string, MarketMeta>, possessive = true) {
  const country = metas.get(r.market)?.country ?? r.market;
  const owner = possessive ? `${country}’${country.endsWith("s") ? "" : "s"}` : country;
  if (r.instrument === "bill") return `${owner} ${r.tenorLabel} bill`;
  const parts = (r.detail ?? "").split(", ");
  const kind = parts.find((p) => /-rate$|^zero-coupon$/.test(p));
  const line = parts.find((p) => p.includes("/"));
  const op = parts.includes("switch") ? " (switch)" : "";
  return `${owner} ${r.tenorLabel} ${kind ? `${kind} ` : ""}bond${line ? ` ${line}` : ""}${op}`;
}

function list(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}
const plural = (n: number, one: string, many = `${one}s`) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
const NUMBER_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const count = (n: number) => NUMBER_WORDS[n] ?? n.toLocaleString("en-US");

/* ---------- the computation ---------- */

const auctionKey = (r: AuctionResult) => `${r.market}|${r.instrument}|${r.date}`;
const seriesKey = (r: AuctionResult) => `${r.market}|${r.instrument}|${r.series}`;
const byOrder = (a: AuctionResult, b: AuctionResult) =>
  (a.instrument === b.instrument ? 0 : a.instrument === "bill" ? -1 : 1) || a.tenorDays - b.tenorDays || a.date.localeCompare(b.date) || (a.detail ?? "").localeCompare(b.detail ?? "");

export function buildAuctionWeek(all: AuctionResult[], metaList: MarketMeta[]): AuctionWeek | null {
  const valid = all.filter((r) => /^\d{4}-\d{2}-\d{2}$/.test(r.date) && Number.isFinite(r.rate));
  if (!valid.length) return null;
  const metas = new Map(metaList.map((m) => [m.key, m]));

  // The window: the seven days ending on the newest result date anywhere, so the page always has a week to show.
  const end = valid.reduce((max, r) => (r.date > max ? r.date : max), valid[0].date);
  const window = { start: addDays(end, -6), end };
  const previous = { start: addDays(end, -13), end: addDays(end, -7) };
  const inWeek = (r: AuctionResult) => r.date >= window.start && r.date <= window.end;
  const inPrev = (r: AuctionResult) => r.date >= previous.start && r.date <= previous.end;

  // History by series, newest first, for "previous sale of the same tenor".
  const history = new Map<string, AuctionResult[]>();
  for (const r of valid) history.set(seriesKey(r), [...(history.get(seriesKey(r)) ?? []), r]);
  for (const rows of history.values()) rows.sort((a, b) => b.date.localeCompare(a.date));

  const week = valid.filter(inWeek).sort(byOrder);
  const compared: Compared[] = week.map((r) => {
    const prev = history.get(seriesKey(r))!.find((p) => p.date < r.date) ?? null;
    return { ...r, prev: prev ? { date: prev.date, rate: prev.rate } : null, bps: prev ? roundBps(r.rate, prev.rate) : null };
  });

  // Per market.
  const marketKeys = [...new Set(compared.map((r) => r.market))].sort((a, b) => (metas.get(a)?.country ?? a).localeCompare(metas.get(b)?.country ?? b));
  const markets: MarketWeek[] = marketKeys.map((key) => {
    const results = compared.filter((r) => r.market === key);
    const meta = metas.get(key) ?? { key, country: key, group: null, currency: "", bondSlug: null, billSlug: null, billHref: null, publishers: {}, rateNotes: {} };
    const amounts = results.map((r) => r.accepted).filter((v): v is number => v !== null);
    const moves = results.map((r) => r.bps).filter((v): v is number => v !== null);
    const direction: MarketWeek["direction"] = !moves.length
      ? "none"
      : moves.every((b) => b > 0)
        ? "rose"
        : moves.every((b) => b < 0)
          ? "fell"
          : moves.every((b) => b === 0)
            ? "unchanged"
            : "mixed";
    return {
      meta,
      auctions: new Set(results.map(auctionKey)).size,
      results,
      accepted: amounts.length ? amounts.reduce((a, b) => a + b, 0) : null,
      acceptedMissing: results.length - amounts.length,
      direction,
      sources: [...new Set(results.map((r) => r.source).filter((s) => /^https?:\/\//.test(s)))],
    };
  });

  // Accepted, per currency (never converted).
  const byCurrency = new Map<string, { currency: string; total: number; results: number; missing: number }>();
  for (const m of markets) {
    const c = byCurrency.get(m.meta.currency) ?? { currency: m.meta.currency, total: 0, results: 0, missing: 0 };
    c.total += m.accepted ?? 0;
    c.results += m.results.length - m.acceptedMissing;
    c.missing += m.acceptedMissing;
    byCurrency.set(m.meta.currency, c);
  }
  const accepted = [...byCurrency.values()].filter((c) => c.results > 0).sort((a, b) => a.currency.localeCompare(b.currency));

  // Changes against the previous sale of the same tenor.
  const comparable = compared.filter((r) => r.bps !== null);
  const changes = {
    comparable: comparable.length,
    rose: comparable.filter((r) => r.bps! > 0).length,
    fell: comparable.filter((r) => r.bps! < 0).length,
    unchanged: comparable.filter((r) => r.bps === 0).length,
  };
  const largestChange = [...comparable].sort((a, b) => Math.abs(b.bps!) - Math.abs(a.bps!) || byOrder(a, b))[0] ?? null;

  // Week over week: series sold in both windows, the newest result in each.
  const latestIn = (pred: (r: AuctionResult) => boolean) => {
    const out = new Map<string, AuctionResult>();
    for (const r of valid) if (pred(r) && (!out.has(seriesKey(r)) || out.get(seriesKey(r))!.date < r.date)) out.set(seriesKey(r), r);
    return out;
  };
  const nowBy = latestIn(inWeek);
  const prevBy = latestIn(inPrev);
  const pairs: WeekMove[] = [...nowBy.entries()].flatMap(([k, r]) => {
    const p = prevBy.get(k);
    return p ? [{ result: r, prev: p, bps: roundBps(r.rate, p.rate) }] : [];
  });
  const weekMove = pairs.sort((a, b) => Math.abs(b.bps) - Math.abs(a.bps) || byOrder(a.result, b.result))[0] ?? null;

  // Bid cover, compared at the two decimals shown.
  const covered = compared.filter((r) => r.bidCover !== null && r.bidCover > 0);
  const cov = (r: AuctionResult) => Math.round(r.bidCover! * 100) / 100;
  const pick = (sorted: Compared[]): CoverPick | null => (sorted[0] ? { result: sorted[0], ties: sorted.filter((r) => cov(r) === cov(sorted[0])).length - 1 } : null);
  const coverHigh = pick([...covered].sort((a, b) => cov(b) - cov(a) || byOrder(a, b)));
  const coverLow = pick([...covered].sort((a, b) => cov(a) - cov(b) || byOrder(a, b)));

  const out: AuctionWeek = {
    window,
    previous,
    auctions: markets.reduce((n, m) => n + m.auctions, 0),
    marketsActive: markets.length,
    resultCount: compared.length,
    accepted,
    changes,
    largestChange,
    weekMove,
    weekPairs: pairs.length,
    coverHigh,
    coverLow,
    markets,
    summary: [],
  };
  out.summary = summarise(out, metas);
  return out;
}

/** Template sentences, each built only from the numbers above. No adjectives, no forecasts. */
export function summarise(w: AuctionWeek, metas: Map<string, MarketMeta>): string[] {
  const name = (r: AuctionResult) => resultName(r, metas);
  const dir = (bps: number) => (bps > 0 ? `up ${fmtBpsAbs(bps)} basis ${fmtBpsAbs(bps) === "1" ? "point" : "points"}` : bps < 0 ? `down ${fmtBpsAbs(bps)} basis ${fmtBpsAbs(bps) === "1" ? "point" : "points"}` : "unchanged");
  const out: string[] = [];
  out.push(
    `In the seven days from ${longDate(w.window.start)} to ${longDate(w.window.end)}, ${plural(w.auctions, "auction")} ${w.auctions === 1 ? "was" : "were"} recorded in ${plural(w.marketsActive, "market")}, with ${plural(w.resultCount, "result")} by tenor.`,
  );

  const group = (d: MarketWeek["direction"]) => w.markets.filter((m) => m.direction === d).map((m) => m.meta.country);
  const rose = group("rose");
  const fell = group("fell");
  const mixed = group("mixed");
  const flat = group("unchanged");
  const withCompare = rose.length + fell.length + mixed.length + flat.length;
  if (withCompare) {
    const parts: string[] = [];
    if (rose.length) parts.push(`rose at every tenor sold in ${count(rose.length)} (${list(rose)})`);
    if (fell.length) parts.push(`fell at every tenor sold in ${count(fell.length)} (${list(fell)})`);
    if (mixed.length) parts.push(`rose at some tenors and fell or held at others in ${count(mixed.length)} (${list(mixed)})`);
    if (flat.length) parts.push(`were unchanged in ${count(flat.length)} (${list(flat)})`);
    out.push(`Against each market’s previous sale of the same tenor, rates ${list(parts)}${withCompare < w.marketsActive ? `, of the ${count(withCompare)} markets with an earlier sale to compare` : ""}.`);
    out.push(
      `By result, ${w.changes.rose} of ${w.changes.comparable} rose, ${w.changes.fell} fell and ${w.changes.unchanged} ${w.changes.unchanged === 1 ? "was" : "were"} unchanged.`,
    );
  }
  const none = group("none");
  if (none.length) out.push(`${list(none)} had no earlier sale of the same tenor to compare with.`);

  if (w.largestChange && w.largestChange.bps !== 0) {
    const r = w.largestChange;
    out.push(`The largest change was ${name(r)}, ${dir(r.bps!)} to ${fmtRate(r.rate)} (previous sale ${shortDate(r.prev!.date)}).`);
  }
  if (w.weekMove) {
    const m = w.weekMove;
    const same = w.largestChange && seriesKey(w.largestChange) === seriesKey(m.result) && w.largestChange.date === m.result.date && w.largestChange.prev?.date === m.prev.date;
    if (!same) {
      out.push(
        `Among the ${plural(w.weekPairs, "tenor")} sold in both this week and the week before (${rangeLabel(w.previous.start, w.previous.end)}), the largest move was ${name(m.result)}, ${dir(m.bps)} to ${fmtRate(m.result.rate)}.`,
      );
    }
  }
  if (w.coverLow && w.coverHigh && w.coverLow.result !== w.coverHigh.result) {
    const tie = (p: CoverPick) => (p.ties ? ` and ${plural(p.ties, "other result")}` : "");
    out.push(
      `Bid cover, the bids received divided by the amount accepted, ranged from ${w.coverLow.result.bidCover!.toFixed(2)} (${name(w.coverLow.result)}${tie(w.coverLow)}) to ${w.coverHigh.result.bidCover!.toFixed(2)} (${name(w.coverHigh.result)}${tie(w.coverHigh)}).`,
    );
  }
  if (w.accepted.length) {
    out.push(`Amounts accepted, by currency and not converted: ${w.accepted.map((c) => fmtAmount(c.currency, c.total)).join("; ")}.`);
  }
  return out;
}

/* ---------- reading the data files ---------- */

const WAEMU_KEY = (issuer: string) =>
  issuer
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]+/g, "-")
    .replace(/^-|-$/g, "");

function bondTenor(years: number | null) {
  if (years === null) return { days: 0, label: "unstated-tenor" };
  if (years < 1) return { days: Math.round(years * 365), label: `${Math.round(years * 12)}-month` };
  return { days: Math.round(years * 365), label: `${Number.isInteger(years) ? years : Number(years.toFixed(1))}-year` };
}
const EGYPT_KIND: Record<string, string> = { fixed: "fixed-rate", floating: "floating-rate", zero: "zero-coupon" };

/** Every market's results as AuctionResults, plus their metadata. Reads the files once per build (the loaders are cached). */
export function loadAuctionResults(): { results: AuctionResult[]; markets: MarketMeta[] } {
  const metas = new Map<string, MarketMeta>();
  const results: AuctionResult[] = [];

  for (const m of billMarkets) {
    const meta = metas.get(m.slug) ?? { key: m.slug, country: m.country, group: null, currency: m.currency, bondSlug: null, billSlug: null, billHref: null, publishers: {}, rateNotes: {} };
    meta.billSlug = m.slug;
    meta.billHref = m.href;
    meta.publishers.bill = m.publisher;
    meta.rateNotes.bill = m.rateNote;
    metas.set(m.slug, meta);
    for (const r of loadBillMarket(m.slug).rows) {
      results.push({
        market: m.slug,
        instrument: "bill",
        date: r.date,
        dateKind: "value",
        series: String(r.tenor),
        tenorDays: r.tenor,
        tenorLabel: `${r.tenor}-day`,
        detail: null,
        rate: r.rate,
        offered: r.offered,
        received: r.received,
        accepted: r.accepted,
        bidCover: r.received !== null && r.accepted ? Math.round((r.received / r.accepted) * 1000) / 1000 : null,
        source: r.source,
      });
    }
  }

  for (const m of bondMarkets) {
    for (const r of loadBondMarket(m.slug).rows) {
      // A buyback is the government buying its own bonds, not a sale.
      if (m.slug === "kenya" && r.type === "buyback") continue;
      const waemu = m.slug === "waemu";
      const key = waemu ? WAEMU_KEY(r.issue ?? "waemu") : m.slug;
      if (!metas.has(key)) {
        metas.set(key, {
          key,
          country: waemu ? (r.issue ?? "WAEMU") : m.country,
          group: waemu ? "WAEMU" : null,
          currency: m.currency,
          bondSlug: null,
          billSlug: null,
          billHref: null,
          publishers: {},
          rateNotes: {},
        });
      }
      const meta = metas.get(key)!;
      meta.bondSlug = m.slug;
      meta.publishers.bond = m.publisher;
      meta.rateNotes.bond = m.rateNote;
      const t = bondTenor(r.tenor_years);
      // Kenya's tenor is the bond's original term and most sales reopen old lines, so "the same tenor" is the same bond.
      const kind = m.slug === "egypt" && r.issue ? (EGYPT_KIND[r.issue] ?? r.issue) : null;
      const detail = m.slug === "kenya" ? [r.issue, r.type === "switch" ? "switch" : null].filter(Boolean).join(", ") || null : kind;
      results.push({
        market: key,
        instrument: "bond",
        date: r.date,
        dateKind: m.dateKind ?? "auction",
        series: m.slug === "kenya" && r.issue ? r.issue : `${kind ?? ""}:${r.tenor_years ?? ""}`,
        tenorDays: t.days,
        tenorLabel: t.label,
        detail,
        rate: r.rate,
        offered: r.offered_m,
        received: r.received_m,
        accepted: r.accepted_m,
        bidCover: r.bid_cover,
        source: r.source,
      });
    }
  }
  return { results, markets: [...metas.values()] };
}

export function loadAuctionWeek() {
  const { results, markets } = loadAuctionResults();
  return buildAuctionWeek(results, markets);
}

/* ---------- self-check ---------- */

/** Runs the computation on a fixture with known answers. Returns the failures (empty when all pass). */
export function auctionWeekSelfCheck(): string[] {
  const fails: string[] = [];
  const eq = (label: string, got: unknown, want: unknown) => {
    if (JSON.stringify(got) !== JSON.stringify(want)) fails.push(`${label}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);
  };
  const meta = (key: string, country: string, currency: string): MarketMeta => ({ key, country, group: null, currency, bondSlug: key, billSlug: key, billHref: null, publishers: {}, rateNotes: {} });
  const r = (market: string, instrument: Instrument, date: string, series: string, rate: number, accepted: number | null, received: number | null, detail: string | null = null): AuctionResult => ({
    market,
    instrument,
    date,
    dateKind: "auction",
    series,
    tenorDays: instrument === "bill" ? Number(series) : Number(series) * 365,
    tenorLabel: instrument === "bill" ? `${series}-day` : `${series}-year`,
    detail,
    rate,
    offered: null,
    received,
    accepted,
    bidCover: received !== null && accepted ? Math.round((received / accepted) * 1000) / 1000 : null,
    source: "https://example.org/notice",
  });
  const rows = [
    // Aland: a bill sold weekly; this week 10.50 vs 10.40 last week (+10bp).
    r("aland", "bill", "2026-01-01", "91", 10.0, 100, 200),
    r("aland", "bill", "2026-01-08", "91", 10.4, 100, 300),
    r("aland", "bill", "2026-01-15", "91", 10.5, 50, 100),
    // Aland bond: last sold weeks ago, this week down 45bp; not a week-over-week pair.
    r("aland", "bond", "2025-12-01", "10", 16.0, 1000, 1500),
    r("aland", "bond", "2026-01-13", "10", 15.55, 2000, 2400),
    // Borduria: a first-ever 5-year (no comparison) and a bill up 2bp week over week.
    r("borduria", "bond", "2026-01-14", "5", 8.0, 10, 50),
    r("borduria", "bill", "2026-01-07", "182", 7.0, 5, 5),
    r("borduria", "bill", "2026-01-12", "182", 7.02, 20, 20),
    // Old noise, outside both windows.
    r("carpania", "bill", "2025-06-01", "364", 30, 1, 1),
  ];
  const w = buildAuctionWeek(rows, [meta("aland", "Aland", "AAA"), meta("borduria", "Borduria", "BBB"), meta("carpania", "Carpania", "CCC")]);
  if (!w) return ["fixture returned null"];
  eq("window", w.window, { start: "2026-01-09", end: "2026-01-15" });
  eq("previous", w.previous, { start: "2026-01-02", end: "2026-01-08" });
  eq("auctions", w.auctions, 4); // aland bill 15th, aland bond 13th, borduria bond 14th, borduria bill 12th
  eq("markets", w.marketsActive, 2);
  eq("results", w.resultCount, 4);
  eq("accepted", w.accepted, [
    { currency: "AAA", total: 2050, results: 2, missing: 0 },
    { currency: "BBB", total: 30, results: 2, missing: 0 },
  ]);
  eq("changes", w.changes, { comparable: 3, rose: 2, fell: 1, unchanged: 0 });
  eq("largest change bps", w.largestChange?.bps, -45);
  eq("largest change prev", w.largestChange?.prev, { date: "2025-12-01", rate: 16 });
  eq("week pairs", w.weekPairs, 2);
  eq("week move", w.weekMove && { market: w.weekMove.result.market, bps: w.weekMove.bps }, { market: "aland", bps: 10 });
  eq("cover high", w.coverHigh && { market: w.coverHigh.result.market, cover: w.coverHigh.result.bidCover, ties: w.coverHigh.ties }, { market: "borduria", cover: 5, ties: 0 });
  eq("cover low", w.coverLow && { cover: w.coverLow.result.bidCover, ties: w.coverLow.ties }, { cover: 1, ties: 0 });
  eq(
    "directions",
    w.markets.map((m) => [m.meta.key, m.direction]),
    [
      ["aland", "mixed"],
      ["borduria", "rose"],
    ],
  );
  eq("summary[0]", w.summary[0], "In the seven days from 9 January 2026 to 15 January 2026, 4 auctions were recorded in 2 markets, with 4 results by tenor.");
  const text = w.summary.join(" ");
  for (const want of ["Aland’s 10-year bond, down 45 basis points to 15.55% (previous sale 1 Dec 2025)", "Aland’s 91-day bill, up 10 basis points to 10.50%", "AAA 2.1bn; BBB 30.0m"]) {
    if (!text.includes(want)) fails.push(`summary lacks "${want}": ${text}`);
  }
  eq("fmtRate", [fmtRate(12), fmtRate(16.925), fmtRate(8.7615), fmtRate(12.61123)], ["12.00%", "16.925%", "8.7615%", "12.6112%"]);
  eq("fmtBpsSigned", [fmtBpsSigned(45), fmtBpsSigned(-12.26), fmtBpsSigned(0)], ["+45", "−12.3", "0"]);
  eq("rangeLabel", [rangeLabel("2026-10-07", "2026-10-13"), rangeLabel("2026-09-30", "2026-10-06"), rangeLabel("2025-12-29", "2026-01-04")], ["7–13 Oct 2026", "30 Sep – 6 Oct 2026", "29 Dec 2025 – 4 Jan 2026"]);
  eq("empty", buildAuctionWeek([], []), null);
  return fails;
}
