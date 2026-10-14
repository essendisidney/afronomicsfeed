import fs from "node:fs";
import path from "node:path";
import { loadCases } from "@/lib/cases";
import { buildPack } from "@/lib/editions/pack";
import { loadLedger, score } from "@/lib/ledger";
import { inYear, institutions, latest, type Figure, type Institution, type Kind } from "@/lib/registry";

/**
 * The Watch pack (docs/rebuild/phase-5-plan.md): a private quarterly pack about one SACCO, for its board. Every figure
 * is the regulators' or the auction results'; code only works out tier medians and changes. A SACCO is compared
 * with SASRA's prescribed minimums here and nowhere public; the figures sit beside the minimum, with no verdict.
 */

export type Line = { metric: string; label: string; value: Figure | null; median: number | null; peers: number; unit: string };
export type Soundness = Line & { standard: string };

export type Watch = {
  subject: { name: string; kind: Kind; tier: string | null; county: string | null; sample: boolean; slug: string | null };
  year: number;
  size: Line[];
  soundness: Soundness[];
  sector: {
    report: string;
    rows: { label: string; value: number; yearAgo: number | null; unit: string; prescribed?: string }[];
    source: string;
  } | null;
  market: {
    options: { name: string; gross: number; net: number; source: string }[];
    asOf: string;
    ledger: { tenor: number; low: number; high: number; auction: string; writtenAt: string }[];
    record: { graded: number; inside: number };
  };
  cases: { id: string; title: string; lessons: string[] }[];
  generatedAt: string;
};

const SIZE: [string, string][] = [
  ["assets", "Total assets"],
  ["gross_loans", "Gross loans"],
  ["deposits", "Deposits"],
  ["total_income", "Total income"],
];

/** SASRA's prescribed levels, as printed in its 2025 annual report (Appendices V and VI). */
const STANDARDS: Record<"sacco_dt" | "sacco_nwdt", [string, string, string][]> = {
  sacco_dt: [
    ["core_capital_to_assets", "Core capital to total assets", "minimum 10%"],
    ["core_capital_to_deposits", "Core capital to total deposits", "minimum 8%"],
    ["institutional_capital_to_assets", "Institutional capital to total assets", "minimum 8%"],
    ["external_borrowing_to_assets", "External borrowing to total assets", "maximum 25%"],
    ["npl_ratio", "Non-performing loans ratio", "no prescribed level in the annual report"],
  ],
  sacco_nwdt: [
    ["core_capital_to_assets", "Core capital to total assets", "minimum 8%"],
    ["core_capital_to_deposits", "Core capital to total deposits", "minimum 5%"],
    ["retained_earnings_to_core_capital", "Retained earnings and reserves to core capital", "minimum 5%"],
    ["external_borrowing_to_assets", "External borrowing to total assets", "maximum 25%"],
    ["npl_ratio", "Non-performing loans ratio", "no prescribed level in the annual report"],
  ],
};

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** The tier median of a metric for a year, over every SACCO of the same kind and SASRA tier that has a figure. */
export function tierMedian(kind: Kind, tier: string | null, metric: string, year: number): { value: number | null; peers: number } {
  const values = institutions()
    .filter((i) => i.kind === kind && i.tier === tier)
    .map((i) => inYear(i, metric, year)?.value)
    .filter((v): v is number => v != null);
  return { value: median(values), peers: values.length };
}

function latestYear(inst: Institution | null, kind: Kind): number {
  const years = (inst ? inst.figures : institutions().filter((i) => i.kind === kind).flatMap((i) => i.figures)).map((f) => f.year);
  return years.length ? Math.max(...years) : new Date().getUTCFullYear() - 1;
}

type SectorRow = { report: string; period: string; segment: string; metric: string; value: number; unit: string; source: string; prescribed?: string };

