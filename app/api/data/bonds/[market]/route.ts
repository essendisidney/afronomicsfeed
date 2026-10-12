import { bondsCsv, getBondMarket, loadBondMarket } from "@/lib/data/sovereign-bonds";

export const revalidate = 3600;

/** A market's full bond auction history as CSV. */
export async function GET(_request: Request, { params }: { params: Promise<{ market: string }> }) {
  const { market: slug } = await params;
  const market = getBondMarket(slug);
  if (!market) return new Response("Unknown market", { status: 404 });
  const { rows, updatedAt } = loadBondMarket(market.slug);
  if (rows.length === 0) return new Response("Dataset not yet published", { status: 404 });
  return new Response(bondsCsv(market, rows, updatedAt), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="afronomics-${market.slug}-bond-auctions.csv"`,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
