import { renderTime } from "@/lib/data/fetcher";
import { emailSubject, linkedinPost } from "@/lib/editions/social";
import { buildWeeklyEdition, headlines } from "@/lib/editions/weekly";

export const revalidate = 1800;

/**
 * The weekly edition as data, for distribution agents: ?format=linkedin returns the post text,
 * otherwise JSON with the edition, the post and an email subject line.
 */
export async function GET(request: Request) {
  const edition = await buildWeeklyEdition(renderTime());
  const format = new URL(request.url).searchParams.get("format");
  if (format === "linkedin") {
    return new Response(linkedinPost(edition), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=1800" } });
  }
  return Response.json(
    { weekOf: edition.weekOf, subject: emailSubject(edition), headlines: headlines(edition), linkedin: linkedinPost(edition), edition },
    { headers: { "Cache-Control": "public, s-maxage=1800" } },
  );
}
