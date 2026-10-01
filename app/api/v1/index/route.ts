import { apiJson } from "@/lib/api";
import { billIndexLatest, indexName, indexShort } from "@/lib/data/bill-index";

export const dynamic = "force-dynamic";

/** The Afronomics African Sovereign Bill Index: latest reading, changes, contributions and the weekly series. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const tenor = q.get("tenor") === "91" ? 91 : 364;
  const idx = billIndexLatest(tenor);
  if (!idx) return apiJson(request, "/v1/index", { error: "Index unavailable" }, 503);
  return apiJson(request, "/v1/index", {
    name: indexName,
    short: indexShort,
    tenor,
    method: "https://www.afronomicsfeed.com/markets/bill-index",
    latest: idx.latest,
    change_bps: { week: idx.bpsWeek, month: idx.bpsMonth, year: idx.bpsYear },
    high: idx.high,
    low: idx.low,
    contributions: idx.contributions.map((c) => ({ market: c.market.slug, country: c.market.country, rate: c.rate, auction_date: c.date })),
    series: idx.series,
  });
}
