import { apiJson } from "@/lib/api";
import { auctionCalendar, demand, realYields } from "@/lib/data/bill-measures";

export const dynamic = "force-dynamic";

/** The derived measures on /markets/borrowing-costs: real yields, auction demand, expected next results. */
export async function GET(request: Request) {
  const [real, bids, calendar] = await Promise.all([realYields(), Promise.resolve(demand()), Promise.resolve(auctionCalendar())]);
  return apiJson(request, "/v1/measures", {
    real_yields: real.map((r) => ({
      market: r.market.slug,
      rate_364d: r.nominal,
      auction_date: r.nominalDate,
      inflation: r.inflation,
      inflation_year: r.inflationYear,
      real_yield: r.real == null ? null : Math.round(r.real * 1000) / 1000,
    })),
    auction_demand: bids.map((d) => ({
      market: d.market.slug,
      median_bids_to_base_90d: Math.round(d.ratio * 1000) / 1000,
      previous_90d: d.previous == null ? null : Math.round(d.previous * 1000) / 1000,
      base: d.basis,
      auctions: d.window.auctions,
      window_to: d.window.to,
    })),
    next_results: calendar.map((c) => ({ market: c.market.slug, expected: c.expected, cadence_days: c.cadenceDays, last: c.last })),
    methods: "https://www.afronomicsfeed.com/markets/borrowing-costs",
  });
}
