import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { PremiumFile } from "@/lib/poverty-premium";

/**
 * The published Kenya Poverty Premium files (data/kenya/poverty_premium/YYYY-MM.json, written monthly by
 * scripts/poverty_premium.mjs). The page shows a file as written; nothing here recomputes a figure.
 */

const DIR = path.join(process.cwd(), "data", "kenya", "poverty_premium");

/** Every month we have published, newest first. */
export const premiumMonths = cache((): string[] =>
  fs.existsSync(DIR)
    ? fs
        .readdirSync(DIR)
        .filter((f) => /^\d{4}-\d{2}\.json$/.test(f))
        .map((f) => f.slice(0, 7))
        .sort()
        .reverse()
    : [],
);

export const loadPremium = cache((month: string): PremiumFile | null => {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  const file = path.join(DIR, `${month}.json`);
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as PremiumFile) : null;
});

export function latestPremium(): PremiumFile | null {
  const month = premiumMonths()[0];
  return month ? loadPremium(month) : null;
}

/** The CSV written beside a month's JSON, without its trailing newline. */
export function premiumCsvFile(month: string): string | null {
  if (!/^\d{4}-\d{2}$/.test(month)) return null;
  const file = path.join(DIR, `${month}.csv`);
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8").trimEnd() : null;
}
