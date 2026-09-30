import { apiJson } from "@/lib/api";
import { getBillMarket, loadBillMarket } from "@/lib/data/sovereign-bills";

export const dynamic = "force-dynamic";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** One market's auction history. Query: tenor=91|182|364, from=YYYY-MM-DD, to=YYYY-MM-DD, limit (default 500, max 5000). */
export async function GET(request: Request, { params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const market = getBillMarket(country);
  if (!market) return apiJson(request, `/v1/tbills/${country}`, { error: "Unknown market. See /api/v1/tbills for the list." }, 404);
  const q = new URL(request.url).searchParams;
  const tenor = q.get("tenor") ? Number(q.get("tenor")) : null;
  const from = q.get("from") ?? "";
  const to = q.get("to") ?? "";
  const limit = Math.min(5000, Math.max(1, Number(q.get("limit") ?? 500) || 500));
  if ((from && !ISO.test(from)) || (to && !ISO.test(to))) {
    return apiJson(request, `/v1/tbills/${market.slug}`, { error: "Dates must be YYYY-MM-DD." }, 400);
  }
  const { rows, updatedAt } = loadBillMarket(market.slug);
  const picked = rows
    .filter((r) => (tenor ? r.tenor === tenor : true) && (!from || r.date >= from) && (!to || r.date <= to))
    .slice(0, limit)
    .map((r) => ({ date: r.date, tenor: r.tenor, rate: r.rate, offered_m: r.offered, received_m: r.received, accepted_m: r.accepted, source: r.source }));
  return apiJson(request, `/v1/tbills/${market.slug}`, {
    market: market.slug,
    country: market.country,
    currency: market.currency,
    amounts: `${market.currency} millions`,
    rate_measure: market.rateNote,
    publisher: market.publisher,
    updated_at: updatedAt,
    count: picked.length,
    rows: picked,
  });
}
