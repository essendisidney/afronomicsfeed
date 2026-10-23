import { apiAccess, apiJson, FREE_ROWS, freeWindowFrom } from "@/lib/api";
import { billIndexLatest, indexName, indexShort } from "@/lib/data/bill-index";

export const dynamic = "force-dynamic";

/**
 * The Afronomics African Sovereign Bill Index: latest reading, changes, contributions and the weekly series.
 * Without a key the series covers the latest 12 months (about 52 weekly points); with a key, the full series (D-016).
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const tenor = q.get("tenor") === "91" ? 91 : 364;
  const idx = billIndexLatest(tenor);
  if (!idx) return apiJson(request, "/v1/index", { error: "Index unavailable" }, 503);
  const access = await apiAccess(request, "/v1/index");
  const windowFrom = freeWindowFrom();
  const series = access.plan ? idx.series : idx.series.filter((p) => p.date >= windowFrom);
  const cut = series.length < idx.series.length;
  return apiJson(
    request,
    "/v1/index",
    {
      name: indexName,
      short: indexShort,
      tenor,
      method: "https://www.afronomicsfeed.com/markets/bill-index/method",
      latest: idx.latest,
      change_bps: { week: idx.bpsWeek, month: idx.bpsMonth, year: idx.bpsYear },
      high: idx.high,
      low: idx.low,
      contributions: idx.contributions.map((c) => ({ market: c.market.slug, country: c.market.country, rate: c.rate, auction_date: c.date })),
      series,
    },
    200,
    access.plan ? null : { window_from: windowFrom, max_rows: FREE_ROWS, truncated: cut, reasons: cut ? ["history"] : [], next: null },
  );
}
