import { sendEmail } from "@/lib/mail";
import { alertSnapshot, confirmationEmail } from "@/lib/rate-alerts";
import { currentKey, parseAlertInput } from "@/lib/rate-alerts-core";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";

// Best-effort, per-instance limit on requests from one address (kept in memory only, never stored). The database
// function enforces the real limits: per email, per hour, and overall.
const WINDOW_MS = 10 * 60 * 1000;
const PER_WINDOW = 6;
const recent = new Map<string, number[]>();

function throttled(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) for (const [k, v] of recent) if (now - (v.at(-1) ?? 0) > WINDOW_MS) recent.delete(k);
  return hits.length > PER_WINDOW;
}

const done = "Check your inbox: open the link in the email we just sent to switch the alert on.";

/** Create an email rate alert (double opt-in): stores it unconfirmed and emails the confirmation link. */
export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (throttled(ip)) return Response.json({ ok: false, reason: "Too many requests. Please try again in a few minutes." }, { status: 429 });

  const parsed = parseAlertInput(await request.json().catch(() => null));
  if (!parsed.ok) return Response.json({ ok: false, reason: parsed.reason }, { status: 400 });
  const alert = parsed.value;

  const secret = process.env.AF_CRON_SECRET;
  if (!secret) return Response.json({ ok: false, reason: "Alerts are not available right now. Please try again later." }, { status: 503 });

  const baseline = currentKey(alert.kind, alert.tenor, alertSnapshot());
  const result = await rpc("af_rate_alert_create", {
    p_email: alert.email,
    p_kind: alert.kind,
    p_tenor: alert.tenor,
    p_threshold: alert.threshold,
    p_baseline: baseline,
    p_secret: secret,
  });
  const value = result.ok ? (result.value as { status?: string; token?: string; resend?: boolean } | null) : null;
  if (!value?.status) {
    console.log(`[rate-alerts] create failed: ${result.ok ? "no result (secret mismatch?)" : result.reason}`);
    return Response.json({ ok: false, reason: "That didn’t go through. Please try again." }, { status: 502 });
  }
  if (value.status === "limited") return Response.json({ ok: false, reason: "Too many alert requests for this address. Please try again later." }, { status: 429 });
  // Same answer whether the alert is new, pending or already on, so the form never reveals who has signed up.
  if (value.status === "pending" && value.resend && value.token) {
    const mail = confirmationEmail(alert, value.token);
    const sent = await sendEmail(alert.email, mail.subject, mail.html, mail.text);
    if (!sent.ok) {
      console.log(`[rate-alerts] confirmation not sent: ${sent.reason}`);
      return Response.json({ ok: false, reason: "We couldn’t send the confirmation email. Please try again later." }, { status: 502 });
    }
  }
  return Response.json({ ok: true, message: done });
}
