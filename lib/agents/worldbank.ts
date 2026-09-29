import { countries } from "@/lib/demo/countries";

export type IndicatorSlug =
  | "inflation"
  | "gdp"
  | "fdi"
  | "public-debt"
  | "population"
  | "unemployment"
  | "gdp-per-capita"
  | "exports"
  | "current-account"
  | "electricity";

export type SourcedPrint = {
  indicatorSlug: IndicatorSlug;
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

type SeriesDef = { indicatorSlug: IndicatorSlug; code: string };

/** Full-continent annual file. Policy rate is intentionally absent. */
const CORE: SeriesDef[] = [
  { indicatorSlug: "inflation", code: "FP.CPI.TOTL.ZG" },
  { indicatorSlug: "gdp", code: "NY.GDP.MKTP.CD" },
  { indicatorSlug: "fdi", code: "BX.KLT.DINV.CD.WD" },
  { indicatorSlug: "public-debt", code: "GC.DOD.TOTL.GD.ZS" },
];

/** Extra official series for the featured desks. A null cell is dropped. */
const CATALOGUE: SeriesDef[] = [
  { indicatorSlug: "population", code: "SP.POP.TOTL" },
  { indicatorSlug: "unemployment", code: "SL.UEM.TOTL.ZS" },
  { indicatorSlug: "gdp-per-capita", code: "NY.GDP.PCAP.CD" },
  { indicatorSlug: "exports", code: "NE.EXP.GNFS.ZS" },
  { indicatorSlug: "current-account", code: "BN.CAB.XOKA.GD.ZS" },
  { indicatorSlug: "electricity", code: "EG.ELC.ACCS.ZS" },
];

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

function parseSeries(body: unknown, series: SeriesDef): SourcedPrint[] {
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

async function fetchSeriesChunk(series: SeriesDef, countryPath: string): Promise<SourcedPrint[]> {
  const url = `https://api.worldbank.org/v2/country/${countryPath}/indicator/${series.code}?format=json&mrnev=1&per_page=60`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12000),
    next: { revalidate: 3600 },
  });
  if (!response.ok) throw new Error(`World Bank responded ${response.status}`);
  const body: unknown = await response.json();
  return parseSeries(body, series);
}

const featuredPath = "KE;NG;ZA;EG;GH;RW;TZ;UG";

/** Kenya and the other featured desks only. A failed response contributes nothing. */
async function loadSeries(seriesList: SeriesDef[], countryPath: string): Promise<SourcedPrint[]> {
  const batches = await Promise.all(seriesList.map(async (series) => {
    try {
      return await fetchSeriesChunk(series, countryPath);
    } catch {
      try {
        return await fetchSeriesChunk(series, countryPath);
      } catch {
        return [];
      }
    }
  }));
  return latestPrints(batches.flat());
}

export async function loadFeaturedPrints(): Promise<SourcedPrint[]> {
  return loadSeries(CORE, featuredPath);
}

/** Population, unemployment, GDP per capita, exports, current account, electricity. Featured desks only. */
export async function loadCataloguePrints(): Promise<SourcedPrint[]> {
  return loadSeries(CATALOGUE, featuredPath);
}

/** Featured core series plus the catalogue. Used where the page should fill quickly. */
export async function loadDeskPrints(): Promise<SourcedPrint[]> {
  const [core, catalogue] = await Promise.all([loadFeaturedPrints(), loadCataloguePrints()]);
  return latestPrints([...core, ...catalogue]);
}

/** Latest non-null annual values. A failed or empty response contributes nothing. */
export async function loadPrints(): Promise<SourcedPrint[]> {
  const jobs = [
    ...CORE.flatMap((series) => countryChunks(6).map((countryPath) => ({ series, countryPath }))),
    ...CORE.map((series) => ({ series, countryPath: featuredPath })),
  ];
  const batches = await Promise.all(jobs.map(async (job) => {
    try {
      return await fetchSeriesChunk(job.series, job.countryPath);
    } catch {
      try {
        return await fetchSeriesChunk(job.series, job.countryPath);
      } catch {
        return [];
      }
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
