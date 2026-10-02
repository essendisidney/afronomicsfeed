import { renderTime } from "@/lib/data/fetcher";
import { buildMorningNote, morningLines, morningSubject, morningText, morningWhatsApp } from "@/lib/editions/morning";
import { morningEmailHtml } from "@/lib/editions/morning-email";
import { morningLinesSw, morningTextSw } from "@/lib/editions/morning-sw";

export const revalidate = 900;

/** The Morning as data: ?format=linkedin|text, ?format=whatsapp (short, bold markers), ?format=html (the email), ?lang=sw for Kiswahili; otherwise JSON. */
export async function GET(request: Request) {
  const note = await buildMorningNote(renderTime());
  const url = new URL(request.url);
  const format = url.searchParams.get("format");
  const sw = url.searchParams.get("lang") === "sw";
  const plain = { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=900" } };
  if (format === "whatsapp") {
    return new Response(sw ? morningTextSw(note) : morningWhatsApp(note), plain);
  }
  if (sw && (format === "linkedin" || format === "text")) {
    return new Response(morningTextSw(note, "utm_source=linkedin&utm_medium=social&utm_campaign=morning-sw"), plain);
  }
  if (format === "linkedin" || format === "text") {
    return new Response(morningText(note), { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=900" } });
  }
  if (format === "html") {
    return new Response(morningEmailHtml(note), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=900" } });
  }
  return Response.json(
    { day: note.day, subject: morningSubject(note), lines: morningLines(note), lines_sw: morningLinesSw(note), linkedin: morningText(note), whatsapp: morningWhatsApp(note), whatsapp_sw: morningTextSw(note), note },
    { headers: { "Cache-Control": "public, s-maxage=900" } },
  );
}
