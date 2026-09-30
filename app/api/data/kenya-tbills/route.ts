import { loadTbills, tbillsCsv } from "@/lib/data/kenya-tbills";

export const dynamic = "force-static";

/** Free CSV of every Kenya Treasury bill auction. */
export function GET() {
  const file = loadTbills();
  return new Response(tbillsCsv(file), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="afronomics-kenya-tbill-auctions.csv"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
