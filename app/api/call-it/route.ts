import { nextRound, parseEntry } from "@/lib/call-it-core";
import { renderTime } from "@/lib/data/fetcher";
import { loadLedger } from "@/lib/ledger";
import { joinMorning } from "@/lib/morning-signup";
import { redactEmails } from "@/lib/security";
import { site } from "@/lib/site";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";

// Best-effort, per-instance limit on entries from one address (in memory only, never stored); the database caps the total.
const WINDOW_MS = 10 * 60 * 1000;
const recent = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) for (const [k, v] of recent) if (now - (v.at(-1) ?? 0) > WINDOW_MS) recent.delete(k);
  return hits.length > 8;
}

/**
 * "Call it": save a reader's guess for the auction now open (lib/call-it-core.ts nextRound, from the forecast ledger),
 * and add the address to the Morning, as the form says. The close time comes from the server, never the browser.
 */
export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (throttled(ip)) return Response.json({ ok: false, reason: "Too many entries from here. Please try again in a few minutes." }, { status: 429 });
  const parsed = parseEntry(await request.json().catch(() => null));
  if (!parsed.ok) return Response.json({ ok: false, reason: parsed.reason }, { status: 400 });
  const e = parsed.value;

  const secret = process.env.AF_CRON_SECRET;
  if (!secret) return Response.json({ ok: false, reason: "Call it opens soon. Please try again later." }, { status: 503 });

  const round = nextRound(new Date(renderTime()).toISOString(), loadLedger().rows);
  const result = await rpc("af_call_it_guess", {
    p_value_date: round.valueDate,
    p_closes: round.closesAt,
    p_email: e.email,
    p_handle: e.handle,
    p_show: e.show,
    p_g91: e.g91,
    p_g182: e.g182,
    p_g364: e.g364,
    p_secret: secret,
  });
  const status = result.ok ? (result.value as { status?: string } | null)?.status : undefined;
  if (!status) {
    console.log(`[call-it] not stored: ${result.ok ? "no result (secret mismatch?)" : redactEmails(result.reason)}`);
    return Response.json({ ok: false, reason: `We could not save your call just now. Please try again in a minute, or write to ${site.contactEmail}.` }, { status: 503 });
  }
  if (status === "closed") return Response.json({ ok: false, reason: "Bids for this auction have closed. The next round opens as soon as the result is in." }, { status: 409 });
  if (status === "limited") return Response.json({ ok: false, reason: "A lot of calls are coming in. Please try again in a few minutes." }, { status: 429 });

  // The form says entering also brings the Morning; a failure here does not undo the saved call.
  await joinMorning(e.email, "other", "call-it");
  return Response.json({ ok: true, status, valueDate: round.valueDate, closesAt: round.closesAt });
}
