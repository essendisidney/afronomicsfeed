import fs from "node:fs";
import path from "node:path";
import { billMarkets, loadBillMarket, type BillMarket } from "@/lib/data/sovereign-bills";
import { bondMarkets, loadBondMarket, type BondMarket } from "@/lib/data/sovereign-bonds";

/**
 * When each dataset last changed, for the sitemap's lastModified and the Dataset JSON-LD's dateModified. Read from the
 * data file's own "updated"/"updated_at" field; when a file has none, the newest row's date stands in.
 */

const toDate = (value: string | null | undefined) => {
  if (!value) return null;
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value);
  if (Number.isNaN(d.getTime())) return null;
  // A settlement date can lie a day or two ahead of the auction; a page cannot have changed in the future.
  const now = new Date();
  return d > now ? now : d;
};

/** The newest of several dates, or null when none is known. */
export function newest(...dates: (Date | null | undefined)[]): Date | null {
  return dates.reduce<Date | null>((best, d) => (d && (!best || d > best) ? d : best), null);
}

function span(dates: string[]) {
  if (!dates.length) return { first: null, last: null };
  const sorted = [...dates].sort();
  return { first: sorted[0], last: sorted[sorted.length - 1] };
}

/** First and last auction date in a market's Treasury bill file. */
export function billSpan(slug: BillMarket["slug"]) {
  return span(loadBillMarket(slug).rows.map((r) => r.date));
}

/** First and last auction date in a market's government bond file. */
export function bondSpan(slug: BondMarket["slug"]) {
  return span(loadBondMarket(slug).rows.map((r) => r.date));
}

export function billUpdated(slug: BillMarket["slug"]): Date | null {
  const { updatedAt } = loadBillMarket(slug);
  return toDate(updatedAt) ?? toDate(billSpan(slug).last);
}

export function bondUpdated(slug: BondMarket["slug"]): Date | null {
  const { updatedAt } = loadBondMarket(slug);
  return toDate(updatedAt) ?? toDate(bondSpan(slug).last);
}

export const allBillsUpdated = () => newest(...billMarkets.map((m) => billUpdated(m.slug)));
export const allBondsUpdated = () => newest(...bondMarkets.map((m) => bondUpdated(m.slug)));

/** A JSON file under data/ with a top-level "updated" or "updated_at" field. */
export function fileUpdated(relative: string): Date | null {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", relative), "utf8")) as { updated?: string; updated_at?: string };
    return toDate(raw.updated_at ?? raw.updated ?? null);
  } catch {
    return null;
  }
}
