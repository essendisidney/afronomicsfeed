import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import type { Evidence } from "@/components/evidence/EvidenceTag";

/**
 * The casebook (rebuild brief, section 5; docs/rebuild/phase-2-plan.md). One file per case in content/cases/<id>.md,
 * frontmatter only, plus an optional "## Analysis" body. Every figure carries a source link and an as-of date, and
 * every timeline event a date and a source; a case that breaks a rule is refused here (the build fails) and by
 * scripts/case_check.py in CI. A case is public only when it is published and signed off by the founder; drafts are
 * shown on preview deployments and on the desk.
 */

const CASES_DIR = path.join(process.cwd(), "content", "cases");

export type CaseSource = { name: string; url: string };
export type CaseFigure = { metric: string; value: string; as_of: string; source: CaseSource };
export type CaseEvent = { date: string; title: string; detail?: string; source: CaseSource };
export type CaseLoss = { group: string; amount?: string; as_of?: string; source: CaseSource };
export type CaseResponse = { date: string; text: string; source: CaseSource };

export type Case = {
  id: string;
  title: string;
  status: "draft" | "published";
  signed_off?: { by: string; date: string };
  country: string;
  sector: string;
  institutions: string[];
  start: string;
  end: string | null;
  summary: string;
  conditions_before: CaseFigure[];
  trigger: { text: string; date: string; source: CaseSource };
  timeline: CaseEvent[];
  who_lost: CaseLoss[];
  signals_visible_before: CaseFigure[];
  response: CaseResponse[];
  lessons: string[];
  labels: ("Facts" | "Analysis")[];
  sources: { name: string; url: string; date: string }[];
  todo: string[];
  /** The "## Analysis" body, as markdown; empty when there is none. */
  analysis: string;
};

export const ID = /^AF-[A-Z]{2}-(\d{4})-\d{2}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const URL_RX = /^https?:\/\/\S+$/;
const LABELS = ["Facts", "Analysis"];

export const countryNames: Record<string, string> = {
  KE: "Kenya",
  UG: "Uganda",
  TZ: "Tanzania",
  RW: "Rwanda",
  NG: "Nigeria",
  GH: "Ghana",
  ZA: "South Africa",
  ZM: "Zambia",
  EG: "Egypt",
};
export const sectorNames: Record<string, string> = { banking: "Banking", "sector-policy": "Sector policy", sacco: "SACCOs", insurance: "Insurance", pensions: "Pensions", sovereign: "Sovereign debt" };

/** gray-matter parses unquoted dates as Date objects; cases keep ISO strings. */
function iso(v: unknown): unknown {
  return v instanceof Date ? v.toISOString().slice(0, 10) : v;
}

function str(v: unknown) {
  return typeof v === "string" && v.trim().length > 0;
}

