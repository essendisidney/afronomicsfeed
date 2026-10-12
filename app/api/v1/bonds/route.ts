import { apiJson } from "@/lib/api";
import { bondMarkets, loadBondMarket } from "@/lib/data/sovereign-bonds";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Every market with government bond auction data: coverage and the latest auction. */
export async function GET(request: Request) {
  const markets = bondMarkets.flatMap((market) => {
    const { rows, updatedAt } = loadBondMarket(market.slug);
    if (!rows.length) return [];
    const latestDate = rows[0].date;
    return [
      {
        market: market.slug,
        country: market.country,
        currency: market.currency,
        publisher: market.publisher,
        source_page: market.sourcePage,
        rate_measure: market.rateNote,
        updated_at: updatedAt,
        history_from: rows.at(-1)?.date ?? null,
        results: rows.length,
        latest_auction: { date: latestDate, results: rows.filter((r) => r.date === latestDate) },
        history_url: `${site.url}/api/v1/bonds/${market.slug}`,
      },
    ];
  });
  return apiJson(request, "/v1/bonds", { markets });
}
