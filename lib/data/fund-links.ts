import { loadKenyaRates } from "./kenya-rates";

/**
 * "Open an account" links for the Kenya money market fund table: each goes through /go/fund/<slug>, which counts
 * the click (partner_click, path /go/fund/<slug>) and sends the reader to the manager's own site. A manager's
 * referral link, once agreed, is set as env AFF_FUND_<SLUG> (https only) and replaces the page; it never changes
 * the order, which is by yield after tax alone.
 */

export const fundSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** The fund behind a slug, from the latest read of the managers' pages. */
export function fundBySlug(slug: string) {
  const rows = loadKenyaRates().money_market_funds?.rows ?? [];
  return rows.find((f) => fundSlug(f.name) === slug) ?? null;
}

/** The manager's referral link if one is set, otherwise the home page of the site we read the yield from (the
 * yield itself is often a fact-sheet PDF, which is no place to open an account). */
export function fundUrl(slug: string, source: string) {
  const env = process.env[`AFF_FUND_${slug.replace(/-/g, "_").toUpperCase()}`];
  if (env && env.startsWith("https://")) return env;
  try {
    return `${new URL(source).origin}/`;
  } catch {
    return source;
  }
}
