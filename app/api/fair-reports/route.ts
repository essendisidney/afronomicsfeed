import { redactEmails } from "@/lib/security";
import { createHash } from "node:crypto";
import { MIN_FAIR, parseFair, type FairCell } from "@/lib/fair-core";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";

// Best-effort, per-instance limit on requests from one address (in memory only). The database function enforces
// the real limits: per reader per day, and overall per hour.
const WINDOW_MS = 10 * 60 * 1000;
const PER_WINDOW = 10;
const recent = new Map<string, number[]>();

function throttled(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) for (const [k, v] of recent) if (now - (v.at(-1) ?? 0) > WINDOW_MS) recent.delete(k);
  return hits.length > PER_WINDOW;
}

/**
 * Add a salary or rent report and answer with how it compares: the middle of at least five reports for the same
 * job or home in the same town (or the country), never one person's figure. The address is never stored: only a
 * hash salted with the day and the server secret, so one reader's reports can be limited without knowing who they are.
 */
export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (throttled(ip)) return Response.json({ ok: false, reason: "Too many reports. Please try again in a few minutes." }, { status: 429 });
  const parsed = parseFair(await request.json().catch(() => null));
  if (!parsed.ok) return Response.json({ ok: false, reason: parsed.reason }, { status: 400 });
  const r = parsed.value;

  const secret = process.env.AF_CRON_SECRET;
  if (!secret) return Response.json({ ok: false, reason: "Reports are not available right now. Please try again later." }, { status: 503 });
  const day = new Date().toISOString().slice(0, 10);
  const voter = createHash("sha256").update(`fair|${ip}|${day}|${secret}`).digest("hex").slice(0, 32);

  const added = await rpc("af_fair_report_add", {
    p_secret: secret, p_kind: r.kind, p_country: r.country, p_town: r.town, p_category: r.category, p_amount: r.amount, p_voter: voter,
  });
  const status = added.ok ? (added.value as string | null) : null;
  if (!status) {
    console.log(`[fair-reports] add failed: ${added.ok ? "no result (secret mismatch?)" : redactEmails(added.reason)}`);
    return Response.json({ ok: false, reason: "That didn’t go through. Please try again." }, { status: 502 });
  }
  if (status === "limited") return Response.json({ ok: false, reason: "You’ve sent a lot today. Thank you — please try again tomorrow." }, { status: 429 });

  await rpc("af_event", { p_name: "reader_report", p_path: `/${r.kind}-check`, p_country: r.country }).catch(() => null);
  const summary = await rpc("af_fair_report_summary", { p_secret: secret, p_kind: r.kind });
  const cells = summary.ok && Array.isArray(summary.value) ? (summary.value as FairCell[]) : [];
  const pick = (town: string) => cells.find((c) => c.country === r.country && c.category === r.category && c.town === town) ?? null;
  return Response.json({ ok: true, replaced: status === "replaced", amount: r.amount, town: pick(r.town), country: pick("all"), min: MIN_FAIR });
}
