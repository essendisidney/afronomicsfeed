import { buildIndexRelease, indexReleaseHtml, indexReleaseLinkedIn, indexReleaseText } from "@/lib/editions/index-release";

export const revalidate = 900;

/** The weekly ASBI release as data: ?format=text|linkedin|html, otherwise JSON. */
export async function GET(request: Request) {
  const r = buildIndexRelease();
  if (!r) return Response.json({ ok: false, reason: "no reading" }, { status: 503 });
  const format = new URL(request.url).searchParams.get("format");
  const plain = { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=900" } };
  if (format === "text") return new Response(indexReleaseText(r), plain);
  if (format === "linkedin") return new Response(indexReleaseLinkedIn(r), plain);
  if (format === "html") return new Response(indexReleaseHtml(r), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=900" } });
  return Response.json({ week: r.week, headline: r.headline, lead: r.lead, movers: r.moversText, range: r.range, table: r.table, linkedin: indexReleaseLinkedIn(r), text: indexReleaseText(r) }, { headers: { "Cache-Control": "public, s-maxage=900" } });
}
