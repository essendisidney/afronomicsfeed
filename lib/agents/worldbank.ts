import { countries } from "@/lib/demo/countries";

export type SourcedPrint = {
  indicatorSlug: "inflation" | "gdp" | "fdi" | "public-debt";
  countrySlug: string;
  countryName: string;
  iso: string;
  year: string;
  observationDate: string;
  value: number;
  unit: string;
  seriesCode: string;
  seriesName: string;
  sourceUrl: string;
};

const SERIES = [
  { indicatorSlug: "inflation", code: "FP.CPI.TOTL.ZG" },
  { indicatorSlug: "gdp", code: "NY.GDP.MKTP.CD" },
  { indicatorSlug: "fdi", code: "BX.KLT.DINV.CD.WD" },
  { indicatorSlug: "public-debt", code: "GC.DOD.TOTL.GD.ZS" },
] as const;

const byIso = new Map(countries.map((country) => [country.iso.toUpperCase(), country]));

function countryChunks(size: number) {
  const codes = countries.map((country) => country.iso);
  const chunks: string[] = [];
  for (let index = 0; index < codes.length; index += size) {
    chunks.push(codes.slice(index, index + size).join(";"));
  }
  return chunks;
}

type WorldBankRow = {
  country?: { id?: string };
  date?: string;
  value?: number | null;
  indicator?: { id?: string; value?: string };
};

function unitFromSeriesName(seriesName: string): string {
  const match = seriesName.match(/\(([^)]+)\)\s*$/);
  return match?.[1] ?? seriesName;
}

function parseSeries(body: unknown, series: (typeof SERIES)[number]): SourcedPrint[] {
  if (!Array.isArray(body) || !Array.isArray(body[1])) return [];
  const prints: SourcedPrint[] = [];
  for (const row of body[1] as WorldBankRow[]) {
    if (typeof row.value !== "number" || !Number.isFinite(row.value)) continue;
    if (!row.date || !/^\d{4}$/.test(row.date)) continue;
    const iso = row.country?.id?.toUpperCase();
    if (!iso) continue;
    const country = byIso.get(iso);
    if (!country) continue;
    const seriesName = row.indicator?.value?.trim() || series.code;
    prints.push({
      indicatorSlug: series.indicatorSlug,
      countrySlug: country.slug,
      countryName: country.name,
      iso,
      year: row.date,
      observationDate: `${row.date}-01-01`,
      value: row.value,
      unit: unitFromSeriesName(seriesName),
      seriesCode: series.code,
      seriesName,
      sourceUrl: `https://api.worldbank.org/v2/country/${iso}/indicator/${series.code}?format=json`,
    });
  }
  return prints;
}

async function fetchSeriesChunk(series: (typeof SERIES)[number], countryPath: string): Promise<SourcedPrint[]> {
  const url = `https://api.worldbank.org/v2/country/${countryPath}/indicator/${series.code}?format=json&mrnev=1&per_page=60`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
    next: { revalidate: 86400 },
  });
  if (!response.ok) return [];
  const body: unknown = await response.json();
  return parseSeries(body, series);
}

/** Latest non-null annual values. A failed or empty response contributes nothing. */
export async function loadPrints(): Promise<SourcedPrint[]> {
  const jobs = SERIES.flatMap((series) => countryChunks(6).map((countryPath) => ({ series, countryPath })));
  const batches = await Promise.all(jobs.map(async (job) => {
    try {
      return await fetchSeriesChunk(job.series, job.countryPath);
    } catch {
      return [];
    }
  }));
  return latestPrints(batches.flat());
}

/** One vintage per country and series: the newest year that contained a finite value. */
export function latestPrints(prints: SourcedPrint[]): SourcedPrint[] {
  const best = new Map<string, SourcedPrint>();
  for (const print of prints) {
    const key = `${print.indicatorSlug}|${print.iso}`;
    const current = best.get(key);
    if (!current || print.year > current.year) best.set(key, print);
  }
  return [...best.values()];
}

export function sortPrints(prints: SourcedPrint[]): SourcedPrint[] {
  return [...prints].sort((a, b) => {
    if (a.iso === "KE" && b.iso !== "KE") return -1;
    if (b.iso === "KE" && a.iso !== "KE") return 1;
    return a.countryName.localeCompare(b.countryName) || a.indicatorSlug.localeCompare(b.indicatorSlug);
  });
}

export function formatPrint(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(value);
}

export function findPrint(
  prints: SourcedPrint[],
  indicatorSlug: string,
  countrySlug: string,
): SourcedPrint | undefined {
  return prints.find((print) => print.indicatorSlug === indicatorSlug && print.countrySlug === countrySlug);
}

export const worldBankDoor = "https://api.worldbank.org/v2/";
