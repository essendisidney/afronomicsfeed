import { bearerOk, redactEmails } from "@/lib/security";
import { paystackLive } from "@/lib/billing/paystack";
import { loadTenders } from "@/lib/data/tenders";
import { sendEmail } from "@/lib/mail";
import { rpc } from "@/lib/store";
import { tenderDigestEmail, tenderPaymentEmail, type LiveTenderAlert } from "@/lib/tender-alerts";
import { matches, type Tender } from "@/lib/tenders-core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const HOUR = 3600_000;
const MAX_ITEMS = 40;
const nairobi = (ms: number) => new Date(ms + 3 * HOUR);
const today = (ms: number) => nairobi(ms).toISOString().slice(0, 10);

/**
 * Sends tender alerts that are due. Called with the shared secret by the African auctions workflow after each data
 * refresh; never from the browser. Each confirmed alert gets at most one email a day (from 06:00 Nairobi): its
 * first email lists every open matching tender; later ones only tenders first seen since the last email (the
 * regulator publishes its open data about monthly, so most days have none), and
 * nothing is sent on a day with no new match. After the free trial, an alert needs paid_until to keep going; while
 * there is no way to pay (no live Paystack key and no af_secrets 'tender_pay') alerts stay free. ?dry=1 reports without sending.
 */
export async function POST(request: Request) {
  const secret = process.env.AF_CRON_SECRET;
  if (!secret || !bearerOk(request, secret)) return new Response("forbidden", { status: 403 });
  const dry = new URL(request.url).searchParams.get("dry") === "1";
  const now = Date.now();
  const file = loadTenders();
  const base = { dry, deployment: process.env.VERCEL_GIT_COMMIT_SHA ?? null, open: file?.tenders.length ?? 0 };
  if (!file) return Response.json({ ...base, sent: 0, reason: "no tender data" });
  if (nairobi(now).getUTCHours() < 6) return Response.json({ ...base, sent: 0, reason: "before 06:00 Nairobi" });

  const list = await rpc("af_tender_alerts_live", { p_secret: secret });
  const value = list.ok ? (list.value as { pay: string | null; alerts: LiveTenderAlert[] } | null) : null;
  if (!value) return Response.json({ ...base, sent: 0, reason: `alerts: ${list.ok ? "no result" : list.reason}` }, { status: 502 });
  // Paystack with a live key is the way to pay; otherwise instructions set in af_secrets 'tender_pay'; with
  // neither, alerts stay free.
  const pay = paystackLive() ? "paystack" : value.pay?.trim() || null;
  const day = today(now);
  const stamp = new Date(now).toISOString();
  const isNew = (t: Tender, since: string) => t.first_seen !== "before" && Date.parse(t.first_seen) > Date.parse(since);

  let sent = 0;
  let reminders = 0;
  let quiet = 0;
  let skipped = 0;
  const failures: string[] = [];
  for (const a of value.alerts) {
    if (a.last_sent_at && now - Date.parse(a.last_sent_at) < 20 * HOUR) continue; // once a day
    const active = !pay || (a.paid_until && a.paid_until >= day) || (a.trial_until && a.trial_until >= day);
    const matching = file.tenders.filter((t) => matches(t, a.keywords));

    if (!active) {
      // Trial over, unpaid: a short payment note at most weekly, three weeks running, then nothing.
      const recentlyReminded = a.reminded_at && now - Date.parse(a.reminded_at) < 7 * 24 * HOUR;
      const tooLate = a.trial_until && Date.parse(`${a.trial_until}T00:00:00+03:00`) < now - 21 * 24 * HOUR;
      if (recentlyReminded || tooLate || !a.trial_until) continue;
      reminders += 1;
      if (dry) continue;
      if (!(await mark(secret, a.id, a.reminded_at, stamp, true))) {
        skipped += 1;
        continue;
      }
      const missed = matching.filter((t) => isNew(t, a.last_sent_at ?? `${a.trial_until}T00:00:00+03:00`)).length;
      const mail = tenderPaymentEmail({ keywords: a.keywords, token: a.token, pay: pay!, email: a.email, trialUntil: a.trial_until, missed });
      const r = await sendEmail(a.email, mail.subject, mail.html, mail.text, mail.unsubscribe);
      if (!r.ok) failures.push(redactEmails(r.reason));
      continue;
    }

    const first = !a.last_sent_at;
    const due = first ? matching : matching.filter((t) => isNew(t, a.last_sent_at!));
    if (!first && !due.length) {
      quiet += 1;
      continue;
    }
    if (dry) {
      sent += 1;
      continue;
    }
    if (!(await mark(secret, a.id, a.last_sent_at, stamp))) {
      skipped += 1;
      continue;
    }
    const daysLeft = a.trial_until && !(a.paid_until && a.paid_until >= day) ? Math.round((Date.parse(a.trial_until) - Date.parse(day)) / (24 * HOUR)) : null;
    const trialNote = pay && daysLeft != null && daysLeft <= 3 ? `Your free trial ends ${daysLeft <= 0 ? "today" : daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`}.` : null;
    const mail = tenderDigestEmail({ tenders: due.slice(0, MAX_ITEMS), total: due.length, keywords: a.keywords, token: a.token, first, trialNote, pay, email: a.email });
    const r = await sendEmail(a.email, mail.subject, mail.html, mail.text, mail.unsubscribe);
    if (r.ok) sent += 1;
    else {
      failures.push(redactEmails(r.reason));
      await mark(secret, a.id, stamp, a.last_sent_at); // hand it back to the next run
      if (r.reason.includes("RESEND_API_KEY")) break;
    }
    await new Promise((res) => setTimeout(res, 120)); // Resend allows ~10 requests a second
  }
  return Response.json({ ...base, alerts: value.alerts.length, paid: Boolean(pay), sent, reminders, quiet, skipped, failures: failures.slice(0, 5) });
}

async function mark(secret: string, id: string, prev: string | null, at: string | null, reminded = false) {
  const r = await rpc("af_tender_alert_mark", { p_secret: secret, p_id: id, p_prev: prev, p_at: at, p_reminded: reminded });
  return r.ok && r.value === true;
}
