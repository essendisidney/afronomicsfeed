import { buildIndexRelease, indexReleaseDocument } from "@/lib/editions/index-release";

export const revalidate = 3600;

/** This week's index release in the house document design; scripts/make-documents.mjs prints it to PDF. */
export async function GET() {
  const r = buildIndexRelease();
  if (!r) return new Response("No index reading yet.", { status: 404 });
  return new Response(indexReleaseDocument(r), {
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
