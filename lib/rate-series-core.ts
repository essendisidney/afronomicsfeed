/**
 * Rate series, pure half: the shape every followable, comparable number takes, and the arithmetic the sparklines,
 * headline tiles, compare view and "follow this number" emails share. No file or network access here, so the
 * alert due-check and the tests can use it directly. The catalogue itself (which series exist and where their
 * history is read from) lives in lib/data/rate-series.ts.
 */

export type SeriesPoint = { date: string; value: number }; // date YYYY-MM-DD; ascending in a series

/** "pct": a rate in % a year, changes in basis points. "index": a level, changes in per cent. */
export type SeriesUnit = "pct" | "index";

export type Frequency = "auction" | "daily" | "monthly" | "reading";

export type RateSeries = {
  id: string;
  /** Full name, e.g. "Kenya 91-day Treasury bill". */
  label: string;
  /** Short name for chips and table cells, e.g. "91-day bill". */
  short: string;
  group: string;
  unit: SeriesUnit;
  /** What the unit is, in words, e.g. "% a year" or "index, Feb 2019 = 100". */
  unitLabel: string;
  /** What one point is, in words, e.g. "weighted average rate of accepted bids". */
  measure: string;
  frequency: Frequency;
  source: { name: string; href: string };
  /** The page the series lives on. */
  href: string;
  /** How many of the latest points the sparkline draws. */
  sparkPoints: number;
  /** When set, the latest figure was confirmed more recently than its last point (policy rates are re-read daily). */
  confirmedOn?: string;
  note?: string;
  points: SeriesPoint[]; // ascending by date, one per date
};

/** A sparkline needs at least this many stored points; with fewer, none is drawn. */
export const MIN_SPARK_POINTS = 3;

export const seriesIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+){0,8}$/;

export function sparkPoints(s: Pick<RateSeries, "points" | "sparkPoints">): SeriesPoint[] {
  const pts = s.points.slice(-s.sparkPoints);
  return pts.length >= MIN_SPARK_POINTS ? pts : [];
}

export type Change = {
  latest: SeriesPoint;
  previous: SeriesPoint | null;
  /** Basis points for a rate, per cent for a level; null with no previous print. */
  delta: number | null;
  direction: "up" | "down" | "flat" | null;
  /** e.g. "+12 bps" or "−0.4%". */
  text: string | null;
};

export function seriesChange(s: Pick<RateSeries, "points" | "unit">): Change | null {
  const latest = s.points.at(-1);
  if (!latest) return null;
  const previous = s.points.at(-2) ?? null;
  if (!previous) return { latest, previous: null, delta: null, direction: null, text: null };
  const delta = s.unit === "pct" ? Math.round((latest.value - previous.value) * 100) : previous.value ? Math.round(((latest.value - previous.value) / previous.value) * 1000) / 10 : 0;
  const direction = delta > 0 ? "up" : delta < 0 ? "down" : "flat";
  return { latest, previous, delta, direction, text: changeText(delta, s.unit) };
}

export function changeText(delta: number, unit: SeriesUnit) {
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "±";
  return unit === "pct" ? `${sign}${Math.abs(delta)} bps` : `${sign}${Math.abs(delta).toFixed(1)}%`;
}

export function formatValue(value: number, unit: SeriesUnit, digits?: number) {
  return unit === "pct" ? `${value.toFixed(digits ?? 2)}%` : value.toFixed(digits ?? 1);
}

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const shortDayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

/** A point's date as readers expect for the series' rhythm: "Aug 2026" for monthly, "12 Oct 2026" otherwise. */
export function pointDate(date: string, frequency: Frequency, short = false) {
  const d = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  if (frequency === "monthly") return monthFmt.format(d);
  return short ? shortDayFmt.format(d) : dayFmt.format(d);
}

/** "vs the 12 Oct auction", "vs Aug 2026", "vs 15 Oct": what the change is measured against. */
export function changePeriod(s: Pick<RateSeries, "frequency">, previous: SeriesPoint) {
  const when = pointDate(previous.date, s.frequency, true);
  if (s.frequency === "auction") return `vs ${when} auction`;
  if (s.frequency === "reading") return `vs reading of ${when}`;
  return `vs ${when}`;
}

/** What a sparkline spans, e.g. "last 26 auctions" or "7 daily readings". */
export function sparkSpan(s: Pick<RateSeries, "frequency">, n: number) {
  if (s.frequency === "auction") return `last ${n} auctions`;
  if (s.frequency === "monthly") return `last ${n} months`;
  if (s.frequency === "daily") return `last ${n} daily readings`;
  return `last ${n} readings`;
}

/**
 * The key a "follow" alert remembers: the date and value it last told the reader about (or, for a new alert,
 * what was published when it was set). The alert is due when a newer print has a different value.
 */
export function followKey(p: SeriesPoint) {
  return `series:${p.date}:${p.value}`;
}

export function parseFollowKey(key: string | null): SeriesPoint | null {
  const m = key?.match(/^series:(\d{4}-\d{2}-\d{2}):(-?\d+(?:\.\d+)?)$/);
  return m ? { date: m[1], value: Number(m[2]) } : null;
}

/** Compare view: one axis when both series share a unit, two when they differ. */
export function sharedAxis(a: Pick<RateSeries, "unit" | "unitLabel">, b: Pick<RateSeries, "unit" | "unitLabel">) {
  return a.unit === b.unit && a.unitLabel === b.unitLabel;
}

/** Suggested pairs for the compare view; the first is the default. Ids that do not exist are skipped. */
export const defaultPairs: [string, string][] = [
  ["kenya-91d", "kenya-cbr"],
  ["kenya-91d", "kenya-mmf"],
  ["kenya-364d", "kenya-bank-deposit"],
  ["kenya-91d", "kenya-364d"],
  ["kenya-364d", "nigeria-364d"],
  ["kenya-bank-lending", "kenya-cpi"],
];

export const compareRanges = [
  { id: "1y", label: "1 year", months: 12 },
  { id: "3y", label: "3 years", months: 36 },
  { id: "5y", label: "5 years", months: 60 },
  { id: "all", label: "All", months: null },
] as const;
export type CompareRange = (typeof compareRanges)[number]["id"];

export function compareHref(a: string, b: string, range?: CompareRange) {
  return `/rates/compare?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}${range && range !== "1y" ? `&range=${range}` : ""}`;
}

/** The first date in a range ending at `end` (YYYY-MM-DD). */
export function rangeStart(end: string, range: CompareRange) {
  const r = compareRanges.find((x) => x.id === range);
  if (!r || r.months == null) return "0000-00-00";
  const d = new Date(`${end}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - r.months);
  return d.toISOString().slice(0, 10);
}
