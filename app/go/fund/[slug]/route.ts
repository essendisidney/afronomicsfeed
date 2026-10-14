import { countsAsClick } from "@/lib/bots";
import { fundBySlug, fundUrl } from "@/lib/data/fund-links";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * "Open an account" on a money market fund: count one 'partner_click' (day, fund, reader's country; nobody
 * identified), then send the reader to the fund manager's own page. Unknown funds go back to the table.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const fund = fundBySlug(slug);
  if (!fund?.source?.startsWith("http")) return Response.redirect(new URL("/rates/kenya/money-market-funds", request.url), 302);
  // Not counted: link checkers (HEAD), prefetches, crawlers and scripts, and our own CI / local runs (lib/bots.ts).
  if (countsAsClick(request.method, request.headers)) {
    await rpc("af_event", { p_name: "partner_click", p_path: `/go/fund/${slug}`, p_country: request.headers.get("x-vercel-ip-country") ?? "" }).catch(() => null);
  }
  return new Response(null, { status: 302, headers: { Location: fundUrl(slug, fund.source), "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
}
