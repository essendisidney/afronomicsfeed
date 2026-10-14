import { ledgerCsv } from "@/lib/ledger";

export const dynamic = "force-static";
export const revalidate = 3600;

/** The forecast ledger as CSV: free, because the record should be easy to check. */
export function GET() {
  return new Response(ledgerCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="afronomics-forecast-ledger.csv"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
