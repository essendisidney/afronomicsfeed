import { buildIndexRelease, indexReleaseHtml, indexReleaseText } from "@/lib/editions/index-release";
import { sendEmail } from "@/lib/mail";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Sends the Monday ASBI release to the press list (af_press, released only to the secret holder) plus any
 * addresses in PRESS_LIST. Called by the Monday 07:30 Nairobi workflow.
 */
export async function POST(request: Request) {
  const secret = process.env.AF_CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("forbidden", { status: 403 });
  const r = buildIndexRelease();
  if (!r) return Response.json({ sent: 0, reason: "no reading" }, { status: 503 });
  const list = await rpc("af_press", { p_secret: secret });
  const fromDb = list.ok && Array.isArray(list.value) ? (list.value as { email: string }[]).map((x) => x.email) : [];
  const fromEnv = (process.env.PRESS_LIST ?? "").split(/[,\s]+/).filter((e) => /@/.test(e));
  const emails = [...new Set([...fromDb, ...fromEnv].map((e) => e.toLowerCase()))];
  const subject = `${r.headline} — Afronomics African Sovereign Bill Index, week of ${r.week}`;
  let sent = 0;
  const failures: string[] = [];
  for (const email of emails) {
    const result = await sendEmail(email, subject, indexReleaseHtml(r), indexReleaseText(r));
    if (result.ok) sent += 1;
    else failures.push(result.reason);
    if (!result.ok && result.reason.includes("RESEND_API_KEY")) break;
    await new Promise((res) => setTimeout(res, 120));
  }
  return Response.json({ week: r.week, headline: r.headline, recipients: emails.length, sent, failures: failures.slice(0, 5) });
}
