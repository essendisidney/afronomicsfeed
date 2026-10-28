import { cookies } from "next/headers";
import { renderTime } from "@/lib/data/fetcher";
import { buildPack } from "@/lib/editions/pack";
import { packHtml } from "@/lib/editions/pack-html";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * This month's Investment Committee Pack for one paying organisation, with its name on the cover and the subscriber
 * licence line: what the founder checks, prints to PDF and sends (desk → Treasury Desk → Packs due). Desk key only
 * (the af_desk cookie is scoped to /desk); the organisation must hold a live pack entitlement (migration 0048).
 */
export async function GET(request: Request) {
  const key = (await cookies()).get("af_desk")?.value ?? "";
  const org = Number(new URL(request.url).searchParams.get("org"));
  if (!key) return new Response("No desk key.", { status: 401 });
  if (!Number.isInteger(org) || org <= 0) return new Response("No organisation.", { status: 400 });
  const [allowed, desk] = await Promise.all([rpc("af_has_entitlement", { p_secret: key, p_org: org, p_product: "pack" }), rpc("af_desk_treasury", { p_secret: key })]);
  if (!allowed.ok) return new Response(/PGRST202|^404/.test(allowed.reason) ? "Needs migration 0048." : "Could not check the entitlement.", { status: 502 });
  if (allowed.value !== true) return new Response("No live pack entitlement for this organisation (or a wrong desk key).", { status: 403 });
  const name = desk.ok ? (desk.value as { orgs?: { org_id: number; name: string }[] } | null)?.orgs?.find((o) => o.org_id === org)?.name : undefined;
  if (!name) return new Response("Organisation not found.", { status: 404 });
  const pack = await buildPack(renderTime());
  return new Response(packHtml(pack, { client: name }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
