import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Evidence } from "@/components/evidence/EvidenceTag";

/**
 * The institutions registry (docs/rebuild/phase-3-plan.md): every licensed SACCO, microfinance bank and bank in
 * Kenya, built only from what SASRA and CBK publish (data/registry/, written by the readers in scripts/). Code joins
 * the documents; nothing is estimated. Each figure keeps its source, page and as-of date.
 *
 * Joining names across documents: a loose key (matchKey, the same rule as scripts/registry_common.py) within one kind
 * of institution, with data/registry/aliases.json for renames the key cannot see. A figure whose name matches no
 * listed institution, or matches more than one, is not attached to anyone; unmatched() lists them for the desk.
 */

const DIR = path.join(process.cwd(), "data", "registry");

export type Kind = "sacco_dt" | "sacco_nwdt" | "mfb" | "bank" | "mortgage";
export const kindLabels: Record<Kind, string> = {
  sacco_dt: "Deposit-taking SACCO",
  sacco_nwdt: "Non-withdrawable-deposit SACCO",
  mfb: "Microfinance bank",
  bank: "Commercial bank",
  mortgage: "Mortgage finance institution",
};
export const kindPlural: Record<Kind, string> = {
  sacco_dt: "Deposit-taking SACCOs",
  sacco_nwdt: "Non-withdrawable-deposit SACCOs",
  mfb: "Microfinance banks",
  bank: "Commercial banks",
  mortgage: "Mortgage finance",
};
export const regulatorOf = (k: Kind) => (k.startsWith("sacco") ? "SASRA" : "CBK");

export type Figure = {
  metric: string;
  year: number;
  value: number | null;
  unit: string;
  asOf: string;
  source: string;
  page: number | null;
  report: number;
  note?: string;
};

export type Licence = { year: number; status: string; schedule: string; asOf: string; source: string };

export type Institution = {
  slug: string;
  key: string;
  kind: Kind;
  name: string;
  county: string | null;
  licences: Licence[];
  /** The latest licence row, if the institution is on a regulator's list. */
  status: string | null;
  directory: { peerGroup: string | null; branches: number | null; licensedOn: string | null; website: string | null; edition: string; source: string } | null;
  tier: string | null;
  figures: Figure[];
};

type LicenceRow = { year: number; schedule: string; number: number; name: string; type: string; status: string; county: string | null; as_of: string; source: string };
type SaccoRow = { report: number; year: number; type: "dt" | "nwdt"; tier: string | null; rank: number; name: string; metric: string; value: number | null; unit: string; as_of: string; source: string; page: number; note?: string };
type CbkRow = { report: number; year: number; type: "bank" | "mfb"; rank: number | null; name: string; metric: string; value: number | null; unit: string; as_of: string; source: string; page: number; note?: string };
type DirRow = { kind: "bank" | "mfb"; edition: string; section: string; number: number; name: string; peer_group?: string | null; branches?: number | null; licensed_on?: string | null; website?: string; as_of: string; source: string };

function rows<T>(file: string): T[] {
  const p = path.join(DIR, file);
  if (!fs.existsSync(p)) return [];
  return (JSON.parse(fs.readFileSync(p, "utf8")) as { rows: T[] }).rows;
}

const STRIP =
  /\b(sacco|saccos|society|societies|ltd|limited|plc|co-operative savings and credit|and|dt|nwdt|regulated|bank|kenya|microfinance|mfb|the|\(k\)|k)\b/gi;

/** The loose name key: spaces, accents and legal words ignored ("TRANSNATION DT" meets "Trans Nation Sacco"). The
 * readers' match_key (scripts/registry_common.py) follows the same rule for their own checks. */
export function matchKey(name: string): string {
  let s = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/’/g, "'").replace(/&/g, " ");
  s = s.replace(/\(([^)]*)\)/g, " $1 ");
  s = s.toLowerCase().replace(STRIP, " ");
  s = s.replace(/[^a-z0-9' ]+/g, " ").replace(/'/g, "");
  return s.replace(/\s+/g, "");
}

