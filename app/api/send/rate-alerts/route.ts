import { sendEmail } from "@/lib/mail";
import { alertEmail, alertSnapshot } from "@/lib/rate-alerts";
import { alertKinds, dueCheck, type LiveAlert } from "@/lib/rate-alerts-core";
import { site } from "@/lib/site";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Sends the email rate alerts that are due. Called with the shared secret by the African auctions and Kenya
 * quick check workflows after their data refresh; never from the browser. Reads the data this deployment
 * carries, compares it with each confirmed alert's last_sent_key and records the new key after each send, so
 * running it again sends nothing twice. ?dry=1 reports what would go out without sending or recording.
 */
export async function POST(request: Request) {
  const secret = process.env.AF_CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("forbidden", { status: 403 });
  const dry = new URL(request.url).searchParams.get("dry") === "1";

  const list = await rpc("af_rate_alerts_live", { p_secret: secret });
  if (!list.ok || !Array.isArray(list.value)) return Response.json({ sent: 0, reason: `alerts: ${list.ok ? "bad shape" : list.reason}` }, { status: 502 });
  const alerts = (list.value as LiveAlert[]).filter((a) => (alertKinds as readonly string[]).includes(a.kind));

  const snapshot = alertSnapshot();
  let sent = 0;
  let baselined = 0;
  let skipped = 0;
  const due: Record<string, number> = {};
  const failures: string[] = [];
  const mark = async (id: string, prev: string | null, key: string, sentNow: boolean) => {
    const r = await rpc("af_rate_alert_mark_sent", { p_secret: secret, p_id: id, p_prev: prev, p_key: key, p_sent: sentNow });
    return r.ok && r.value === true;
  };
  for (const alert of alerts) {
    const check = dueCheck(alert, snapshot, site.url);
    if (check.action === "none") continue;
    if (check.action === "baseline") {
      baselined += 1;
      if (!dry) await mark(alert.id, null, check.key, false);
      continue;
    }
    due[alert.kind] = (due[alert.kind] ?? 0) + 1;
    if (dry) continue;
    // Claim first (compare-and-set on last_sent_key), so two overlapping runs can never both send.
    if (!(await mark(alert.id, alert.last_sent_key, check.key, true))) {
      skipped += 1;
      continue;
    }
    const mail = alertEmail(check.message, alert.token);
    const result = await sendEmail(alert.email, mail.subject, mail.html, mail.text, mail.unsubscribe);
    if (result.ok) sent += 1;
    else {
      failures.push(result.reason);
      await mark(alert.id, check.key, alert.last_sent_key ?? "", false); // hand it back to the next run
      if (result.reason.includes("RESEND_API_KEY")) break;
    }
    await new Promise((r) => setTimeout(r, 120)); // Resend allows ~10 requests a second
  }
  return Response.json({
    dry,
    alerts: alerts.length,
    due,
    sent,
    skipped,
    baselined,
    deployment: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
    latest: { kenya: snapshot.kenya.auctions[0]?.date ?? null, ngBond: snapshot.ngBond?.offer ?? null, policyChanges: snapshot.policy.changes.length },
    failures: failures.slice(0, 5),
  });
}
