import { countries, type CountryProfile } from "@/lib/data/countries";
import { fetchJson } from "./fetcher";

/**
 * Development-finance capital: World Bank Group lending to African sovereigns,
 * from the World Bank Projects API (v3). Covers the pipeline (projects heading
 * to the Board) and recent approvals, with amounts as the Bank publishes them.
 */

export type ProjectTheme = "Climate & energy" | "Water & agriculture" | "Transport & urban" | "Digital" | "Finance & fiscal" | "Health & education" | "Social protection" | "Other";

export type Project = {
  id: string;
  name: string;
  country: CountryProfile;
  status: "Pipeline" | "Active" | "Closed" | string;
  approvalDate: string | null; // ISO date
  amountUsd: number; // IBRD + IDA commitment as published
  abstract: string;
  url: string;
  theme: ProjectTheme;
  climate: boolean;
};

export const projectsSource = {
  name: "World Bank Projects & Operations",
  url: "https://projects.worldbank.org/en/projects-operations/projects-home",
};

const REVALIDATE = 60 * 60 * 6;
const FIELDS = "id,project_name,status,countrycode,boardapprovaldate,totalamt,project_abstract";
const byIso = new Map(countries.map((country) => [country.iso.toUpperCase(), country]));

const REGIONS = ["Eastern and Southern Africa", "Western and Central Africa"];
const NORTH_AFRICA = ["EG", "MA", "TN", "DZ", "LY", "MR", "DJ"];

type Raw = {
  id?: string;
  project_name?: string;
  status?: string;
  countrycode?: string[] | string;
  boardapprovaldate?: string;
  totalamt?: string | number;
  project_abstract?: string | { cdata?: string };
};

const THEME_RULES: Array<[ProjectTheme, RegExp]> = [
  ["Climate & energy", /\b(climate|resilien|energy|electri|solar|renewable|power|grid|geotherm|hydro|clean cooking|carbon|emission|green)/i],
  ["Water & agriculture", /\b(water|irrigat|agri|food|farm|livestock|fisher|sanitation|drought|land)/i],
  ["Transport & urban", /\b(road|transport|rail|port|urban|city|cities|mobility|corridor|housing)/i],
  ["Digital", /\b(digital|broadband|ict|data|connectivity|e-government|identification)/i],
  ["Finance & fiscal", /\b(fiscal|finance|financial|budget|debt|macro|DPO|development policy|bank|credit|msme|sme|private sector|investment climate)/i],
  ["Health & education", /\b(health|hospital|nutrition|educat|school|skills|learning|universit)/i],
  ["Social protection", /\b(social protection|safety net|cash transfer|refugee|displace|jobs)/i],
];

const CLIMATE = /\b(climate|resilien|adapt|renewable|solar|geotherm|clean|green|emission|carbon|flood|drought|energy access)/i;

function parseAmount(value: Raw["totalamt"]) {
  if (typeof value === "number") return value;
  const n = Number(String(value ?? "0").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function text(value: Raw["project_abstract"]) {
  if (!value) return "";
  return typeof value === "string" ? value : value.cdata ?? "";
}

function normalize(raw: Raw): Project | null {
  const code = Array.isArray(raw.countrycode) ? raw.countrycode[0] : raw.countrycode;
  const country = code ? byIso.get(code.toUpperCase()) : undefined;
  if (!raw.id || !raw.project_name || !country) return null;
  const abstract = text(raw.project_abstract).replace(/\s+/g, " ").trim();
  const haystack = `${raw.project_name} ${abstract}`;
  const theme = THEME_RULES.find(([, rule]) => rule.test(haystack))?.[0] ?? "Other";
  return {
    id: raw.id,
    name: raw.project_name.trim(),
    country,
    status: raw.status ?? (raw.boardapprovaldate && new Date(raw.boardapprovaldate) > new Date() ? "Pipeline" : "Active"),
    approvalDate: raw.boardapprovaldate ? raw.boardapprovaldate.slice(0, 10) : null,
    amountUsd: parseAmount(raw.totalamt),
    abstract,
    url: `https://projects.worldbank.org/en/projects-operations/project-detail/${raw.id}`,
    theme,
    climate: CLIMATE.test(haystack),
  };
}

function url(params: Record<string, string>) {
  const query = new URLSearchParams({
    format: "json",
    fl: FIELDS,
    srt: "boardapprovaldate",
    order: "desc",
    ...params,
  });
  return `https://search.worldbank.org/api/v3/projects?${query.toString()}`;
}

async function query(params: Record<string, string>): Promise<Project[]> {
  const body = await fetchJson<{ projects?: Record<string, Raw> }>(url(params), { revalidate: REVALIDATE, retries: 1, timeoutMs: 20000 });
  if (!body?.projects) return [];
  return Object.values(body.projects).flatMap((raw) => {
    const project = normalize(raw);
    return project ? [project] : [];
  });
}

function recentOrPipeline(project: Project, sinceYear: number) {
  if (project.status === "Pipeline") return true;
  if (project.status === "Closed" || project.status === "Dropped") return false;
  return Boolean(project.approvalDate && Number(project.approvalDate.slice(0, 4)) >= sinceYear);
}

function dedupe(list: Project[]) {
  const seen = new Map<string, Project>();
  for (const project of list) seen.set(project.id, project);
  return [...seen.values()].sort((a, b) => (b.approvalDate ?? "").localeCompare(a.approvalDate ?? ""));
}

/** Continental book: pipeline plus approvals since `sinceYear`. */
export async function loadAfricaProjects(sinceYear = new Date().getUTCFullYear() - 2): Promise<Project[]> {
  const batches = await Promise.all([
    ...REGIONS.map((region) => query({ regionname_exact: region, rows: "300" })),
    ...NORTH_AFRICA.map((iso) => query({ countrycode_exact: iso, rows: "40" })),
  ]);
  return dedupe(batches.flat()).filter((project) => recentOrPipeline(project, sinceYear));
}

export async function loadCountryProjects(iso: string, rows = 25): Promise<Project[]> {
  const list = await query({ countrycode_exact: iso.toUpperCase(), rows: String(rows) });
  return dedupe(list).filter((project) => project.status !== "Dropped");
}

export function sumAmounts(list: Project[]) {
  return list.reduce((total, project) => total + project.amountUsd, 0);
}

export function groupBy<T, K extends string>(list: T[], key: (item: T) => K) {
  const out = new Map<K, T[]>();
  for (const item of list) {
    const k = key(item);
    out.set(k, [...(out.get(k) ?? []), item]);
  }
  return out;
}
