/**
 * Who not to count. Requests are always served; these only decide what goes into page_views and events_daily.
 * Afronomics' own jobs identify themselves (the push-alert checker sends AfronomicsAlerts/1.0, the readers
 * AfronomicsBot/1.0, the site QA link checker AfronomicsSiteQA/1.0).
 *
 * Kept free of imports so tests/site/test_counting.py can run it directly with node.
 */
const CRAWLER = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|afronomics/i;
const SCRIPT = /curl|wget|python|axios|node-fetch|undici|go-http|java\/|deno/i;

/** Sent by our own scripts and tests when they call the site, so a call is never counted whatever its user agent. */
export const INTERNAL_HEADER = "x-afronomics-internal";

/** The part of Headers these checks read (a Fetch Headers object, or a plain stand-in in tests). */
export type HeaderReader = { get(name: string): string | null };

/** Page views: count browsers only. */
export function isAutomated(userAgent: string | null) {
  return !userAgent || CRAWLER.test(userAgent) || SCRIPT.test(userAgent);
}

/** API calls: scripts are the developers the API is for, so only crawlers and our own jobs are left out. */
export function isCrawlerOrOwnJob(userAgent: string | null) {
  return !!userAgent && CRAWLER.test(userAgent);
}

/**
 * A speculative load, not a person: browser link prefetch / prerender (Purpose, Sec-Purpose, X-Purpose, X-Moz)
 * and the Next.js router's own prefetch.
 */
export function isPrefetch(headers: HeaderReader) {
  const purpose = [headers.get("purpose"), headers.get("sec-purpose"), headers.get("x-purpose"), headers.get("x-moz")].filter(Boolean).join(" ");
  return /prefetch|prerender|preview/i.test(purpose) || headers.get("next-router-prefetch") === "1";
}

/**
 * A call made from inside: our own scripts and tests (they send INTERNAL_HEADER), or anything that did not come in
 * through Vercel's edge. Vercel sets x-vercel-ip-country on every request it receives from the internet, so a
 * request without it is a local or CI server (`next start` in the site QA), a build, or a call between our own
 * functions, and must never be counted in the production tables.
 */
export function isInternalCall(headers: HeaderReader) {
  if (headers.get(INTERNAL_HEADER)) return true;
  return !(headers.get("x-vercel-ip-country") ?? "").trim();
}

/**
 * An outbound referral click (/go/*): a person's GET, not HEAD (link checkers), not a prefetch, not a crawler,
 * script or our own job, and not an internal call.
 */
export function countsAsClick(method: string, headers: HeaderReader) {
  const userAgent = headers.get("user-agent");
  return method.toUpperCase() === "GET" && !isPrefetch(headers) && !isAutomated(userAgent) && !isInternalCall(headers);
}

/**
 * Open API usage (/api/v1/*): any outside GET counts, scripts included (they are who the API is for). Not HEAD or
 * OPTIONS, not prefetches, not crawlers or our own jobs, and not internal calls.
 */
export function countsAsApiCall(method: string, headers: HeaderReader) {
  return method.toUpperCase() === "GET" && !isPrefetch(headers) && !isCrawlerOrOwnJob(headers.get("user-agent")) && !isInternalCall(headers);
}