function sector(): Watch["sector"] {
  const file = path.join(process.cwd(), "data", "registry", "sasra_sector.json");
  if (!fs.existsSync(file)) return null;
  const rows = (JSON.parse(fs.readFileSync(file, "utf8")) as { rows: SectorRow[] }).rows.filter((r) => r.segment === "dt");
  if (!rows.length) return null;
  const report = rows.reduce((m, r) => (r.report > m ? r.report : m), "");
  const own = rows.filter((r) => r.report === report);
  const at = (metric: string, period: string) => own.find((r) => r.metric === metric && r.period === period) ?? null;
  const yearBefore = `${Number(report.slice(0, 4)) - 1}${report.slice(4)}`;
  const labels: [string, string][] = [
    ["assets", "Total assets"],
    ["gross_loans", "Gross loans"],
    ["deposits", "Total deposits"],
    ["core_capital_to_assets", "Core capital to total assets"],
    ["core_capital_to_deposits", "Core capital to total deposits"],
    ["npl_ratio", "Non-performing loans ratio"],
    ["liquidity_ratio", "Liquidity ratio"],
  ];
  const out = labels.flatMap(([metric, label]) => {
    const now = at(metric, report);
    if (!now) return [];
    return [{ label, value: now.value, yearAgo: at(metric, yearBefore)?.value ?? null, unit: now.unit, prescribed: now.prescribed }];
  });
  return { report, rows: out, source: own[0].source };
}

/** The pack for one SACCO (by registry slug), or the public sample: a median large-tier deposit-taking SACCO. */
export async function buildWatch(slug: string | null, now: number): Promise<Watch | null> {
  const inst = slug ? (institutions().find((i) => i.slug === slug) ?? null) : null;
  if (slug && (!inst || !inst.kind.startsWith("sacco"))) return null;
  const kind = (inst?.kind ?? "sacco_dt") as "sacco_dt" | "sacco_nwdt";
  const tier = inst ? inst.tier : "large";
  const year = latestYear(inst, kind);

  const line = (metric: string, label: string): Line => {
    const m = tierMedian(kind, tier, metric, year);
    const own = inst ? inYear(inst, metric, year) : null;
    const unit = own?.unit ?? (metric.includes("_to_") || metric === "npl_ratio" ? "%" : "KES bn");
    return { metric, label, value: own, median: m.value, peers: m.peers, unit };
  };
  const size = SIZE.map(([m, l]) => line(m, l)).filter((l) => l.median != null || l.value);
  const soundness = STANDARDS[kind].map(([m, l, standard]) => ({ ...line(m, l), standard })).filter((l) => l.median != null || l.value);

  const pack = await buildPack(now);
  // The three Treasury bills first (what a SACCO's surplus most often goes into), then the three best other options after tax.
  const bills = pack.kenya.options.filter((o) => /Treasury bill/i.test(o.name));
  const others = pack.kenya.options.filter((o) => !/Treasury bill/i.test(o.name)).sort((a, b) => b.net - a.net).slice(0, 3);
  const options = [...bills, ...others].map((o) => ({ name: o.name, gross: o.gross, net: o.net, source: o.source }));
  const { rows: ledgerRows } = loadLedger();
  const nextAuction = ledgerRows.reduce((m, r) => (r.auction_value_date > m ? r.auction_value_date : m), "");
  const ledger = ledgerRows
    .filter((r) => r.auction_value_date === nextAuction)
    .map((r) => ({ tenor: r.tenor, low: r.low, high: r.high, auction: r.auction_value_date, writtenAt: r.written_at }))
    .sort((a, b) => a.tenor - b.tenor);
  const live = score(ledgerRows);

  const cases = loadCases()
    .filter((c) => c.status === "published" && c.signed_off)
    .slice(0, 3)
    .map((c) => ({ id: c.id, title: c.title, lessons: c.lessons.slice(0, 2) }));

  return {
    subject: {
      name: inst ? inst.name : "Median large-tier deposit-taking SACCO",
      kind,
      tier,
      county: inst?.county ?? null,
      sample: !inst,
      slug: inst?.slug ?? null,
    },
    year,
    size,
    soundness,
    sector: sector(),
    market: { options, asOf: pack.asOf, ledger, record: { graded: live.graded, inside: live.inside } },
    cases,
    generatedAt: new Date(now).toISOString(),
  };
}

/** For the sample: the subject's figure is the tier median itself, so the page shows the layout without a SACCO. */
export function sampleValue(l: Line): number | null {
  return l.median;
}

export { latest };
