import { cmaFundsCsv } from "@/lib/data/cma-mmf";

export const dynamic = "force-static";

/** Free CSV: every Kenyan money market fund and its size, from the CMA's quarterly report. */
export function GET() {
  return new Response(cmaFundsCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="afronomics-kenya-money-market-fund-sizes.csv"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
