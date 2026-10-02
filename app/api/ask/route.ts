import { after } from "next/server";
import { ask } from "@/lib/ask";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/ask?q=... — answers from the datasets only, with sources. Questions are logged (text only) to improve coverage. */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim().slice(0, 300);
  if (q.length < 3) return Response.json({ ok: false, reason: "Ask a question." }, { status: 400 });
  const a = await ask(q);
  after(async () => {
    await rpc("af_hit", { p_path: `/ask?${a.understood ? "ok" : "miss"}=${encodeURIComponent(q).slice(0, 150)}`, p_referrer: "ask", p_country: null }).catch(() => null);
  });
  return Response.json({ ok: true, q, ...a }, { headers: { "Cache-Control": "no-store" } });
}
