import { sendEmail, unsubscribeToken } from "@/lib/mail";
import { site } from "@/lib/site";
import { rpc } from "@/lib/store";
import { welcomeEmail } from "@/lib/welcome-email";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const roles = new Set(["investor", "bank", "dfi", "corporate", "research", "founder", "other"]);


// Best-effort, per-instance limit on sign-ups from one address (in memory only); the database caps welcome emails.
const WINDOW_MS = 10 * 60 * 1000;
const recent = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) for (const [k, v] of recent) if (now - (v.at(-1) ?? 0) > WINDOW_MS) recent.delete(k);
  return hits.length > 5;
}

/** Newsletter sign-up. Writes to the `subscribers` table and sends a new subscriber one welcome email with the guide. */
export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (throttled(ip)) return Response.json({ ok: false, reason: "Too many sign-ups from here. Please try again in a few minutes." }, { status: 429 });
  const body = (await request.json().catch(() => null)) as { email?: string; role?: string; source?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const role = body?.role && roles.has(body.role) ? body.role : "other";
  const source = (body?.source ?? "").slice(0, 120);

  if (!emailPattern.test(email) || email.length > 200) {
    return Response.json({ ok: false, reason: "Please enter a valid email address." }, { status: 400 });
  }

  const result = await rpc("af_subscribe_v2", { p_email: email, p_role: role, p_source: source });
  if (!result.ok) {
    // Still visible in the deployment's function logs so no sign-up is lost.
    console.log(`[subscribe] ${JSON.stringify({ email, role, source, at: new Date().toISOString(), reason: result.reason })}`);
    return Response.json({ ok: true, stored: false });
  }
  if (result.value === "welcome") {
    const unsub = `${site.url}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${await unsubscribeToken(email)}`;
    const mail = welcomeEmail(unsub);
    const sent = await sendEmail(email, mail.subject, mail.html, mail.text, unsub);
    if (!sent.ok) console.log(`[subscribe] welcome not sent: ${sent.reason}`);
  }
  return Response.json({ ok: true, stored: true });
}
