import { renderTime } from "@/lib/data/fetcher";
import { billMarkets } from "@/lib/data/sovereign-bills";
import { buildMarketPack, marketPackHtml } from "@/lib/editions/pack-market";

export const revalidate = 3600;

/** The sample committee pack for one market, print-ready. */
export async function GET(_request: Request, { params }: { params: Promise<{ market: string }> }) {
  const { market } = await params;
  const slug = billMarkets.find((m) => m.slug === market)?.slug;
  if (!slug) return new Response("Not found", { status: 404 });
  if (slug === "kenya") return Response.redirect(new URL("/pack/sample", _request.url), 307);
  const mp = await buildMarketPack(slug, renderTime());
  if (!mp) return new Response("Not found", { status: 404 });
  return new Response(marketPackHtml(mp, { client: "Sample committee", sample: true }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
