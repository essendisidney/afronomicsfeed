import { countsAsClick } from "@/lib/bots";
import { partnerBySlug, partnerUrl } from "@/lib/data/transfer-partners";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A referral button: count one 'partner_click' (day, partner, sender's country; nobody identified), then send the
 * reader on to the provider. Unknown partners go back to the comparison.
 */
export async function GET(request: Request, { params }: { params: Promise<{ partner: string }> }) {
  const { partner } = await params;
  const p = partnerBySlug(partner);
  if (!p) return Response.redirect(new URL("/send-money", request.url), 302);
  // Not counted: link checkers (HEAD), prefetches, crawlers and scripts, and our own CI / local runs (lib/bots.ts).
  if (countsAsClick(request.method, request.headers)) {
    await rpc("af_event", { p_name: "partner_click", p_path: `/go/${p.slug}`, p_country: request.headers.get("x-vercel-ip-country") ?? "" }).catch(() => null);
  }
  return new Response(null, { status: 302, headers: { Location: partnerUrl(p), "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
