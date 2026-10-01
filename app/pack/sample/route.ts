import { renderTime } from "@/lib/data/fetcher";
import { buildPack } from "@/lib/editions/pack";
import { packHtml } from "@/lib/editions/pack-html";

export const revalidate = 3600;

/** The sample Investment Committee Pack as a print-ready document. Print to PDF from the browser. */
export async function GET() {
  const pack = await buildPack(renderTime());
  return new Response(packHtml(pack, { client: "Sample committee", sample: true }), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
