import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import type { Evidence } from "@/components/evidence/EvidenceTag";
import { showDrafts } from "@/lib/cases";

/**
 * Receipts (docs/rebuild/RECEIPTS.md; docs/rebuild/receipts-r1-plan.md): Afronomics' daily verdict on one money event.
 * One file per Receipt in content/receipts/<date>-<slug>.md: frontmatter plus a body split at <!-- full-file --> into
 * the free piece and the full file. A Receipt that breaks a rule is refused here (the build fails) and by
 * scripts/receipt_check.py in CI. Only published Receipts are public; drafts show on preview deployments and the desk.
 */

const DIR = path.join(process.cwd(), "content", "receipts");
const SPLIT = "<!-- full-file -->";
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const URL_RX = /^https?:\/\/\S+$/;
const FILE_RX = /^(\d{4}-\d{2}-\d{2})-[a-z0-9-]+\.md$/;

/** Each desk is an agent configuration under the house rules, never a person (RECEIPTS.md section 2). */
export const desks = {
  markets: { name: "Afronomics Markets Desk", covers: "bills, bonds, currencies and the money markets" },
  banking: { name: "Afronomics Banking Desk", covers: "banks, SACCOs, microfinance and their regulators" },
  companies: { name: "Afronomics Companies Desk", covers: "listed and listing companies, offers and results" },
  "public-money": { name: "Afronomics Public Money Desk", covers: "budgets, borrowing and taxes" },
  "cost-of-living": { name: "Afronomics Cost of Living Desk", covers: "prices, fuel, food, rent and wages" },
  africa: { name: "Afronomics Africa Desk", covers: "money events across the continent" },
} as const;
export type DeskSlug = keyof typeof desks;
export const deskSlug = (name: string) => (Object.keys(desks) as DeskSlug[]).find((k) => desks[k].name === name) ?? null;

export const sectorNames: Record<string, string> = {
  markets: "Markets",
  banking: "Banking",
  companies: "Companies",
  "public-money": "Public money",
  "cost-of-living": "Cost of living",
  africa: "Africa",
};

export type ReceiptSource = { name: string; url: string; date: string };
export type Comparator = "<" | "<=" | ">" | ">=" | "between" | "is";
export type ReceiptCall = {
  statement: string;
  check_source: string;
  check_date: string;
  /** What the settling source reports, compared with the threshold by code (docs/rebuild/receipts-r2-plan.md). */
  measure: string;
  comparator: Comparator;
  threshold: number | [number, number] | string;
  unit?: string;
};
const COMPARATORS = ["<", "<=", ">", ">=", "between", "is"];
export type ReceiptTile = { label: string; value: string; note?: string; source: string };
/** A chart drawn from the Receipt's own figures (RECEIPTS.md "Charts and graphics"). */
export type ReceiptChart = {
  type: "bar" | "line";
  title: string;
  unit: string;
  source: string;
  data: { label: string; value: number }[];
  highlight?: string[];
  reference?: { value: number; label: string };
};

export type Receipt = {
  slug: string;
  title: string;
  date: string;
  type: "data" | "verdict";
  status: "draft" | "checked" | "published";
  sector: string;
  entities: string[];
  verdict: string | null;
  labels: ("Facts" | "Analysis" | "Opinion")[];
  asOf: string;
  summary: string;
  desk: string;
  series: string | null;
  disclosure: string | null;
  sources: ReceiptSource[];
  calls: ReceiptCall[];
  followUps: { date: string; what: string }[];
  caseLinks: string[];
  verify: string[];
  tiles: ReceiptTile[];
  charts: ReceiptChart[];
  free: string;
  full: string;
};

const LABELS = ["Facts", "Analysis", "Opinion"];
/** Advice language: an instruction to the reader to act on a security or product. */
const ADVICE = /\b(you should|we recommend|our advice is to)\s+(buy|sell|hold|subscribe|switch|apply)\b/i;

function iso(v: unknown): unknown {
  return v instanceof Date ? v.toISOString().slice(0, 10) : v;
}
const str = (v: unknown) => typeof v === "string" && v.trim().length > 0;

