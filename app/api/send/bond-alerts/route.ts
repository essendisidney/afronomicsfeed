import { bondAlertEmail, newBondAuctions, type BondRecipient } from "@/lib/bond-alerts";
import { loadLatency } from "@/lib/data/latency";
import { bondMarkets, getBondMarket, loadBondMarket } from "@/lib/data/sovereign-bonds";
import { sendEmail } from "@/lib/mail";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Sends bond-result email alerts to API key holders. Called with the shared secret by the African auctions workflow
 * after its data commit has deployed; never from the browser. New auctions are the bond results data/latency.json
 * says a reader first saw in the last 48 hours (results on file before measuring began never count). Every live key
 * with an email (pilot or paid, not revoked or expired, not unsubscribed) gets one email per market per auction day:
 * each send is claimed in key_alert_sends first, so running this again, or two runs at once, never sends an auction
 * twice; a failed send hands its claim back for the next run. With no recipients it sends nothing. Until migration
 * 0037 is applied it reports "not set up". ?dry=1 reports what would go out without claiming or sending.
 */
export async function POST(request: Request) {
  const secret = process.env.AF_CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("forbidden", { status: 403 });
  const dry = new URL(request.url).searchParams.get("dry") === "1";
  const now = Date.now();
  const latency = loadLatency();
  const base = { dry, deployment: process.env.VERCEL_GIT_COMMIT_SHA ?? null };
  if (!latency) return Response.json({ ...base, sent: 0, reason: "no latency record yet (data/latency.json)" });

  const auctions = newBondAuctions(
    latency.results,
    bondMarkets.map((m) => m.slug),
    now,
  )
    .map((a) => ({ ...a, rows: loadBondMarket(a.market).rows.filter((r) => r.date === a.date) }))
    .filter((a) => a.rows.length); // e.g. a Morocco day with bill lines only: no bond lines to send
  const found = auctions.map((a) => `${a.market} ${a.date} (${a.rows.length})`);
  if (!auctions.length) return Response.json({ ...base, auctions: found, sent: 0, reason: "no new bond auctions" });

  const list = await rpc("af_bond_alert_recipients", { p_secret: secret });
  if (!list.ok) {
    const missing = /af_bond_alert_recipients|PGRST202|404/.test(list.reason);
    return Response.json({ ...base, auctions: found, sent: 0, reason: missing ? "not set up: apply migration 0037_bond_alerts.sql" : `recipients: ${list.reason}` }, { status: missing ? 200 : 502 });
  }
  const recipients = Array.isArray(list.value) ? (list.value as BondRecipient[]) : [];
  if (!recipients.length) return Response.json({ ...base, auctions: found, recipients: 0, sent: 0, reason: "no key holders to email" });

  let sent = 0;
  let already = 0;
  let due = 0;
  const failures: string[] = [];
  outer: for (const a of auctions) {
    const market = getBondMarket(a.market)!;
    for (const who of recipients) {
      if (who.markets?.length && !who.markets.includes(a.market)) continue;
      due += 1;
      if (dry) continue;
      const claim = await rpc("af_bond_alert_claim", { p_secret: secret, p_email: who.email, p_market: a.market, p_date: a.date });
      if (!claim.ok || claim.value !== true) {
        if (!claim.ok) failures.push(claim.reason);
        else already += 1;
        continue;
      }
      const mail = bondAlertEmail({ market, date: a.date, rows: a.rows, token: who.token });
      const result = await sendEmail(who.email, mail.subject, mail.html, mail.text, mail.unsubscribe);
      if (result.ok) sent += 1;
      else {
        failures.push(result.reason);
        await rpc("af_bond_alert_release", { p_secret: secret, p_email: who.email, p_market: a.market, p_date: a.date });
        if (result.reason.includes("RESEND_API_KEY")) break outer;
      }
      await new Promise((r) => setTimeout(r, 120)); // Resend allows ~10 requests a second
    }
  }
  return Response.json({ ...base, auctions: found, recipients: recipients.length, due, sent, already, failures: failures.slice(0, 5) });
}
