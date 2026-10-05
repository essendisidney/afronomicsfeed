import { fundHistoryCsv } from "@/lib/data/kenya-rates";

export const dynamic = "force-static";

/** Free CSV of every Kenya money market fund yield Afronomics has read, one row per fund per day. */
export function GET() {
  return new Response(fundHistoryCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="afronomics-kenya-money-market-funds.csv"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
