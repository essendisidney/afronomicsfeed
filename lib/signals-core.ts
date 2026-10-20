/**
 * Reader signals (docs: this file), all anonymous: nothing here identifies a person, and nothing leaves the browser
 * except a bucket. They answer three questions the page-view count cannot:
 *
 * - Did people finish it? `read_depth` is sent once per page view as a story is scrolled past 25, 50, 75 and 100%,
 *   and `engaged` once the reader has spent 30 and 120 seconds on it with the tab in front and some activity in the
 *   last 15 seconds.
 * - Do they come back? `first_visit` is sent once per browser, tagged with the week it first saw us
 *   ("2026-w43"); `return_reader` once per browser per window (day 1-7, 8-28, 29-84 after the first visit), tagged
 *   with that same first week. Week-1 return rate = return_reader "<week>.w1" / first_visit "<week>".
 * - What do they look for and not find? `search_miss` keeps a search that returned nothing, cleaned to lowercase
 *   letters, digits and dashes. A query that could hold contact details (an "@", or six or more digits in a row,
 *   like a phone or ID number) is never sent.
 *
 * Each bucket is stored after a comma in events_daily.path ("/brief/x,50"), the same way shares keep their network,
 * so no column is added. The event names and the server's check of each bucket (signalSuffix) are in lib/track.ts.
 * Kept free of imports so tests can run it directly (tests/site/test_signals.py).
 */

export const DEPTHS = [25, 50, 75, 100] as const;
export const ENGAGED_SECONDS = [30, 120] as const;

/** Pages whose reading is measured: stories, Receipts and lessons. */
export const READING_PAGE = /^\/(brief|receipts|learn|stories)\/[^/]+$/;

const DAY = 86_400_000;

/** The depths (25/50/75/100) reached once `fraction` (0-1) of the page has been seen. */
export function depthsReached(fraction: number): number[] {
  // The last few pixels are footer and share bar; 97% counts as the end.
  const f = fraction >= 0.97 ? 1 : fraction;
  return DEPTHS.filter((d) => f * 100 >= d);
}

/** The ISO week of a YYYY-MM-DD date, as "2026-w43". */
export function cohortWeek(day: string): string {
  const d = new Date(`${day}T00:00:00Z`);
  const dow = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dow); // the Thursday of this week decides its year
  const year = d.getUTCFullYear();
  const week = Math.ceil(((d.getTime() - Date.UTC(year, 0, 1)) / DAY + 1) / 7);
  return `${year}-w${String(week).padStart(2, "0")}`;
}

/** Which return window a visit on `today` falls in, for a browser first seen on `firstSeen` (both YYYY-MM-DD). */
export function returnWindow(firstSeen: string, today: string): "w1" | "w2-4" | "w5-12" | null {
  const days = Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${firstSeen}T00:00:00Z`)) / DAY);
  if (!Number.isFinite(days) || days < 1) return null;
  if (days <= 7) return "w1";
  if (days <= 28) return "w2-4";
  if (days <= 84) return "w5-12";
  return null;
}

/** A search with no results, cleaned for storage; null when it is too short or could hold contact details. */
export function cleanSearch(query: string): string | null {
  const raw = query.trim().toLowerCase();
  if (raw.includes("@") || /\d{6,}/.test(raw.replace(/[\s.-]/g, ""))) return null;
  const q = raw
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60)
    .replace(/-$/, "");
  return q.length >= 3 ? q : null;
}
