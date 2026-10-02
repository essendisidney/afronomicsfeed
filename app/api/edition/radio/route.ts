import { renderTime } from "@/lib/data/fetcher";
import { buildRadio } from "@/lib/editions/radio";

export const revalidate = 1800;

/** The radio bulletin as text: ?market=kenya|tanzania|uganda&lang=en|sw, or JSON without lang. */
export async function GET(request: Request) {
  const u = new URL(request.url);
  const market = (["kenya", "tanzania", "uganda"] as const).find((m) => m === u.searchParams.get("market")) ?? "kenya";
  const r = await buildRadio(renderTime(), market);
  const lang = u.searchParams.get("lang");
  const plain = { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=1800" } };
  if (lang === "en") return new Response(r.en.join("\n\n"), plain);
  if (lang === "sw") return new Response(r.sw.join("\n\n"), plain);
  return Response.json({ market: r.market.slug, weekOf: r.weekOf, seconds: r.seconds, en: r.en, sw: r.sw, generatedAt: r.generatedAt }, { headers: { "Cache-Control": "public, s-maxage=1800" } });
}
