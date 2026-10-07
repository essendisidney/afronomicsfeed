import { createHash } from "node:crypto";
import { parseReport } from "@/lib/reader-reports-core";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";

// Best-effort, per-instance limit on requests from one address (in memory only). The database function enforces
// the real limits: per reader per day, and overall per hour.
const WINDOW_MS = 10 * 60 * 1000;
const PER_WINDOW = 15;
const recent = new Map<string, number[]>();

function throttled(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) for (const [k, v] of recent) if (now - (v.at(-1) ?? 0) > WINDOW_MS) recent.delete(k);
  return hits.length > PER_WINDOW;
}

/** Add a reader report (a price, a rate, or a story for the editor). The address is never stored: only a hash
 * salted with the day and the server secret, so one reader's figures can be limited without knowing who they are. */
export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (throttled(ip)) return Response.json({ ok: false, reason: "Too many reports. Please try again in a few minutes." }, { status: 429 });

  const parsed = parseReport(await request.json().catch(() => null));
  if (!parsed.ok) return Response.json({ ok: false, reason: parsed.reason }, { status: 400 });
  const r = parsed.value;

  const secret = process.env.AF_CRON_SECRET;
  if (!secret) return Response.json({ ok: false, reason: "Reports are not available right now. Please try again later." }, { status: 503 });
  const day = new Date().toISOString().slice(0, 10);
  const voter = createHash("sha256").update(`${ip}|${day}|${secret}`).digest("hex").slice(0, 32);

  const result = await rpc("af_reader_report_add", {
    p_secret: secret,
    p_kind: r.kind,
    p_country: r.country,
    p_item: r.kind === "story" ? null : r.item,
    p_amount: r.kind === "story" ? null : r.amount,
    p_place: r.place || null,
    p_note: r.kind === "story" ? r.note : null,
    p_contact: r.kind === "story" ? r.contact || null : null,
    p_voter: voter,
  });
  const status = result.ok ? (result.value as string | null) : null;
  if (!status) {
    console.log(`[reader-reports] add failed: ${result.ok ? "no result (secret mismatch?)" : result.reason}`);
    return Response.json({ ok: false, reason: "That didn’t go through. Please try again." }, { status: 502 });
  }
  if (status === "limited") return Response.json({ ok: false, reason: "You’ve sent a lot today. Thank you — please try again tomorrow." }, { status: 429 });
  const message =
    r.kind === "story"
      ? "Thank you. The editor reads every one; nothing is published without checking, and never your contact details."
      : status === "replaced"
        ? "Updated: we keep one figure from you per item each day."
        : "Thank you. Your figure is counted; we publish only the middle of at least three reports.";
  return Response.json({ ok: true, message });
}
