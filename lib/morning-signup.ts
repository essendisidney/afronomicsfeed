import { redactEmails } from "@/lib/security";
import { sendEmail, unsubscribeToken } from "@/lib/mail";
import { site } from "@/lib/site";
import { rpc } from "@/lib/store";
import { welcomeEmail } from "@/lib/welcome-email";

/**
 * Add an address to the Morning list (af_subscribe_v2) and send a new subscriber the one welcome email. Shared by the
 * newsletter form (app/api/subscribe) and anything else that signs a reader up, such as "Call it" (app/api/call-it).
 * Logs carry the domain only, never the address.
 */
export async function joinMorning(email: string, role: string, source: string): Promise<{ ok: true } | { ok: false; reason: string }> {
  const result = await rpc("af_subscribe_v2", { p_email: email, p_role: role, p_source: source });
  if (!result.ok) {
    console.log(`[subscribe] not stored ${JSON.stringify({ domain: email.split("@")[1], role, source, at: new Date().toISOString(), reason: redactEmails(result.reason) })}`);
    return { ok: false, reason: result.reason };
  }
  if (result.value === "welcome") {
    const unsub = `${site.url}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${await unsubscribeToken(email)}`;
    const mail = welcomeEmail(unsub);
    const sent = await sendEmail(email, mail.subject, mail.html, mail.text, unsub);
    if (!sent.ok) console.log(`[subscribe] welcome not sent: ${redactEmails(sent.reason)}`);
  }
  return { ok: true };
}
