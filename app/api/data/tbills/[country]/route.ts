import { billsCsv, getBillMarket, loadBillMarket } from "@/lib/data/sovereign-bills";

export const revalidate = 3600;

export async function GET(_request: Request, { params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const market = getBillMarket(country);
  if (!market) return new Response("Unknown market", { status: 404 });
  const { rows, updatedAt } = loadBillMarket(market.slug);
  if (rows.length === 0) return new Response("Dataset not yet published", { status: 404 });
  return new Response(billsCsv(market, rows, updatedAt), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="afronomics-${market.slug}-tbills.csv"`,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
