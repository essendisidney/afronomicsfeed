import { renderTime } from "@/lib/data/fetcher";
import { watchHtml } from "@/lib/editions/watch-html";
import { buildWatch } from "@/lib/watch";

export const revalidate = 3600;

/** The public sample Watch pack: a median large-tier SACCO, so no institution is described. Print to PDF from the browser. */
export async function GET() {
  const w = await buildWatch(null, renderTime());
  return new Response(watchHtml(w!), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
