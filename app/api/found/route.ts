import { isAutomated, isInternalCall } from "@/lib/bots";
import { parseFoundInput } from "@/lib/found";
import { recomputeFound } from "@/lib/found-server";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Count one "shillings found" result (docs/rebuild/upgrade-U2-plan.md §3, D-029). The browser sends the tool and the
 * reader's inputs once the line has shown a positive difference (lib/found-client.ts, after 1.5 s without typing, at
 * most once per tool per page view, never from an owner device). Here:
 *
 *   1. Only a browser's same-site request that came in through Vercel's edge is considered (no scripts, crawlers,
 *      cross-site posts, or local and CI servers).
 *   2. The inputs are validated strictly (lib/found.ts parseFoundInput) and the difference is recomputed from our own
 *      data files with the same code the page uses; the browser never supplies a comparable or a difference.
 *   3. A difference above the cap (KES 500,000 a year; USD 2,000 on sending money home; the KES cap converted for cedis
 *      and naira, or nothing counted without a rate) is refused, not trimmed.
 *   4. One result per tool per page view (the page-view id is random, held in memory for an hour, never stored), and
 *      at most a few dozen counts a minute per server instance.
 *   5. Only the tool, the market, the currency and the difference in cents reach the database, through af_found_add,
 *      which needs the cron secret (migration 0046). The inputs are dropped when this function returns.
 *
 * Every outcome answers 204 with no body, so the reader never sees an error, and until migration 0046 is applied (or
 * without the secret) nothing is counted and nothing fails.
 */

const done = () => new Response(null, { status: 204 });

const seen = new Map<string, number>();
const HOUR = 3_600_000;
let windowStart = 0;
let windowCount = 0;
const PER_MINUTE = 40;

function firstTime(key: string, now: number) {
  if (seen.size > 5000) for (const [k, t] of seen) if (now - t > HOUR || seen.size > 4000) seen.delete(k);
  const t = seen.get(key);
  if (t != null && now - t < HOUR) return false;
  seen.set(key, now);
  return true;
}

function underRate(now: number) {
  if (now - windowStart > 60_000) {
    windowStart = now;
    windowCount = 0;
  }
  windowCount += 1;
  return windowCount <= PER_MINUTE;
}

/** Same site only: a browser's fetch from our own pages carries Sec-Fetch-Site same-origin, or a matching Origin. */
function fromOurPage(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (isAutomated(request.headers.get("user-agent")) || isInternalCall(request.headers) || !fromOurPage(request)) return done();
  const text = await request.text().catch(() => "");
  if (!text || text.length > 2000) return done();
  let raw: unknown = null;
  try {
    raw = JSON.parse(text);
  } catch {
    return done();
  }
  const view = (raw as { view?: unknown } | null)?.view;
  const input = parseFoundInput(raw);
  if (!input || typeof view !== "string" || !/^[A-Za-z0-9-]{8,64}$/.test(view)) return done();

  const { result, minor } = await recomputeFound(input).catch(() => ({ result: null, minor: null }));
  if (!result || minor == null) return done();

  const now = Date.now();
  if (!firstTime(`${view}:${input.tool}`, now) || !underRate(now)) return done();

  const secret = process.env.AF_CRON_SECRET;
  if (!secret) return done();
  await rpc("af_found_add", { p_tool: result.tool, p_market: result.market, p_currency: result.currency, p_minor: minor, p_secret: secret }).catch(() => null);
  return done();
}
