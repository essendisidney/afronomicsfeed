import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { billMarkets, latestBills, loadBillMarket, type BillMarket } from "./sovereign-bills";

/**
 * Central-bank policy rates as each bank prints them on its own website (scripts/policy_rates.py), set
 * beside the same market's latest one-year bill: the gap says where the bill market thinks the rate is going.
 */

type PolicyRow = {
  market: BillMarket["slug"];
  publisher: string;
  source: string;
  label: string;
  rate: number;
  upper: number | null;
  date_as_printed: string | null;
  read_at: string;
};

type PolicyFile = { updated_at?: string; rows?: PolicyRow[]; unread?: { market: string; status: string }[] };

const FILE = path.join(process.cwd(), "data", "policy_rates.json");

export const loadPolicyRates = cache((): PolicyFile => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : {}));

export type PolicyView = PolicyRow & {
  market_name: string;
  href: string;
  bill: { rate: number; date: string } | null;
  /** One-year bill minus policy rate, percentage points. */
  gap: number | null;
};

export function policyBoard(): { rows: PolicyView[]; missing: { market: string; publisher: string }[]; updatedAt: string | null } {
  const file = loadPolicyRates();
  const read = new Map((file.rows ?? []).map((r) => [r.market, r]));
  const rows: PolicyView[] = [];
  const missing: { market: string; publisher: string }[] = [];
  for (const market of billMarkets) {
    const r = read.get(market.slug);
    if (!r) {
      missing.push({ market: market.country, publisher: market.publisher });
      continue;
    }
    const latest = latestBills(loadBillMarket(market.slug).rows).get(364)?.latest;
    rows.push({
      ...r,
      market_name: market.country,
      href: market.href,
      bill: latest ? { rate: latest.rate, date: latest.date } : null,
      gap: latest ? latest.rate - r.rate : null,
    });
  }
  rows.sort((a, b) => b.rate - a.rate);
  return { rows, missing, updatedAt: file.updated_at ?? null };
}
