import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

/**
 * What a mobile loan costs, as each provider publishes it (data/kenya/mobile_loans.json), put on the same
 * yardstick as a bank loan: the charge on KES 1,000 for the loan's term, and that charge as a simple yearly
 * rate. Fuliza charges a one-off access fee plus a daily fee by balance band; the KES 1,000 band is used.
 * A provider that publishes a "from" rate is shown as the lowest it charges, and labelled so.
 */

type MobileLoanRow = {
  product: string;
  provider: string;
  source: string;
  read_on: string;
  as_published: string;
  basis: "flat" | "per_day" | "access_plus_daily";
  pct: number;
  daily_kes_per_1000?: number; // access_plus_daily: the published daily fee (with excise) for a KES 1,000 balance
  days: number;
  from: boolean;
};

const FILE = path.join(process.cwd(), "data", "kenya", "mobile_loans.json");

export const loadMobileLoans = cache((): MobileLoanRow[] => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")).rows : []));

export type MobileLoanView = MobileLoanRow & {
  termCostPct: number; // % of the amount borrowed, over `days`
  costPer1000: number; // KES, over `days`
  yearlySimple: number; // % a year, simple (term cost × 365 / days)
};

export function mobileLoanBoard(): MobileLoanView[] {
  return loadMobileLoans()
    .map((r) => {
      const termCostPct =
        r.basis === "flat" ? r.pct : r.basis === "per_day" ? r.pct * r.days : r.pct + ((r.daily_kes_per_1000 ?? 0) * r.days) / 10;
      return { ...r, termCostPct, costPer1000: (1000 * termCostPct) / 100, yearlySimple: (termCostPct * 365) / r.days };
    })
    .sort((a, b) => a.yearlySimple - b.yearlySimple);
}