/** Every problem with one Receipt; an empty list means it is valid. Mirrors scripts/receipt_check.py. */
export function receiptProblems(data: Record<string, unknown>, body: string, file: string): string[] {
  const out: string[] = [];
  const at = (where: string, what: string) => out.push(`${file}: ${where}: ${what}`);
  const date = (v: unknown, where: string) => {
    if (!str(iso(v)) || !DATE.test(String(iso(v)))) at(where, "needs a YYYY-MM-DD date");
  };
  const m = FILE_RX.exec(file);
  if (!m) at("file", "must be named <YYYY-MM-DD>-<slug>.md");
  for (const key of ["title", "sector", "summary", "desk"]) if (!str(data[key])) at(key, "missing");
  date(data.date, "date");
  date(data.asOf, "asOf");
  if (m && iso(data.date) !== m[1]) at("date", "must match the file name");
  if (data.type !== "data" && data.type !== "verdict") at("type", "must be data or verdict");
  if (!["draft", "checked", "published"].includes(String(data.status))) at("status", "must be draft, checked or published");
  if (data.type === "verdict" && !str(data.verdict)) at("verdict", "a verdict Receipt needs its verdict line");
  if (str(data.desk) && !deskSlug(String(data.desk))) at("desk", `must be one of: ${Object.values(desks).map((d) => d.name).join(", ")}`);
  if (str(data.sector) && !sectorNames[String(data.sector)]) at("sector", `must be one of: ${Object.keys(sectorNames).join(", ")}`);

  const labels = Array.isArray(data.labels) ? (data.labels as unknown[]) : [];
  if (!labels.length || labels.some((l) => !LABELS.includes(String(l)))) at("labels", "a list of Facts, Analysis, Opinion");
  const sources = Array.isArray(data.sources) ? (data.sources as Record<string, unknown>[]) : [];
  if (!sources.length) at("sources", "at least one source");
  sources.forEach((s, i) => {
    if (!str(s.name)) at(`sources[${i}]`, "needs a name");
    if (!str(s.url) || !URL_RX.test(String(s.url))) at(`sources[${i}]`, "needs an http(s) link");
    date(s.date, `sources[${i}].date`);
  });
  const calls = Array.isArray(data.calls) ? (data.calls as Record<string, unknown>[]) : [];
  calls.forEach((c, i) => {
    if (!str(c.statement) || !str(c.check_source)) at(`calls[${i}]`, "needs a statement and the source that will settle it");
    date(c.check_date, `calls[${i}].check_date`);
    if (!str(c.measure)) at(`calls[${i}]`, "needs a measure (what the settling source reports)");
    if (!COMPARATORS.includes(String(c.comparator))) at(`calls[${i}].comparator`, `one of ${COMPARATORS.join(" ")}`);
    const t = c.threshold;
    if (c.comparator === "between" && !(Array.isArray(t) && t.length === 2 && t.every((x) => typeof x === "number") && t[0] < t[1])) at(`calls[${i}]`, "'between' needs threshold [low, high]");
    if (["<", "<=", ">", ">="].includes(String(c.comparator)) && typeof t !== "number") at(`calls[${i}]`, "needs a numeric threshold");
    if (c.comparator === "is" && (t == null || t === "")) at(`calls[${i}]`, "'is' needs the expected value as threshold");
  });
  const tiles = Array.isArray(data.tiles) ? (data.tiles as Record<string, unknown>[]) : [];
  tiles.forEach((t, i) => {
    if (!str(t.label) || !str(t.value) || !str(t.source)) at(`tiles[${i}]`, "needs a label, a value and a source");
    else if (!sources.some((s) => s.name === t.source)) at(`tiles[${i}]`, "source must be one of the Receipt's sources");
  });
  const charts = Array.isArray(data.charts) ? (data.charts as Record<string, unknown>[]) : [];
  if (charts.length > 3) at("charts", "at most three charts");
  charts.forEach((c, i) => {
    if (c.type !== "bar" && c.type !== "line") at(`charts[${i}].type`, "bar or line");
    if (!str(c.title) || !str(c.unit)) at(`charts[${i}]`, "needs a title that states the finding, and a unit");
    if (!str(c.source) || !sources.some((s) => s.name === c.source)) at(`charts[${i}].source`, "must be one of the Receipt's sources");
    const d = Array.isArray(c.data) ? (c.data as Record<string, unknown>[]) : [];
    if (d.length < 2 || d.some((p) => !str(String(p.label ?? "")) || typeof p.value !== "number")) at(`charts[${i}].data`, "at least two {label, value} points");
  });

  if (!body.includes(SPLIT)) at("body", `needs the ${SPLIT} marker between the free piece and the full file`);
  const free = body.split(SPLIT)[0];
  if (!/Information, not advice\./.test(free)) at("body", "the free piece must say \"Information, not advice.\"");
  for (const used of new Set([...free.matchAll(/\((Facts|Analysis|Opinion)\)/g)].map((x) => x[1]))) {
    if (!labels.includes(used)) at("labels", `the body uses (${used}) but labels does not list it`);
  }
  if (ADVICE.test(body)) at("body", "advice language (buy, sell, hold, subscribe, switch instructions)");

  if (data.status === "published") {
    if (!str(data.disclosure) || String(data.disclosure).includes("[")) at("disclosure", "must be confirmed before publishing");
    if (Array.isArray(data.verify) && data.verify.length) at("verify", "every item must be checked (and removed) before publishing");
  }
  return out;
}

