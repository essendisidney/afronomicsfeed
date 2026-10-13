import { apiAccess, apiJson, readRange, sliceRows } from "@/lib/api";
import { getBillMarket, loadBillMarket } from "@/lib/data/sovereign-bills";

export const dynamic = "force-dynamic";

/**
 * One market's auction history, newest first. Query: tenor=91|182|364, from=YYYY-MM-DD, to=YYYY-MM-DD, limit.
 * Without a key: the latest 12 months, up to 100 rows a call (free_tier.next pages back). With a key: full history,
 * limit default 500, max 5,000 (lib/api.ts, decision D-016).
 */
export async function GET(request: Request, { params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const market = getBillMarket(country);
  if (!market) return apiJson(request, `/v1/tbills/${country}`, { error: "Unknown market. See /api/v1/tbills for the list." }, 404);
  const q = new URL(request.url).searchParams;
  const tenor = q.get("tenor") ? Number(q.get("tenor")) : null;
  const range = readRange(request);
  if (!range) {
    return apiJson(request, `/v1/tbills/${market.slug}`, { error: "Dates must be YYYY-MM-DD." }, 400);
  }
  const access = await apiAccess(request, `/v1/tbills/${market.slug}`);
  const { rows, updatedAt } = loadBillMarket(market.slug);
  const sliced = sliceRows(request, rows.filter((r) => (tenor ? r.tenor === tenor : true)), (r) => r.date, range, access);
  const picked = sliced.rows.map((r) => ({ date: r.date, tenor: r.tenor, rate: r.rate, offered_m: r.offered, received_m: r.received, accepted_m: r.accepted, source: r.source }));
  return apiJson(
    request,
    `/v1/tbills/${market.slug}`,
    {
      market: market.slug,
      country: market.country,
      currency: market.currency,
      amounts: `${market.currency} millions`,
      rate_measure: market.rateNote,
      publisher: market.publisher,
      updated_at: updatedAt,
      count: picked.length,
      rows: picked,
    },
    200,
    sliced.free,
  );
}
