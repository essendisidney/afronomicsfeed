import { editorialCsv, editorialRows } from "@/lib/editorial";
import { ledgerCsv } from "@/lib/ledger";

export const revalidate = 3600;

/** The forecast ledger as CSV (?ledger=editorial for the editorial calls): free, because the record should be easy to check. */
export async function GET(request: Request) {
  const editorial = new URL(request.url).searchParams.get("ledger") === "editorial";
  return new Response(editorial ? editorialCsv(editorialRows()) : ledgerCsv(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="afronomics-${editorial ? "editorial-calls" : "forecast-ledger"}.csv"`,
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
