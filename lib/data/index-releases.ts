import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { billIndexInputsOn, billIndexSeries } from "@/lib/data/bill-index";
import { compareReleases, type PublishedRelease } from "@/lib/index-revisions";

/**
 * The frozen Monday releases of the ASBI (editions/index/<date>.json, written by .github/workflows/index-release.yml)
 * and how each compares with the series recomputed from today's data. Feeds the revision log on
 * /markets/bill-index/method.
 */

const DIR = path.join(process.cwd(), "editions", "index");
const DAY = 86400000;

function mondayOnOrBefore(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7;
  return new Date(d.getTime() - dow * DAY).toISOString().slice(0, 10);
}

export const loadIndexReleases = cache((): PublishedRelease[] => {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .sort()
    .flatMap((f) => {
      try {
        const raw = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")) as { table?: { country: string; rate: number; date: string }[] };
        const rates = (raw.table ?? []).filter((t) => typeof t.rate === "number" && Number.isFinite(t.rate));
        const file = f.replace(/\.json$/, "");
        return rates.length ? [{ file, week: mondayOnOrBefore(file), rates: rates.map((t) => ({ country: t.country, rate: t.rate, date: t.date })) }] : [];
      } catch {
        return [];
      }
    });
});

export function indexRevisionRows() {
  return compareReleases(loadIndexReleases(), billIndexSeries(364), (week) => billIndexInputsOn(week, 364));
}
