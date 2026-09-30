import { bondsCsv, loadBonds } from "@/lib/data/kenya-bonds";

export const dynamic = "force-static";

/** Free CSV of every Kenya Treasury bond auction result. */
export function GET() {
  return new Response(bondsCsv(loadBonds()), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="afronomics-kenya-bond-auctions.csv"',
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
