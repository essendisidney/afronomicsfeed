import { apiJson } from "@/lib/api";
import { billMarkets, billTenors, latestBills, loadBillMarket } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Every market with its latest rate per tenor. */
export async function GET(request: Request) {
  const markets = billMarkets.map((market) => {
    const { rows, updatedAt } = loadBillMarket(market.slug);
    const latest = latestBills(rows);
    return {
      market: market.slug,
      country: market.country,
      iso: market.iso,
      currency: market.currency,
      publisher: market.publisher,
      source_page: market.sourcePage,
      rate_measure: market.rateNote,
      updated_at: updatedAt,
      history_from: rows.at(-1)?.date ?? null,
      results: rows.length,
      latest: Object.fromEntries(
        billTenors.flatMap((tenor) => {
          const item = latest.get(tenor);
          return item
            ? [[String(tenor), { date: item.latest.date, rate: item.latest.rate, previous_rate: item.previous?.rate ?? null, source: item.latest.source }]]
            : [];
        }),
      ),
      history_url: `${site.url}/api/v1/tbills/${market.slug}`,
    };
  });
  return apiJson(request, "/v1/tbills", { markets });
}
