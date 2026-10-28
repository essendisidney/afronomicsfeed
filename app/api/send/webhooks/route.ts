import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { bearerOk } from "@/lib/security";
import { rpc } from "@/lib/store";
import { auctionEvents, signature, subscriptionSecret } from "@/lib/webhooks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

type Target = { id: number; url: string; markets: string[] | null };

/**
 * Sends auction.published webhooks to data-licence holders (migration 0050). Called with the shared secret by the
 * African auctions workflow after its data commit has deployed; never from the browser. Each event is claimed per
 * subscription before the POST, so a rerun never sends twice; a receiver that does not answer 2xx within 10 seconds
 * has its claim handed back for the next run, until the result is older than the event window (lib/webhooks.ts).
 * Nothing is emailed. Until 0050 is applied it reports "not set up". ?dry=1 lists what would go without sending.
 */
export async function POST(request: Request) {
  const secret = process.env.AF_CRON_SECRET;
  if (!secret || !bearerOk(request, secret)) return new Response("forbidden", { status: 403 });
  const dry = new URL(request.url).searchParams.get("dry") === "1";
  const base = { dry, deployment: process.env.VERCEL_GIT_COMMIT_SHA ?? null };
  const events = auctionEvents(billMarkets.map((m) => ({ market: m.slug, rows: loadBillMarket(m.slug).rows })));
  if (!events.length) return Response.json({ ...base, events: 0, sent: 0, reason: "no recent auction results" });

  const list = await rpc("af_webhook_targets", { p_secret: secret });
  if (!list.ok) {
    const missing = /af_webhook_targets|PGRST202|404/.test(list.reason);
    return Response.json({ ...base, events: events.length, sent: 0, reason: missing ? "not set up: apply migration 0050_webhooks.sql" : "targets could not be read" }, { status: missing ? 200 : 502 });
  }
  const targets = Array.isArray(list.value) ? (list.value as Target[]) : [];
  if (!targets.length) return Response.json({ ...base, events: events.length, subscriptions: 0, sent: 0, reason: "no webhook subscriptions" });

  let sent = 0;
  let already = 0;
  let due = 0;
  let failed = 0;
  for (const target of targets) {
    const key = subscriptionSecret(secret, target.id);
    if (!key) continue;
    for (const event of events) {
      if (target.markets?.length && !target.markets.includes(event.market)) continue;
      due += 1;
      if (dry) continue;
      const claim = await rpc("af_webhook_claim", { p_secret: secret, p_sub: target.id, p_event: event.id });
      if (!claim.ok || claim.value !== true) {
        already += claim.ok ? 1 : 0;
        continue;
      }
      const body = JSON.stringify(event);
      const t = Math.floor(Date.now() / 1000);
      let status = 0;
      try {
        const res = await fetch(target.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", "User-Agent": "Afronomics-Webhooks/1", "X-Afronomics-Event": event.type, "X-Afronomics-Delivery": event.id, "X-Afronomics-Signature": signature(key, body, t) },
          body,
          redirect: "manual",
          signal: AbortSignal.timeout(10_000),
        });
        status = res.status;
      } catch {
        status = 0;
      }
      await rpc("af_webhook_result", { p_secret: secret, p_sub: target.id, p_event: event.id, p_status: status });
      if (status >= 200 && status < 300) sent += 1;
      else failed += 1;
    }
  }
  return Response.json({ ...base, events: events.length, subscriptions: targets.length, due, sent, already, failed });
}
