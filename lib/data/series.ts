import { countries, type CountryProfile } from "@/lib/data/countries";
import { fetchJson } from "./fetcher";
import { getIndicatorDef, indicatorDefs, type IndicatorDef } from "./indicators";

/**
 * Continental time series from the World Bank Open Data API
 * (World Development Indicators and International Debt Statistics).
 * 54 countries, 2010 to the latest published year.
 */

export type Point = { year: number; value: number };

export type CountrySeries = {
  country: CountryProfile;
  points: Point[]; // ascending by year
};

export type IndicatorFile = {
  def: IndicatorDef;
  series: CountrySeries[];
  /** Latest year with any value across the continent. */
  latestYear: number | null;
  sourceUrl: string;
  retrievedAt: string;
};

export type Reading = {
  def: IndicatorDef;
  country: CountryProfile;
  year: number;
  value: number;
  previous?: Point;
  points: Point[];
};

const START_YEAR = 2010;
const REVALIDATE = 60 * 60 * 24; // publisher updates are quarterly at most

export const worldBankSource = {
  name: "World Bank Open Data",
  url: "https://data.worldbank.org/",
  api: "https://api.worldbank.org/v2/",
};

const byIso = new Map(countries.map((country) => [country.iso.toUpperCase(), country]));

function chunks<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let index = 0; index < list.length; index += size) out.push(list.slice(index, index + size));
  return out;
}

type WbRow = { country?: { id?: string }; date?: string; value?: number | null };

function apiUrl(code: string, isoList: string[]) {
  const year = new Date().getUTCFullYear();
  return `https://api.worldbank.org/v2/country/${isoList.join(";")}/indicator/${code}?format=json&date=${START_YEAR}:${year}&per_page=1000`;
}

export function indicatorPageUrl(def: IndicatorDef, iso?: string) {
  return iso
    ? `https://data.worldbank.org/indicator/${def.code}?locations=${iso}`
    : `https://data.worldbank.org/indicator/${def.code}?locations=ZG-ZQ`;
}

/** Reads one group of countries; if the publisher rejects the request (its firewall blocks some code
 *  combinations), the group is split in half and retried, down to single countries. */
async function loadGroup(code: string, isoList: string[]): Promise<unknown[][]> {
  const started = Date.now();
  const body = await fetchJson<unknown[]>(apiUrl(code, isoList), { revalidate: REVALIDATE, retries: 1, timeoutMs: 12000 });
  if (Array.isArray(body) && Array.isArray(body[1])) return [body];
  const meta = Array.isArray(body) ? (body[0] as { total?: number } | undefined) : undefined;
  if (meta && meta.total === 0) return []; // valid reply, no rows
  if (isoList.length === 1) return [];
  // A slow failure means the publisher is down or unreachable, not a firewall rule: don't fan out.
  if (Date.now() - started > 8000) return [];
  const mid = Math.ceil(isoList.length / 2);
  const [left, right] = await Promise.all([loadGroup(code, isoList.slice(0, mid)), loadGroup(code, isoList.slice(mid))]);
  return [...left, ...right];
}

async function loadRaw(def: IndicatorDef): Promise<Map<string, Point[]>> {
  const groups = chunks(countries.map((country) => country.iso), 18);
  const bodies = (await Promise.all(groups.map((isoList) => loadGroup(def.code, isoList)))).flat();
  const out = new Map<string, Point[]>();
  for (const body of bodies) {
    if (!Array.isArray(body) || !Array.isArray(body[1])) continue;
    for (const row of body[1] as WbRow[]) {
      const iso = row.country?.id?.toUpperCase();
      if (!iso || !byIso.has(iso)) continue;
      if (typeof row.value !== "number" || !Number.isFinite(row.value)) continue;
      const year = Number(row.date);
      if (!Number.isInteger(year)) continue;
      const list = out.get(iso) ?? [];
      list.push({ year, value: row.value });
      out.set(iso, list);
    }
  }
  for (const list of out.values()) list.sort((a, b) => a.year - b.year);
  return out;
}

export async function loadIndicator(slug: string): Promise<IndicatorFile | null> {
  const def = getIndicatorDef(slug);
  if (!def) return null;
  const raw = await loadRaw(def);
  const series = countries.map((country) => ({ country, points: raw.get(country.iso.toUpperCase()) ?? [] }));
  const years = series.flatMap((item) => item.points.map((point) => point.year));
  return {
    def,
    series,
    latestYear: years.length ? Math.max(...years) : null,
    sourceUrl: indicatorPageUrl(def),
    retrievedAt: new Date().toISOString(),
  };
}