/** Every problem with one case's frontmatter; an empty list means the case is valid. Mirrors scripts/case_check.py. */
export function caseProblems(data: Record<string, unknown>, file: string): string[] {
  const out: string[] = [];
  const at = (where: string, what: string) => out.push(`${file}: ${where}: ${what}`);
  const src = (v: unknown, where: string) => {
    const s = v as Partial<CaseSource> | undefined;
    if (!s || !str(s.name)) at(where, "source needs a name");
    if (!s || !str(s.url) || !URL_RX.test(String(s.url))) at(where, "source needs an http(s) link");
  };
  const date = (v: unknown, where: string) => {
    if (!str(iso(v)) || !DATE.test(String(iso(v)))) at(where, "needs a YYYY-MM-DD date");
  };
  const list = (key: string) => {
    const v = data[key];
    if (!Array.isArray(v)) {
      at(key, "missing (use [] with a TODO(source) note when nothing is sourced yet)");
      return [] as Record<string, unknown>[];
    }
    return v as Record<string, unknown>[];
  };

  if (!str(data.id) || !ID.test(String(data.id))) at("id", "must look like AF-KE-2016-01");
  if (str(data.id) && path.basename(file, ".md") !== data.id) at("id", "must match the file name");
  for (const key of ["title", "country", "sector", "summary"]) if (!str(data[key])) at(key, "missing");
  if (data.status !== "draft" && data.status !== "published") at("status", "must be draft or published");
  date(data.start, "start");
  if (data.end != null) date(data.end, "end");
  if (!Array.isArray(data.institutions)) at("institutions", "must be a list");

  for (const [i, f] of list("conditions_before").entries()) {
    if (!str(f.metric) || !str(f.value)) at(`conditions_before[${i}]`, "needs metric and value");
    date(f.as_of, `conditions_before[${i}].as_of`);
    src(f.source, `conditions_before[${i}]`);
  }
  for (const [i, f] of list("signals_visible_before").entries()) {
    if (!str(f.metric) || !str(f.value)) at(`signals_visible_before[${i}]`, "needs metric and value");
    date(f.as_of, `signals_visible_before[${i}].as_of`);
    src(f.source, `signals_visible_before[${i}]`);
  }
  for (const [i, l] of list("who_lost").entries()) {
    if (!str(l.group)) at(`who_lost[${i}]`, "needs a group");
    if (l.amount != null) date(l.as_of, `who_lost[${i}].as_of`);
    src(l.source, `who_lost[${i}]`);
  }
  for (const [i, e] of list("timeline").entries()) {
    date(e.date, `timeline[${i}].date`);
    if (!str(e.title)) at(`timeline[${i}]`, "needs a title");
    src(e.source, `timeline[${i}]`);
  }
  for (const [i, r] of list("response").entries()) {
    date(r.date, `response[${i}].date`);
    if (!str(r.text)) at(`response[${i}]`, "needs text");
    src(r.source, `response[${i}]`);
  }
  const trigger = data.trigger as Record<string, unknown> | undefined;
  if (!trigger || !str(trigger.text)) at("trigger", "needs text");
  else {
    date(trigger.date, "trigger.date");
    src(trigger.source, "trigger");
  }
  for (const [i, l] of list("lessons").entries()) if (!str(l)) at(`lessons[${i}]`, "must be text");

  const labels = data.labels;
  if (!Array.isArray(labels) || !labels.length) at("labels", "missing");
  else for (const l of labels) if (!LABELS.includes(String(l))) at("labels", `${String(l)} is not Facts or Analysis`);

  const sources = list("sources");
  if (!sources.length) at("sources", "at least one source");
  for (const [i, s] of sources.entries()) {
    if (!str(s.name) || !str(s.url) || !URL_RX.test(String(s.url))) at(`sources[${i}]`, "needs a name and an http(s) link");
    date(s.date, `sources[${i}].date`);
  }

  const todo = data.todo == null ? [] : data.todo;
  if (!Array.isArray(todo)) at("todo", "must be a list");

  if (data.status === "published") {
    const signed = data.signed_off as { by?: unknown; date?: unknown } | undefined;
    if (!signed || !str(signed.by)) at("signed_off", "a published case needs the founder's sign-off (by and date)");
    else date(signed.date, "signed_off.date");
    if (Array.isArray(todo) && todo.length) at("todo", "a published case cannot have open TODOs");
    for (const key of ["conditions_before", "timeline", "who_lost", "signals_visible_before", "response", "lessons"]) {
      if (Array.isArray(data[key]) && !(data[key] as unknown[]).length) at(key, "a published case needs at least one entry");
    }
  }
  return out;
}

function deepIso(v: unknown): unknown {
  if (v instanceof Date) return iso(v);
  if (Array.isArray(v)) return v.map(deepIso);
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deepIso(x)]));
  return v;
}

function readCase(file: string): Case {
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const fm = deepIso(data) as Record<string, unknown>;
  const problems = caseProblems(fm, path.relative(process.cwd(), file));
  if (problems.length) throw new Error(`Case refused:\n${problems.join("\n")}`);
  const analysis = content.replace(/^\s*## Analysis\s*/m, "").trim();
  return { ...(fm as unknown as Case), end: (fm.end as string | null) ?? null, todo: (fm.todo as string[]) ?? [], analysis };
}

export const loadCases = cache((): Case[] => {
  if (!fs.existsSync(CASES_DIR)) return [];
  const files = fs.readdirSync(CASES_DIR).filter((f) => f.endsWith(".md"));
  const cases = files.map((f) => readCase(path.join(CASES_DIR, f)));
  const seen = new Set<string>();
  for (const c of cases) {
    if (seen.has(c.id)) throw new Error(`Duplicate case id ${c.id}`);
    seen.add(c.id);
  }
  return cases.sort((a, b) => b.start.localeCompare(a.start) || a.id.localeCompare(b.id));
});

/** A case is public when it is published and signed off. */
export const isPublic = (c: Case) => c.status === "published" && Boolean(c.signed_off?.by);

/** Drafts are shown on preview deployments and in local development, never on production. */
export const showDrafts = () => process.env.VERCEL_ENV !== "production" && process.env.AF_HIDE_DRAFTS !== "1";

export function visibleCases(drafts = showDrafts()): Case[] {
  return loadCases().filter((c) => isPublic(c) || drafts);
}

export function getCase(id: string, drafts = showDrafts()): Case | null {
  return visibleCases(drafts).find((c) => c.id === id) ?? null;
}

/** The source as an evidence tag; the as-of date is the figure's, the event's, or the source's own. */
export function evidence(c: Case, source: CaseSource, asOf?: string): Evidence {
  const listed = c.sources.find((s) => s.url === source.url);
  return { source: source.name, href: source.url, asOf: asOf ?? listed?.date ?? c.start };
}

export const caseYear = (c: Case) => c.start.slice(0, 4);
export const caseCountry = (c: Case) => countryNames[c.country] ?? c.country;
export const caseSector = (c: Case) => sectorNames[c.sector] ?? c.sector;
