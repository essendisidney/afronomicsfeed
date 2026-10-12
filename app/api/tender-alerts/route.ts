import { sendEmail } from "@/lib/mail";
import { tenderConfirmationEmail } from "@/lib/tender-alerts";
import { parseKeywords } from "@/lib/tenders-core";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";

// Best-effort, per-instance limit on requests from one address (in memory only). The database function enforces
// the real limits: per email per hour, and unconfirmed requests overall.
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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const done = "Check your inbox: open the link in the email we just sent to switch your tender alerts on.";

/** Sign up for tender alerts (double opt-in): stores the keywords unconfirmed and emails the confirmation link. */
export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (throttled(ip)) return Response.json({ ok: false, reason: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  const body = (await request.json().catch(() => null)) as { email?: string; keywords?: unknown; website?: string } | null;
  if (body?.website) return Response.json({ ok: true, message: done }); // honeypot
  const email = (body?.email ?? "").trim().toLowerCase();
  if (!emailPattern.test(email) || email.length > 200) return Response.json({ ok: false, reason: "Please enter a valid email address." }, { status: 400 });
  const keywords = parseKeywords(body?.keywords);
  if (!keywords.length) return Response.json({ ok: false, reason: "Add at least one keyword, like “ICT”, “cleaning” or a county." }, { status: 400 });

  const secret = process.env.AF_CRON_SECRET;
  if (!secret) return Response.json({ ok: false, reason: "Alerts are not available right now. Please try again later." }, { status: 503 });
  const result = await rpc("af_tender_alert_create", { p_secret: secret, p_email: email, p_keywords: keywords });
  const value = result.ok ? (result.value as { status?: string; token?: string; resend?: boolean } | null) : null;
  if (!value?.status) {
    console.log(`[tender-alerts] create failed: ${result.ok ? "no result (secret mismatch?)" : result.reason}`);
    return Response.json({ ok: false, reason: "That didn’t go through. Please try again." }, { status: 502 });
  }
  if (value.status === "limited") return Response.json({ ok: false, reason: "Too many requests for this address. Please try again later." }, { status: 429 });
  if (value.status === "pending" && value.resend && value.token) {
    const mail = tenderConfirmationEmail(keywords, value.token);
    const sent = await sendEmail(email, mail.subject, mail.html, mail.text);
    if (!sent.ok) {
      console.log(`[tender-alerts] confirmation not sent: ${sent.reason}`);
      return Response.json({ ok: false, reason: "We couldn’t send the confirmation email. Please try again later." }, { status: 502 });
    }
  }
  // Same answer whether new, pending or already on, so the form never reveals who has signed up.
  return Response.json({ ok: true, message: done });
}
