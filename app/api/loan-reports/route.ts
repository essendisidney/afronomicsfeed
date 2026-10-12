import { createHash } from "node:crypto";
import { loadLenders } from "@/lib/data/loan-apps";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";

export type LoanCell = { lender: string; n: number; low: number | null; median: number | null; high: number | null; shamed_pct: number | null };

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

const num = (v: unknown) => (typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[,\s]/g, "")));

/**
 * Add a borrower's report of a loan from a licensed digital lender and answer with that lender's figures so far.
 * The lender must be on the CBK's directory. The address is never stored: only a hash salted with the day and the
 * server secret, so one reader's reports can be limited without knowing who they are.
 */
export async function POST(request: Request) {
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (throttled(ip)) return Response.json({ ok: false, reason: "Too many reports. Please try again in a few minutes." }, { status: 429 });
  const b = ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
  const lender = (loadLenders()?.lenders ?? []).find((l) => l.name === String(b.lender ?? "").trim())?.name;
  if (!lender) return Response.json({ ok: false, reason: "Choose the lender from the list (the company behind the app)." }, { status: 400 });
  const borrowed = num(b.borrowed);
  const repaid = num(b.repaid);
  const days = Math.round(num(b.days));
  if (!(borrowed >= 100 && borrowed <= 1_000_000)) return Response.json({ ok: false, reason: "Type the amount you received, between KES 100 and 1,000,000." }, { status: 400 });
  if (!(repaid >= borrowed && repaid <= borrowed * 5)) return Response.json({ ok: false, reason: "Type the total you repaid, including every fee: at least what you borrowed." }, { status: 400 });
  if (!(days >= 1 && days <= 365)) return Response.json({ ok: false, reason: "Type how many days the loan ran, from 1 to 365." }, { status: 400 });
  const shamed = b.shamed === "yes" ? true : b.shamed === "no" ? false : null;

  const secret = process.env.AF_CRON_SECRET;
  if (!secret) return Response.json({ ok: false, reason: "Reports are not available right now. Please try again later." }, { status: 503 });
  const voter = createHash("sha256").update(`loan|${ip}|${new Date().toISOString().slice(0, 10)}|${secret}`).digest("hex").slice(0, 32);
  const added = await rpc("af_loan_report_add", { p_secret: secret, p_lender: lender, p_borrowed: borrowed, p_repaid: repaid, p_days: days, p_shamed: shamed, p_voter: voter });
  const status = added.ok ? (added.value as string | null) : null;
  if (!status) {
    console.log(`[loan-reports] add failed: ${added.ok ? "no result (secret mismatch?)" : added.reason}`);
    return Response.json({ ok: false, reason: "That didn’t go through. Please try again." }, { status: 502 });
  }
  if (status === "limited") return Response.json({ ok: false, reason: "Too many reports right now. Please try again later." }, { status: 429 });
  await rpc("af_event", { p_name: "reader_report", p_path: "/rates/kenya/loan-apps", p_country: "KE" }).catch(() => null);
  const summary = await rpc("af_loan_report_summary", { p_secret: secret });
  const cell = summary.ok && Array.isArray(summary.value) ? ((summary.value as LoanCell[]).find((c) => c.lender === lender) ?? null) : null;
  const yours = Math.round(((repaid - borrowed) / borrowed) * 1000 * (30 / days));
  return Response.json({ ok: true, replaced: status === "replaced", yours, cell });
}
