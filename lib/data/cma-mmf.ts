import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

/**
 * Every licensed money market fund in Kenya and its size, from the Capital Markets Authority's quarterly
 * Collective Investment Schemes report (scripts/cma_mmf.py). Sizes only: yields come from the managers' own
 * pages (lib/data/kenya-rates.ts).
 */

export type CmaFund = { rank: number; scheme: string; fund: string; currency: "KES" | "USD"; aum_kes: number; share_pct: number };

type CmaFile = { publisher: string; report: string; as_of: string; source: string; total_aum_kes: number; rows: CmaFund[] };

const FILE = path.join(process.cwd(), "data", "kenya", "cma_mmf.json");

export const loadCmaFunds = cache((): CmaFile | null => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : null));

// CMA's fund name -> the name Afronomics reads the daily yield under (scripts/kenya_rates.py FUNDS).
const DAILY: Record<string, string> = {
  "Madison Money Market Fund": "Madison Money Market Fund",
  "Etica Money Market Fund": "Etica Money Market Fund (KES)",
  "Orient Kasha Money Market Fund": "Kasha Money Market Fund",
  "CIC Money Market Fund": "CIC Money Market Fund",
};

export const dailyYieldName = (cmaFund: string) => DAILY[cmaFund] ?? null;

export function cmaFundsCsv() {
  const f = loadCmaFunds();
  const lines = ["as_of,rank,scheme,fund,currency,aum_kes,share_pct,source"];
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  for (const r of f?.rows ?? []) lines.push([f!.as_of, r.rank, q(r.scheme), q(r.fund), r.currency, r.aum_kes, r.share_pct, f!.source].join(","));
  return lines.join("\n") + "\n";
}
