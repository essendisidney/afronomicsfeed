/**
 * Who not to count. Requests are always served; these only decide what goes into page_views.
 * Afronomics' own jobs identify themselves (the push-alert checker sends AfronomicsAlerts/1.0).
 */
const CRAWLER = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|afronomics/i;
const SCRIPT = /curl|wget|python|axios|node-fetch|undici|go-http|java\/|deno/i;

/** Page views: count browsers only. */
export function isAutomated(userAgent: string | null) {
  return !userAgent || CRAWLER.test(userAgent) || SCRIPT.test(userAgent);
}

/** API calls: scripts are the developers the API is for, so only crawlers and our own jobs are left out. */
export function isCrawlerOrOwnJob(userAgent: string | null) {
  return !!userAgent && CRAWLER.test(userAgent);
}
