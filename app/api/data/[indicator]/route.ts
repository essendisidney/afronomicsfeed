import { getIndicatorDef } from "@/lib/data/indicators";
import { loadIndicator, toCsv } from "@/lib/data/series";

export const revalidate = 86400;

/** Free CSV of one indicator for all 54 countries. Attribution travels in the header lines. */
export async function GET(_request: Request, { params }: { params: Promise<{ indicator: string }> }) {
  const { indicator } = await params;
  const def = getIndicatorDef(indicator);
  if (!def) return new Response("Unknown indicator", { status: 404 });
  const file = await loadIndicator(def.slug);
  if (!file || file.series.every((item) => item.points.length === 0)) {
    return new Response("The source did not return data. Try again shortly.", { status: 503 });
  }
  return new Response(toCsv(file), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="afronomics-${def.slug}.csv"`,
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