export const loadReceipts = cache((): Receipt[] => {
  if (!fs.existsSync(DIR)) return [];
  const problems: string[] = [];
  const out: Receipt[] = [];
  for (const file of fs.readdirSync(DIR).filter((f) => f.endsWith(".md")).sort()) {
    const { data, content } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
    const p = receiptProblems(data, content, file);
    if (p.length) {
      problems.push(...p);
      continue;
    }
    const [free, full = ""] = content.split(SPLIT);
    out.push({
      slug: file.replace(/\.md$/, ""),
      title: data.title,
      date: String(iso(data.date)),
      type: data.type,
      status: data.status,
      sector: data.sector,
      entities: data.entities ?? [],
      verdict: data.verdict ?? null,
      labels: data.labels,
      asOf: String(iso(data.asOf)),
      summary: data.summary,
      desk: data.desk,
      series: data.series ?? null,
      disclosure: data.disclosure ?? null,
      sources: (data.sources as ReceiptSource[]).map((s) => ({ ...s, date: String(iso(s.date)) })),
      calls: ((data.calls ?? []) as ReceiptCall[]).map((c) => ({ ...c, check_date: String(iso(c.check_date)) })),
      followUps: ((data.followUps ?? []) as { date: unknown; what: string }[]).map((f) => ({ date: String(iso(f.date)), what: f.what })),
      caseLinks: data.caseLinks ?? [],
      verify: data.verify ?? [],
      tiles: data.tiles ?? [],
      charts: data.charts ?? [],
      free: free.trim(),
      full: full.trim(),
    });
  }
  if (problems.length) throw new Error(`Receipts refused:\n${problems.join("\n")}`);
  return out.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
});

export const isPublic = (r: Receipt) => r.status === "published";

export function visibleReceipts(drafts = showDrafts()): Receipt[] {
  return loadReceipts().filter((r) => isPublic(r) || drafts);
}

export function getReceipt(slug: string, drafts = showDrafts()): Receipt | null {
  return visibleReceipts(drafts).find((r) => r.slug === slug) ?? null;
}

export function sourceFor(r: Receipt, name: string): ReceiptSource | null {
  return r.sources.find((s) => s.name === name) ?? null;
}

/** A named source as an evidence tag, dated by the source's own date. */
export function receiptEvidence(r: Receipt, name: string): Evidence | null {
  const s = sourceFor(r, name);
  return s ? { source: s.name, href: s.url, asOf: s.date } : null;
}
