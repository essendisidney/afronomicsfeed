import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

/**
 * Kenya Treasury bill auctions, extracted by scripts/kenya_tbills.py from every Central Bank of Kenya
 * result notice and stored in data/kenya/tbill_auctions.json (one row per auction per tenor).
 */

export type Tenor = 91 | 182 | 364;

export type TbillAuction = {
  tenor: Tenor;
  issue: string | null;
  value_date: string; // YYYY-MM-DD
  maturity: string | null;
  offered_kes_m: number | null;
  received_kes_m: number | null;
  accepted_kes_m: number | null;
  competitive_kes_m: number | null;
  noncompetitive_kes_m: number | null;
  weighted_avg_rate: number;
  market_weighted_avg_rate: number | null;
  price_per_100: number | null;
  subscription_pct?: number;
  source: string;
};

export type TbillFile = {
  updatedAt: string | null;
  sourcePage: string;
  rows: TbillAuction[]; // newest first
  notices: number;
};

export const tenors: Tenor[] = [91, 182, 364];
export const tenorLabel: Record<Tenor, string> = { 91: "91-day", 182: "182-day", 364: "364-day" };
export const tenorColor: Record<Tenor, string> = { 91: "var(--series-1)", 182: "var(--series-2)", 364: "var(--series-3)" };

const FILE = path.join(process.cwd(), "data", "kenya", "tbill_auctions.json");

export const loadTbills = cache((): TbillFile => {
  if (!fs.existsSync(FILE)) return { updatedAt: null, sourcePage: "https://www.centralbank.go.ke/bills-bonds/treasury-bills/", rows: [], notices: 0 };
  const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as {
    updated_at?: string;
    source_page?: string;
    rows?: TbillAuction[];
    sources?: Record<string, { status: string }>;
  };
  const rows = (raw.rows ?? [])
    .filter((row) => row.value_date && tenors.includes(row.tenor) && Number.isFinite(row.weighted_avg_rate))
    .sort((a, b) => b.value_date.localeCompare(a.value_date) || a.tenor - b.tenor);
  return {
    updatedAt: raw.updated_at ?? null,
    sourcePage: raw.source_page ?? "https://www.centralbank.go.ke/bills-bonds/treasury-bills/",
    rows,
    notices: Object.values(raw.sources ?? {}).filter((s) => s.status === "parsed").length,
  };
});

export function latestByTenor(rows: TbillAuction[]) {
  const out = new Map<Tenor, { latest: TbillAuction; previous?: TbillAuction }>();
  for (const tenor of tenors) {
    const list = rows.filter((row) => row.tenor === tenor);
    if (list[0]) out.set(tenor, { latest: list[0], previous: list[1] });
  }
  return out;
}

/** Auctions grouped by value date, ascending, for charting. */
export function rateHistory(rows: TbillAuction[], since?: string) {
  const byDate = new Map<string, Record<string, number | null>>();
  for (const row of rows) {
    if (since && row.value_date < since) continue;
    const entry = byDate.get(row.value_date) ?? { "91": null, "182": null, "364": null };
    entry[String(row.tenor)] = row.weighted_avg_rate;
    byDate.set(row.value_date, entry);
  }
  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, values]) => ({ date, values }));
}

/** Auctions as whole weeks (all tenors on one value date), newest first. */
export function auctionWeeks(rows: TbillAuction[], limit = 52) {
  const weeks = new Map<string, TbillAuction[]>();
  for (const row of rows) weeks.set(row.value_date, [...(weeks.get(row.value_date) ?? []), row]);
  return [...weeks.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, limit)
    .map(([date, list]) => {
      const sum = (key: keyof TbillAuction) => list.reduce((total, row) => total + (Number(row[key]) || 0), 0);
      const offered = sum("offered_kes_m");
      const received = sum("received_kes_m");
      const accepted = sum("accepted_kes_m");
      return {
        date,
        rows: list.sort((a, b) => a.tenor - b.tenor),
        offered,
        received,
        accepted,
        subscription: offered ? (received / offered) * 100 : null,
        source: list[0]?.source,
      };
    });
}

export function tbillsCsv(file: TbillFile) {
  const header = [
    "value_date",
    "tenor_days",
    "issue",
    "maturity",
    "offered_kes_m",
    "received_kes_m",
    "subscription_pct",
    "accepted_kes_m",
    "competitive_kes_m",
    "noncompetitive_kes_m",
    "weighted_avg_rate_pct",
    "market_weighted_avg_rate_pct",
    "price_per_100",
    "source_notice",
  ];
  const cell = (value: unknown) => (value == null ? "" : String(value));
  const lines = file.rows.map((row) =>
    [
      row.value_date,
      row.tenor,
      row.issue,
      row.maturity,
      row.offered_kes_m,
      row.received_kes_m,
      row.subscription_pct,
      row.accepted_kes_m,
      row.competitive_kes_m,
      row.noncompetitive_kes_m,
      row.weighted_avg_rate,
      row.market_weighted_avg_rate,
      row.price_per_100,
      `"${row.source}"`,
    ]
      .map(cell)
      .join(","),
  );
  return [
    "# Kenya Treasury bill auctions, one row per auction per tenor",
    `# Source: Central Bank of Kenya result notices (${file.sourcePage}). Each row links to its notice.`,
    `# Compiled by Afronomics (afronomicsfeed.com). Updated ${file.updatedAt ?? "n/a"}. Amounts in KES millions; rates in % p.a.`,
    header.join(","),
    ...lines,
  ].join("\n");
}
