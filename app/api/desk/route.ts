import { cookies } from "next/headers";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Desk actions, authorised by the af_desk cookie (the shared secret), which the database re-checks on every call. */
export async function POST(request: Request) {
  const key = (await cookies()).get("af_desk")?.value ?? "";
  if (!key) return Response.json({ ok: false, reason: "No desk key." }, { status: 401 });
  const b = (await request.json().catch(() => null)) as Record<string, string> | null;
  if (!b?.action) return Response.json({ ok: false, reason: "No action." }, { status: 400 });
  const s = (k: string, max = 500) => (b[k] ?? "").toString().trim().slice(0, max) || null;
  let result;
  if (b.action === "access") result = await rpc("af_payment_access", { p_secret: key, p_reference: s("reference", 120) });
  else if (b.action === "correction") result = await rpc("af_correction_add", { p_secret: key, p_market: s("market", 40), p_page: s("page", 200), p_wrong: s("wrong", 1000), p_changed: s("changed", 1000), p_reason: s("reason", 1000), p_reported_by: s("reported_by", 120) });
  else if (b.action === "press") result = await rpc("af_press_add", { p_secret: key, p_email: s("email", 200), p_name: s("name", 120), p_outlet: s("outlet", 120) });
  else return Response.json({ ok: false, reason: "Unknown action." }, { status: 400 });
  if (!result.ok) return Response.json({ ok: false, reason: result.reason }, { status: 502 });
  if (result.value === false || result.value == null) return Response.json({ ok: false, reason: "Rejected (key or input)." }, { status: 403 });
  return Response.json({ ok: true, value: result.value });
}
