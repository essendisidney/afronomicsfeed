import { renderTime } from "@/lib/data/fetcher";
import { buildPack } from "@/lib/editions/pack";
import { packHtml } from "@/lib/editions/pack-html";
import { verifyOrgLink } from "@/lib/org-links";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const page = (status: number, text: string) =>
  new Response(`<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex"><title>Investment Committee Pack</title><p style="font:16px/1.5 system-ui;max-width:36rem;margin:3rem auto;padding:0 1rem">${text}</p>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
  });

/**
 * A paying institution's private link to this month's pack (lib/org-links.ts), shared by the founder in person or by
 * message; nothing is emailed. Checked against the live entitlement on every visit (migration 0048).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = verifyOrgLink(token, "pack");
  if (!link) return page(404, "This link has expired or is not valid. Ask the Afronomics desk for a new one.");
  const secret = process.env.AF_CRON_SECRET ?? "";
  const [allowed, org] = await Promise.all([
    rpc("af_has_entitlement", { p_secret: secret, p_org: link.org, p_product: "pack" }),
    rpc("af_desk_org_get", { p_secret: secret, p_org: link.org }),
  ]);
  if (!allowed.ok || !org.ok) return page(503, "The pack could not be opened just now. Please try again in a few minutes.");
  if (allowed.value !== true) return page(403, "This institution's subscription is not active. Ask the Afronomics desk to renew it.");
  const name = (org.value as { name?: string } | null)?.name;
  if (!name) return page(404, "This link has expired or is not valid. Ask the Afronomics desk for a new one.");
  const pack = await buildPack(renderTime());
  return new Response(packHtml(pack, { client: name }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