export async function loadIndicators(slugs: string[] = indicatorDefs.map((def) => def.slug)) {
  const files = await Promise.all(slugs.map((slug) => loadIndicator(slug)));
  return files.filter((file): file is IndicatorFile => file !== null);
}

/** Latest reading per country for one indicator, with the prior year for change. */
export function latestReadings(file: IndicatorFile): Reading[] {
  return file.series.flatMap((item) => {
    const last = item.points.at(-1);
    if (!last) return [];
    return [
      {
        def: file.def,
        country: item.country,
        year: last.year,
        value: last.value,
        previous: item.points.at(-2),
        points: item.points,
      },
    ];
  });
}

/** Rank countries on their latest reading. Stale readings (older than `maxAge` years behind the leader) are dropped. */
export function ranked(file: IndicatorFile, maxAge = 3): Reading[] {
  const readings = latestReadings(file);
  const newest = Math.max(0, ...readings.map((reading) => reading.year));
  return readings
    .filter((reading) => newest - reading.year <= maxAge)
    .sort((a, b) => b.value - a.value);
}

export function readingFor(file: IndicatorFile, iso: string): Reading | null {
  return latestReadings(file).find((reading) => reading.country.iso === iso) ?? null;
}

/** Continental total for summable series, using only countries that reported in that year. */
export function continentalTotal(file: IndicatorFile, year: number) {
  let sum = 0;
  let reporting = 0;
  for (const item of file.series) {
    const point = item.points.find((entry) => entry.year === year);
    if (point) {
      sum += point.value;
      reporting += 1;
    }
  }
  return { sum, reporting };
}

/** Median of latest readings — a fair continental reference for rates and ratios. */
export function continentalMedian(file: IndicatorFile) {
  const values = ranked(file).map((reading) => reading.value).sort((a, b) => a - b);
  if (values.length === 0) return null;
  const mid = Math.floor(values.length / 2);
  return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
}

export type Mover = Reading & { previous: Point; delta: number };

/** Largest year-on-year moves on the latest print. For percentages, moves are in points; for levels, in percent. */
export function movers(file: IndicatorFile, limit = 5): Mover[] {
  const readings = ranked(file, 1).filter((reading): reading is Mover => {
    const prev = reading.previous;
    return Boolean(prev && prev.year === reading.year - 1);
  });
  const scored = readings.map((reading) => {
    const prev = reading.previous;
    const delta =
      file.def.format === "percent" || file.def.format === "months"
        ? reading.value - prev.value
        : prev.value === 0
          ? 0
          : ((reading.value - prev.value) / Math.abs(prev.value)) * 100;
    return { ...reading, delta };
  });
  return scored.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, limit);
}

/** All indicator readings for one country — the country file. */
export async function countryReadings(iso: string, slugs?: string[]) {
  const files = await loadIndicators(slugs);
  return files.map((file) => ({ file, reading: readingFor(file, iso) }));
}

/** CSV of the full file, with a provenance header. */
export function toCsv(file: IndicatorFile) {
  const years = [...new Set(file.series.flatMap((item) => item.points.map((point) => point.year)))].sort();
  const header = ["country", "iso2", "region", ...years.map(String)];
  const lines = file.series.map((item) => {
    const byYear = new Map(item.points.map((point) => [point.year, point.value]));
    return [
      `"${item.country.name}"`,
      item.country.iso,
      `"${item.country.region}"`,
      ...years.map((year) => (byYear.has(year) ? String(byYear.get(year)) : "")),
    ].join(",");
  });
  return [
    `# ${file.def.label}`,
    `# Series ${file.def.code}. Source: ${worldBankSource.name}, ${file.sourceUrl}`,
    `# Compiled by Afronomics (afronomicsfeed.com). Retrieved ${file.retrievedAt}. Blank = not published.`,
    header.join(","),
    ...lines,
  ].join("\n");
}

/** Latest year whose continental total is well covered (at least 90% of the best-covered year). */
export function coveredTotal(file: IndicatorFile) {
  if (!file.latestYear) return null;
  const candidates = [0, 1, 2, 3].map((back) => ({ year: file.latestYear! - back, ...continentalTotal(file, file.latestYear! - back) }));
  const best = Math.max(...candidates.map((item) => item.reporting));
  if (best === 0) return null;
  return candidates.find((item) => item.reporting >= best * 0.9) ?? null;
}
