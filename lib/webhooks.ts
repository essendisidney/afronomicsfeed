import { createHmac } from "node:crypto";

/**
 * auction.published webhooks for data-licence holders (migration 0050; /developers#webhooks). Pure helpers, no app
 * imports, so tests run them under node (tests/site/test_webhooks.py).
 *
 * Each subscription's signing secret is derived from the site's cron secret and the subscription id, so it is never
 * stored; the desk shows it to pass on to the customer. A request carries
 *   X-Afronomics-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256 of "<t>.<body>" with the subscription secret>
 * and receivers should reject a timestamp more than five minutes old.
 */

export type AuctionRow = { tenor: number; date: string; rate: number; offered: number | null; received: number | null; accepted: number | null; source: string };
export type AuctionEvent = {
  id: string;
  type: "auction.published";
  market: string;
  instrument: "tbill";
  tenor_days: number;
  value_date: string;
  rate_pct: number;
  offered_m: number | null;
  received_m: number | null;
  accepted_m: number | null;
  source_url: string;
};

export const EVENT_DAYS = 4;

/** Results dated in the last EVENT_DAYS days, one event per market, tenor and date. Older results are never sent. */
export function auctionEvents(markets: { market: string; rows: AuctionRow[] }[], now = Date.now()): AuctionEvent[] {
  const since = new Date(now - EVENT_DAYS * 86_400_000).toISOString().slice(0, 10);
  const out: AuctionEvent[] = [];
  for (const { market, rows } of markets) {
    for (const r of rows) {
      if (r.date < since || !(r.rate > 0)) continue;
      out.push({
        id: `${market}:tbill:${r.tenor}:${r.date}`,
        type: "auction.published",
        market,
        instrument: "tbill",
        tenor_days: r.tenor,
        value_date: r.date,
        rate_pct: r.rate,
        offered_m: r.offered,
        received_m: r.received,
        accepted_m: r.accepted,
        source_url: r.source,
      });
    }
  }
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

export function subscriptionSecret(cronSecret: string, subscriptionId: number): string | null {
  if (cronSecret.length < 16 || !Number.isInteger(subscriptionId) || subscriptionId <= 0) return null;
  return `whsec_${createHmac("sha256", cronSecret).update(`afronomics-webhook:v1:${subscriptionId}`).digest("hex")}`;
}

export function signature(secret: string, body: string, t: number): string {
  return `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${body}`).digest("hex")}`;
}
