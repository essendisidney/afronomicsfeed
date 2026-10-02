import { site } from "@/lib/site";

/**
 * Email sending through Resend (free tier: 3,000 emails a month, 100 a day). Needs RESEND_API_KEY and a
 * verified sending domain. Without the key, send() reports that nothing went out rather than failing the caller.
 */
export const FROM = process.env.MAIL_FROM ?? "Afronomics <morning@afronomicsfeed.com>";

export type SendResult = { ok: true; id: string } | { ok: false; reason: string };

export async function sendEmail(to: string, subject: string, html: string, text: string, unsubscribeUrl?: string): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, reason: "RESEND_API_KEY not set" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM,
      to,
      subject,
      html,
      text,
      headers: unsubscribeUrl ? { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined,
      reply_to: site.contactEmail,
    }),
  }).catch(() => null);
  if (!res) return { ok: false, reason: "network" };
  const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
  return res.ok && body.id ? { ok: true, id: body.id } : { ok: false, reason: body.message ?? `${res.status}` };
}

/** Tokens in unsubscribe links: HMAC of the email, so a link can't be forged for someone else's address. */
export async function unsubscribeToken(email: string) {
  const secret = process.env.AF_CRON_SECRET ?? "";
  const data = new TextEncoder().encode(`${email.toLowerCase()}|${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, "0")).join("");
}

// Mail: RESEND_API_KEY on Vercel; sender morning@afronomicsfeed.com (domain verified in Resend).
