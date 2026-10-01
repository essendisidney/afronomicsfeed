import { renderTime } from "@/lib/data/fetcher";
import { buildMorningNote, morningSubject, morningText } from "@/lib/editions/morning";
import { morningEmailHtml } from "@/lib/editions/morning-email";
import { sendEmail, unsubscribeToken } from "@/lib/mail";
import { rpc } from "@/lib/store";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Sends the Morning to every active subscriber. Called by the weekday 07:00 Nairobi workflow with the shared
 * secret; never from the browser. The list is released by the database only to a caller holding that secret.
 */
export async function POST(request: Request) {
  const secret = process.env.AF_CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("forbidden", { status: 403 });
  const list = await rpc("af_subscribers", { p_secret: secret });
  if (!list.ok || !Array.isArray(list.value)) return Response.json({ sent: 0, reason: `subscribers: ${list.ok ? "bad shape" : list.reason}` }, { status: 502 });
  const emails = (list.value as { email: string }[]).map((r) => r.email);

  const note = await buildMorningNote(renderTime());
  const subject = morningSubject(note);
  const text = morningText(note, "utm_source=email&utm_medium=morning&utm_campaign=morning");
  let sent = 0;
  const failures: string[] = [];
  for (const email of emails) {
    const unsub = `${site.url}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${await unsubscribeToken(email)}`;
    const result = await sendEmail(email, subject, morningEmailHtml(note, unsub), `${text}\n\nUnsubscribe: ${unsub}`, unsub);
    if (result.ok) sent += 1;
    else failures.push(result.reason);
    if (!result.ok && result.reason.includes("RESEND_API_KEY")) break;
    await new Promise((r) => setTimeout(r, 120)); // Resend allows ~10 requests a second
  }
  return Response.json({ day: note.day, subject, subscribers: emails.length, sent, failures: failures.slice(0, 5) });
}
