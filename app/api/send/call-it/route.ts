import { nextRound, placeAll, scoreNote, TENORS, type Entry, type Tenor } from "@/lib/call-it-core";
import { scoreEmail } from "@/lib/call-it-mail";
import { renderTime } from "@/lib/data/fetcher";
import { loadTbills } from "@/lib/data/kenya-tbills";
import { loadLedger, publishedFor } from "@/lib/ledger";
import { sendEmail } from "@/lib/mail";
import { bearerOk, redactEmails } from "@/lib/security";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** Results older than this are not scored by email: a late run should not mail people about a round long gone. */
const FRESH_DAYS = 10;

/**
 * Sends the Call it score emails for the latest Kenya T-bill result this deployment carries: one email to each reader
 * who called that auction, with their miss, their place and the round now open. Called with the shared secret by the
 * Kenya workflows after their data deploys; never from the browser. Each guess is claimed in the database before its
 * email goes (af_call_it_mark_scored), so running it again sends nothing twice. ?dry=1 counts without sending.
 */
export async function POST(request: Request) {
  const secret = process.env.AF_CRON_SECRET;
  if (!secret || !bearerOk(request, secret)) return new Response("forbidden", { status: 403 });
  const dry = new URL(request.url).searchParams.get("dry") === "1";
  const deployment = process.env.VERCEL_GIT_COMMIT_SHA ?? null;

  const rows = loadTbills().rows;
  const valueDate = rows[0]?.value_date ?? null;
  const now = new Date(renderTime());
  if (!valueDate || now.getTime() - Date.parse(`${valueDate}T00:00:00Z`) > FRESH_DAYS * 86_400_000)
    return Response.json({ dry, valueDate, sent: 0, reason: "no recent result", deployment });

  const actual: Partial<Record<Tenor, number>> = {};
  for (const r of rows) if (r.value_date === valueDate && actual[r.tenor] == null) actual[r.tenor] = r.weighted_avg_rate;
  const range: Partial<Record<Tenor, { low: number; high: number }>> = {};
  for (const [t, f] of publishedFor(valueDate)) if ((TENORS as readonly number[]).includes(t)) range[t as Tenor] = { low: f.low, high: f.high };

  const list = await rpc("af_call_it_entries", { p_value_date: valueDate, p_secret: secret });
  if (!list.ok) return Response.json({ dry, valueDate, sent: 0, reason: `needs migration 0045 (${redactEmails(list.reason)})`, deployment }, { status: 502 });
  if (!Array.isArray(list.value)) return Response.json({ dry, valueDate, sent: 0, reason: "no entries (secret mismatch?)", deployment }, { status: 502 });
  const entries = (list.value as Entry[]).map((e) => ({ ...e, g91: num(e.g91), g182: num(e.g182), g364: num(e.g364) }));

  const placed = placeAll(entries, actual);
  const byId = new Map(entries.map((e) => [e.id, e]));
  const leaders = placed
    .filter((p) => byId.get(p.id)?.show && byId.get(p.id)?.handle)
    .map((p) => ({ handle: byId.get(p.id)!.handle!, missBps: p.missBps, place: p.place }));
  const next = nextRound(now.toISOString(), loadLedger().rows);

  let sent = 0;
  let skipped = 0;
  const due = placed.filter((p) => !byId.get(p.id)!.scored_at).length;
  const failures: string[] = [];
  if (!dry)
    for (const p of placed) {
      const entry = byId.get(p.id)!;
      if (entry.scored_at) continue;
      const claim = await rpc("af_call_it_mark_scored", { p_id: p.id, p_sent: true, p_secret: secret });
      if (!claim.ok || claim.value !== true) {
        skipped += 1;
        continue;
      }
      const note = scoreNote({
        entry,
        placed: p,
        players: placed.length,
        atPlace: placed.filter((o) => o.place === p.place).length,
        actual,
        range,
        leaders,
        valueDate,
        next,
      });
      const mail = scoreEmail(note);
      const result = await sendEmail(entry.email, mail.subject, mail.html, mail.text);
      if (result.ok) sent += 1;
      else {
        failures.push(redactEmails(result.reason));
        await rpc("af_call_it_mark_scored", { p_id: p.id, p_sent: false, p_secret: secret }); // the next run tries again
        if (result.reason.includes("RESEND_API_KEY")) break;
      }
      await new Promise((r) => setTimeout(r, 120)); // Resend allows ~10 requests a second
    }

  return Response.json({ dry, valueDate, entries: entries.length, scored: placed.length, due, sent, skipped, deployment, failures: failures.slice(0, 5) });
}

const num = (v: unknown) => (v == null || v === "" ? null : Number(v));
