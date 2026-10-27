/**
 * The ASBI revision check: each Monday release (editions/index/<date>.json) is frozen as published. The live series
 * is recomputed from the auctions we hold now, so a result that arrives after the release, or a restated one, moves
 * the recomputed value for that week. This compares the two and lists every difference.
 *
 * Pure, no imports, so tests/site/test_index_revisions.py can run it. The loader is lib/data/index-releases.ts.
 */

export type PublishedRelease = {
  file: string; // e.g. 2026-10-05
  week: string; // the reading date (Monday) the release was for, YYYY-MM-DD
  rates: { country: string; rate: number; date: string }[];
};

export type RecomputedPoint = { date: string; value: number; markets: number };

export type RevisionRow = {
  week: string;
  file: string;
  published: number; // the release's value: the mean of the rates it printed, 3 decimals
  publishedMarkets: number;
  current: number | null; // the recomputed value for the same week
  currentMarkets: number | null;
  diffBps: number | null; // current − published, basis points, 1 decimal
  changed: { country: string; published: { rate: number; date: string } | null; current: { rate: number; date: string } | null }[];
};

const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** The value a release printed, rebuilt from its own table: the simple average of the rates it listed. */
export function publishedValue(rel: PublishedRelease) {
  if (!rel.rates.length) return null;
  return r3(rel.rates.reduce((a, b) => a + b.rate, 0) / rel.rates.length);
}

/**
 * Compare frozen releases with the recomputed series. `currentRates` gives, for a week, the rate and auction date
 * per country used in the recomputed value (so the log can say which market moved).
 */
export function compareReleases(
  releases: PublishedRelease[],
  series: RecomputedPoint[],
  currentRates: (week: string) => { country: string; rate: number; date: string }[],
): RevisionRow[] {
  return releases
    .map((rel) => {
      const published = publishedValue(rel);
      if (published == null) return null;
      const point = series.find((p) => p.date === rel.week) ?? null;
      const now = currentRates(rel.week);
      const countries = [...new Set([...rel.rates.map((r) => r.country), ...now.map((r) => r.country)])].sort();
      const changed = countries.flatMap((country) => {
        const a = rel.rates.find((r) => r.country === country) ?? null;
        const b = now.find((r) => r.country === country) ?? null;
        const same = a && b && a.date === b.date && Math.abs(a.rate - b.rate) < 1e-9;
        return same ? [] : [{ country, published: a ? { rate: a.rate, date: a.date } : null, current: b ? { rate: b.rate, date: b.date } : null }];
      });
      return {
        week: rel.week,
        file: rel.file,
        published,
        publishedMarkets: rel.rates.length,
        current: point ? r3(point.value) : null,
        currentMarkets: point ? point.markets : null,
        diffBps: point ? Math.round((point.value - published) * 1000) / 10 : null,
        changed,
      };
    })
    .filter((r): r is RevisionRow => r != null)
    .sort((a, b) => b.week.localeCompare(a.week));
}
