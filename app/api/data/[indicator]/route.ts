import { dataFileResponse, LICENCE_LINE, TERMS_URL } from "@/lib/api";
import { getIndicatorDef } from "@/lib/data/indicators";
import { loadIndicator, toCsv } from "@/lib/data/series";

/** Free CSV (or ?format=xlsx) of one indicator for all 54 countries. Attribution travels in the header lines. */
export async function GET(request: Request, { params }: { params: Promise<{ indicator: string }> }) {
  const { indicator } = await params;
  const def = getIndicatorDef(indicator);
  if (!def) return new Response("Unknown indicator", { status: 404 });
  const file = await loadIndicator(def.slug);
  if (!file || file.series.every((item) => item.points.length === 0)) {
    return new Response("The source did not return data. Try again shortly.", { status: 503 });
  }
  return dataFileResponse(request, toCsv(file), { dataset: def.slug, title: def.label, asOf: file.retrievedAt.slice(0, 10), href: `/data/${def.slug}` }, `${LICENCE_LINE} Terms: ${TERMS_URL}`, {
    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
  });
}
