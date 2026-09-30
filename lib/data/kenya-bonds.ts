import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { latestByTenor, loadTbills } from "./kenya-tbills";

/** Kenya Treasury bond auctions, extracted by scripts/kenya_bonds.py from CBK result notices. */

export type BondAuction = {
  value_date: string;
  issue: string;
  type: string;
  tenor_years: number;
  maturity: string | null;
  kind: "primary" | "reopening" | "tap" | "switch" | "buyback";
  offered_total_kes_m: number | null;
  received_kes_m: number | null;
  accepted_kes_m: number | null;
  competitive_kes_m: number | null;
  noncompetitive_kes_m: number | null;
  bid_to_cover: number | null;
  market_weighted_avg_rate: number | null;
  weighted_avg_rate: number;
  price_per_100: number | null;
  coupon: number | null;
  source: string;
};

export type BondFile = { updatedAt: string | null; sourcePage: string; rows: BondAuction[]; notices: number };

const FILE = path.join(process.cwd(), "data", "kenya", "bond_auctions.json");
const SOURCE_PAGE = "https://www.centralbank.go.ke/bills-bonds/treasury-bonds/";

export const loadBonds = cache((): BondFile => {
  if (!fs.existsSync(FILE)) return { updatedAt: null, sourcePage: SOURCE_PAGE, rows: [], notices: 0 };
  const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as {
    updated_at?: string;
    rows?: BondAuction[];
    sources?: Record<string, { status: string }>;
  };
  const rows = (raw.rows ?? [])
    .filter((row) => row.value_date && Number.isFinite(row.weighted_avg_rate))
    .sort((a, b) => b.value_date.localeCompare(a.value_date) || a.issue.localeCompare(b.issue));
  return {
    updatedAt: raw.updated_at ?? null,
    sourcePage: SOURCE_PAGE,
    rows,
    notices: Object.values(raw.sources ?? {}).filter((s) => s.status === "parsed").length,
  };
});

/** Years from the auction's value date to the bond's maturity. */
export function yearsToMaturity(row: Pick<BondAuction, "value_date" | "maturity" | "tenor_years">) {
  if (!row.maturity) return row.tenor_years;
  const years = (new Date(row.maturity).getTime() - new Date(row.value_date).getTime()) / (365.25 * 86400000);
  return years > 0 ? years : row.tenor_years;
}

export type CurvePoint = { years: number; rate: number; label: string; date: string; source: string; kind: string };

/**
 * The auction yield curve: T-bills at 91/182/364 days plus the most recent auction of each bond
 * in the last 12 months (switches and buybacks excluded), placed at its remaining life.
 */
export function auctionCurve(): CurvePoint[] {
  const bonds = loadBonds().rows;
  const bills = latestByTenor(loadTbills().rows);
  const points: CurvePoint[] = [];
  for (const [tenor, item] of bills) {
    points.push({
      years: tenor / 364,
      rate: item.latest.weighted_avg_rate,
      label: `${tenor}-day bill`,
      date: item.latest.value_date,
      source: item.latest.source,
      kind: "T-bill",
    });
  }
  const newest = bonds[0]?.value_date;
  if (newest) {
    const cutoff = new Date(new Date(newest).getTime() - 365 * 86400000).toISOString().slice(0, 10);
    const latestPerIssue = new Map<string, BondAuction>();
    for (const row of bonds) {
      if (row.value_date < cutoff || row.kind === "switch" || row.kind === "buyback") continue;
      if (!latestPerIssue.has(row.issue)) latestPerIssue.set(row.issue, row);
    }
    for (const row of latestPerIssue.values()) {
      points.push({
        years: yearsToMaturity(row),
        rate: row.weighted_avg_rate,
        label: row.issue,
        date: row.value_date,
        source: row.source,
        kind: row.type,
      });
    }
  }
  return points.sort((a, b) => a.years - b.years);
}

export function bondsCsv(file: BondFile) {
  const header = [
    "value_date",
    "issue",
    "type",
    "kind",
    "tenor_years",
    "maturity",
    "offered_total_kes_m",
    "received_kes_m",
    "accepted_kes_m",
    "competitive_kes_m",
    "noncompetitive_kes_m",
    "bid_to_cover",
    "weighted_avg_rate_pct",
    "market_weighted_avg_rate_pct",
    "price_per_100",
    "coupon_pct",
    "source_notice",
  ];
  const cell = (v: unknown) => (v == null ? "" : String(v));
  const lines = file.rows.map((r) =>
    [
      r.value_date,
      r.issue,
      `"${r.type}"`,
      r.kind,
      r.tenor_years,
      r.maturity,
      r.offered_total_kes_m,
      r.received_kes_m,
      r.accepted_kes_m,
      r.competitive_kes_m,
      r.noncompetitive_kes_m,
      r.bid_to_cover,
      r.weighted_avg_rate,
      r.market_weighted_avg_rate,
      r.price_per_100,
      r.coupon,
      `"${r.source}"`,
    ]
      .map(cell)
      .join(","),
  );
  return [
    "# Kenya Treasury bond auctions, one row per bond per auction (primary issues, re-openings, taps, switches)",
    `# Source: Central Bank of Kenya result notices (${file.sourcePage}). Each row links to its notice.`,
    `# Compiled by Afronomics (afronomicsfeed.com). Updated ${file.updatedAt ?? "n/a"}. Amounts in KES millions (offered is the auction total); rates in % p.a.`,
    header.join(","),
    ...lines,
  ].join("\n");
}
