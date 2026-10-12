import { apiJson } from "@/lib/api";
import { getBondMarket, loadBondMarket } from "@/lib/data/sovereign-bonds";

export const dynamic = "force-dynamic";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** One market's bond auction history. Query: isin, issue (e.g. Senegal for WAEMU), from=YYYY-MM-DD, to=YYYY-MM-DD, limit (default 500, max 5000). */
export async function GET(request: Request, { params }: { params: Promise<{ market: string }> }) {
  const { market: slug } = await params;
  const market = getBondMarket(slug);
  if (!market) return apiJson(request, `/v1/bonds/${slug}`, { error: "Unknown market. See /api/v1/bonds for the list." }, 404);
  const q = new URL(request.url).searchParams;
  const isin = (q.get("isin") ?? "").toUpperCase();
  const fold = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const issue = fold(q.get("issue") ?? "");
  const from = q.get("from") ?? "";
  const to = q.get("to") ?? "";
  const limit = Math.min(5000, Math.max(1, Number(q.get("limit") ?? 500) || 500));
  if ((from && !ISO.test(from)) || (to && !ISO.test(to))) {
    return apiJson(request, `/v1/bonds/${market.slug}`, { error: "Dates must be YYYY-MM-DD." }, 400);
  }
  const { rows, updatedAt } = loadBondMarket(market.slug);
  const picked = rows.filter((r) => (!isin || r.isin === isin) && (!issue || fold(r.issue ?? "").startsWith(issue)) && (!from || r.date >= from) && (!to || r.date <= to)).slice(0, limit);
  return apiJson(request, `/v1/bonds/${market.slug}`, {
    market: market.slug,
    country: market.country,
    currency: market.currency,
    amounts: `${market.currency} millions`,
    bid_cover: "bids received divided by the amount accepted",
    rate_measure: market.rateNote,
    publisher: market.publisher,
    updated_at: updatedAt,
    count: picked.length,
    rows: picked,
  });
}
