import { renderTime } from "@/lib/data/fetcher";
import { buildMorningNote, morningLines, morningSubject, morningText } from "@/lib/editions/morning";
import { morningEmailHtml } from "@/lib/editions/morning-email";

export const revalidate = 900;

/** The Morning as data: ?format=linkedin (text), ?format=html (the email), otherwise JSON. */
export async function GET(request: Request) {
  const note = await buildMorningNote(renderTime());
  const format = new URL(request.url).searchParams.get("format");
  if (format === "linkedin" || format === "text") {
    return new Response(morningText(note), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=900" } });
  }
  if (format === "html") {
    return new Response(morningEmailHtml(note), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=900" } });
  }
  return Response.json(
    { day: note.day, subject: morningSubject(note), lines: morningLines(note), linkedin: morningText(note), note },
    { headers: { "Cache-Control": "public, s-maxage=900" } },
  );
}