/** "Mwalimu National Sacco Society Ltd" -> "Mwalimu National Sacco"; "ABSA Bank Kenya PLC" -> "ABSA Bank Kenya". */
export function displayName(name: string): string {
  return name
    .replace(/\s+(Society\s+)?(Ltd\.?|Limited|PLC|Plc)\.?$/i, "")
    .replace(/\s+Sacco Society$/i, " Sacco")
    .replace(/\s+Society$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

const slugOf = (name: string) =>
  displayName(name)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

function aliases(): Record<string, string> {
  const p = path.join(DIR, "aliases.json");
  if (!fs.existsSync(p)) return {};
  return (JSON.parse(fs.readFileSync(p, "utf8")) as { aliases: Record<string, string> }).aliases;
}

const saccoKind = (t: string): Kind => (t === "nwdt" ? "sacco_nwdt" : "sacco_dt");

type Built = { institutions: Institution[]; unmatched: { kind: Kind; name: string; reason: string }[] };

export const loadRegistry = cache((): Built => {
  const alias = aliases();
  const group = (kind: Kind) => (kind.startsWith("sacco") ? "sacco" : kind === "mfb" ? "mfb" : "bank");
  const keyFor = (kind: Kind, name: string) => {
    const k = matchKey(name);
    return alias[`${group(kind)}:${k}`] ?? k;
  };
  const byKey = new Map<string, Institution>();
  const id = (kind: Kind, key: string) => `${group(kind)}:${key}`;
  const add = (kind: Kind, name: string, county: string | null): Institution => {
    const key = keyFor(kind, name);
    const existing = byKey.get(id(kind, key));
    if (existing) return existing;
    const inst: Institution = { slug: "", key, kind, name: displayName(name), county, licences: [], status: null, directory: null, tier: null, figures: [] };
    byKey.set(id(kind, key), inst);
    return inst;
  };

  // 1. SASRA's lists, newest year last so the newest name, county and status win.
  const licences = rows<LicenceRow>("sasra_licences.json").sort((a, b) => a.year - b.year);
  for (const r of licences) {
    const kind: Kind = r.type === "nwdt" ? "sacco_nwdt" : "sacco_dt";
    const inst = add(kind, r.name, r.county);
    if (r.type !== "any") inst.kind = kind;
    inst.name = displayName(r.name);
    inst.county = r.county ?? inst.county;
    inst.licences.push({ year: r.year, status: r.status, schedule: r.schedule, asOf: r.as_of, source: r.source });
  }
  for (const inst of byKey.values()) {
    const latest = inst.licences.at(-1);
    inst.status = latest?.status ?? null;
  }

  // 2. CBK's directories, newest edition per kind.
  const dirs = rows<DirRow>("cbk_directories.json");
  const newest = (kind: string) => dirs.filter((d) => d.kind === kind).reduce((m, d) => (d.edition > m ? d.edition : m), "");
  for (const kind of ["bank", "mfb"] as const) {
    const edition = newest(kind);
    for (const d of dirs.filter((x) => x.kind === kind && x.edition === edition && x.section !== "holding")) {
      const k: Kind = kind === "mfb" ? "mfb" : d.section === "mortgage" ? "mortgage" : "bank";
      const inst = add(k, d.name, null);
      inst.name = displayName(d.name);
      inst.status = "licensed";
      inst.directory = {
        peerGroup: d.peer_group ?? null,
        branches: d.branches ?? null,
        licensedOn: d.licensed_on ?? null,
        website: d.website ?? null,
        edition: d.edition,
        source: d.source,
      };
    }
  }

  // 3. Figures. Attached only to an institution already on a list or directory, by its key within its kind.
  const unmatched: Built["unmatched"] = [];
  const attach = (kind: Kind, name: string, f: Figure, tier: string | null) => {
    const key = keyFor(kind, name);
    const inst = byKey.get(id(kind, key)) ?? (kind === "bank" ? byKey.get(id("mortgage", key)) : undefined);
    if (!inst) {
      if (!unmatched.some((u) => u.kind === kind && u.name === name)) unmatched.push({ kind, name, reason: "no listed institution with this name" });
      return;
    }
    inst.figures.push(f);
    if (tier && (!inst.tier || f.report >= Math.max(0, ...inst.figures.map((x) => x.report)))) inst.tier = tier;
  };
  for (const r of rows<SaccoRow>("sasra_figures.json")) {
    const f: Figure = { metric: r.metric, year: r.year, value: r.value, unit: r.unit, asOf: r.as_of, source: r.source, page: r.page, report: r.report, note: r.note };
    const kind = saccoKind(r.type);
    // A SACCO can move between the deposit-taking and non-withdrawable lists; match within its kind first.
    const own = byKey.get(id(kind, keyFor(kind, r.name)));
    attach(own ? kind : kind === "sacco_dt" ? "sacco_nwdt" : "sacco_dt", r.name, f, r.tier);
  }
  for (const r of rows<CbkRow>("cbk_figures.json")) {
    const f: Figure = { metric: r.metric, year: r.year, value: r.value, unit: r.unit, asOf: r.as_of, source: r.source, page: r.page, report: r.report, note: r.note };
    attach(r.type === "mfb" ? "mfb" : "bank", r.name, f, null);
  }

  // A later report's figure for the same year and metric replaces an earlier one (a restatement); keep the newest.
  for (const inst of byKey.values()) {
    const best = new Map<string, Figure>();
    for (const f of inst.figures) {
      const k = `${f.metric}|${f.year}`;
      const prev = best.get(k);
      if (!prev || f.report > prev.report) best.set(k, f);
    }
    inst.figures = [...best.values()].sort((a, b) => a.metric.localeCompare(b.metric) || a.year - b.year);
  }

  // Slugs: unique, stable, readable.
  const taken = new Set<string>();
  const list = [...byKey.values()].sort((a, b) => a.name.localeCompare(b.name));
  for (const inst of list) {
    let s = slugOf(inst.name) || inst.key.replace(/\s+/g, "-");
    if (taken.has(s)) s = `${s}-${inst.kind.replace("_", "-")}`;
    taken.add(s);
    inst.slug = s;
  }
  return { institutions: list, unmatched };
});

export const institutions = () => loadRegistry().institutions;
export const unmatched = () => loadRegistry().unmatched;
export const getInstitution = (slug: string) => institutions().find((i) => i.slug === slug) ?? null;

/** The newest figure for a metric, or null. */
export function latest(inst: Institution, metric: string): Figure | null {
  const fs_ = inst.figures.filter((f) => f.metric === metric && f.value != null);
  return fs_.length ? fs_.reduce((a, b) => (b.year > a.year ? b : a)) : null;
}

/** The figure for a metric in a given year, or null. */
export function inYear(inst: Institution, metric: string, year: number): Figure | null {
  return inst.figures.find((f) => f.metric === metric && f.year === year) ?? null;
}

/** Change on the year before, in per cent, worked out by code from two published figures; null if either is missing. */
export function growth(inst: Institution, metric: string): { pct: number; from: Figure; to: Figure } | null {
  const to = latest(inst, metric);
  if (!to) return null;
  const from = inYear(inst, metric, to.year - 1);
  if (!from?.value || to.value == null || from.value <= 0) return null;
  return { pct: ((to.value - from.value) / from.value) * 100, from, to };
}

export const metricLabels: Record<string, string> = {
  assets: "Total assets",
  deposits: "Deposits",
  gross_loans: "Gross loans",
  net_loans: "Net loans and advances",
  total_income: "Total income",
  profit_before_tax: "Profit before tax",
  shareholders_funds: "Shareholders' funds",
  roa: "Return on assets",
  roe: "Return on equity",
  gross_npl: "Gross non-performing loans",
  npl_ratio: "Non-performing loans ratio",
  core_capital_to_assets: "Core capital to total assets",
  core_capital_to_deposits: "Core capital to total deposits",
  institutional_capital_to_assets: "Institutional capital to total assets",
  retained_earnings_to_core_capital: "Retained earnings and reserves to core capital",
  external_borrowing_to_assets: "External borrowing to total assets",
  core_capital_to_rwa: "Core capital to risk-weighted assets",
  total_capital_to_rwa: "Total capital to risk-weighted assets",
};

const sourceNames: [RegExp, string][] = [
  [/sasra\.go\.ke\/\?wpdmdl=1573|licensed/i, "SASRA licensed list"],
  [/sasra\.go\.ke/i, "SASRA Supervision Annual Report"],
  [/Directory-of-Licenced-Microfinance/i, "CBK microfinance directory"],
  [/Directory-of-Licenced-Commercial/i, "CBK bank directory"],
  [/centralbank\.go\.ke/i, "CBK Bank Supervision Annual Report"],
];
export function sourceName(url: string, report?: number): string {
  const hit = sourceNames.find(([rx]) => rx.test(url));
  const base = hit ? hit[1] : "Regulator";
  return report && /Annual Report/.test(base) ? `${base} ${report}` : base;
}

export function figureEvidence(f: Figure): Evidence {
  return { source: `${sourceName(f.source, f.report)}${f.page ? `, p. ${f.page}` : ""}`, href: f.source, asOf: f.asOf };
}

/** "KES 76.31 bn", "KES 1,497,701 m", "13.96%". */
export function formatFigure(f: Pick<Figure, "value" | "unit">): string {
  if (f.value == null) return "Not published";
  if (f.unit === "%") return `${f.value.toFixed(2)}%`;
  if (f.unit === "KES bn") return `KES ${f.value.toFixed(2)} bn`;
  if (f.unit === "KES m") {
    if (Math.abs(f.value) >= 1000) return `KES ${(f.value / 1000).toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 })} bn`;
    return `KES ${f.value.toLocaleString("en-US")} m`;
  }
  return `${f.value} ${f.unit}`;
}

/** Total assets in KES millions, whatever unit the source used: for sorting and size bands only. */
export function assetsInMillions(inst: Institution): number | null {
  const f = latest(inst, "assets");
  if (!f?.value) return null;
  return f.unit === "KES bn" ? f.value * 1000 : f.value;
}

export const kindsInOrder: Kind[] = ["sacco_dt", "sacco_nwdt", "mfb", "bank", "mortgage"];
