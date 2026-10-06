import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

/**
 * Kenya SACCO returns: the SACCO Societies Regulatory Authority's industry averages (its annual supervision report)
 * and each SACCO's declared dividend and deposit interest, quoted from the SACCO's own notice (data/kenya/saccos.json).
 */

export type SaccoRate = {
  name: string;
  dividend_pct: number | null;
  deposit_interest_pct: number | null;
  year: string;
  source_url: string;
  quote: string;
  tax_note?: string | null;
};

type Industry = {
  publisher: string;
  report: string;
  source: string;
  pages: string;
  regulated_saccos: number;
  dt_saccos: number;
  nwdt_saccos: number;
  members_million: number;
  total_assets_kes_bn: number;
  total_deposits_kes_bn: number;
  years: { year: number; dividend_pct: number; deposit_interest_pct: number }[];
  dt_dividend_2025_pct?: number;
  nwdt_dividend_2025_pct?: number;
};

type File = { industry: Industry; declared_year: number; saccos: SaccoRate[] };

const FILE = path.join(process.cwd(), "data", "kenya", "saccos.json");

export const loadSaccos = cache((): File | null => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : null));

export function saccoLatest() {
  const f = loadSaccos();
  const y = f?.industry.years.at(-1);
  return f && y ? { ...y, industry: f.industry } : null;
}
