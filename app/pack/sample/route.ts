import { renderTime } from "@/lib/data/fetcher";
import { buildPack } from "@/lib/editions/pack";
import { coverName, packHtml } from "@/lib/editions/pack-html";

export const revalidate = 3600;

/**
 * The sample Investment Committee Pack as a print-ready document. Print to PDF from the browser. With ?for=<name>
 * the cover carries that institution's name: the named sample the founder sends after a conversation (D-036, sales
 * kit section 3). Named samples are not cached or indexed.
 */
export async function GET(request: Request) {
  const pack = await buildPack(renderTime());
  const named = coverName(new URL(request.url).searchParams.get("for"));
  const html = packHtml(pack, named ? { client: named, sample: true, preparedFor: named } : { client: "Sample committee", sample: true });
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": named ? "private, no-store" : "public, s-maxage=3600, stale-while-revalidate=86400",
      ...(named ? { "X-Robots-Tag": "noindex, nofollow" } : {}),
    },
  });
}
