import { apiAccess, apiJson, readRange, sliceRows } from "@/lib/api";
import { getBondMarket, loadBondMarket } from "@/lib/data/sovereign-bonds";

export const dynamic = "force-dynamic";

/**
 * One market's bond auction history, newest first. Query: isin, issue (e.g. Senegal for WAEMU), from=YYYY-MM-DD,
 * to=YYYY-MM-DD, limit. Without a key: the latest 12 months, up to 100 rows a call (free_tier.next pages back).
 * With a key: full history, limit default 500, max 5,000 (lib/api.ts, decision D-016).
 */
export async function GET(request: Request, { params }: { params: Promise<{ market: string }> }) {
  const { market: slug } = await params;
  const market = getBondMarket(slug);
  if (!market) return apiJson(request, `/v1/bonds/${slug}`, { error: "Unknown market. See /api/v1/bonds for the list." }, 404);
  const q = new URL(request.url).searchParams;
  const isin = (q.get("isin") ?? "").toUpperCase();
  const fold = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const issue = fold(q.get("issue") ?? "");
  const range = readRange(request);
  if (!range) {
    return apiJson(request, `/v1/bonds/${market.slug}`, { error: "Dates must be YYYY-MM-DD." }, 400);
  }
  const { rows, updatedAt } = loadBondMarket(market.slug);
  if (!rows.length) {
    return apiJson(request, `/v1/bonds/${market.slug}`, { error: "This market's bond data is not published yet. See /api/v1/bonds for the markets with data." }, 404);
  }
  const access = await apiAccess(request, `/v1/bonds/${market.slug}`);
  const matching = rows.filter((r) => (!isin || r.isin === isin) && (!issue || fold(r.issue ?? "").startsWith(issue)));
  const sliced = sliceRows(request, matching, (r) => r.date, range, access);
  return apiJson(
    request,
    `/v1/bonds/${market.slug}`,
    {
      market: market.slug,
      country: market.country,
      currency: market.currency,
      amounts: `${market.currency} millions`,
      bid_cover: "bids received divided by the amount accepted",
      rate_measure: market.rateNote,
      date_kind: market.dateKind ?? "auction",
      date_note:
        market.dateKind === "settlement"
          ? "each row's date is the settlement (issue) date, a few days after the auction"
          : "each row's date is the auction date",
      publisher: market.publisher,
      updated_at: updatedAt,
      count: sliced.rows.length,
      rows: sliced.rows,
    },
    200,
    sliced.free,
  );
}
