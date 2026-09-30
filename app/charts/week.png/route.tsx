import { monitorCard } from "@/lib/og-builders";

export const revalidate = 3600;

/**
 * Chart of the week: a branded image of the latest 364-day T-bill rates in every market we track.
 * Free to republish with the attribution it carries; attached to the Monday LinkedIn post.
 */
export async function GET() {
  const image = await monitorCard("Chart of the week", "What African governments pay to borrow for a year");
  const headers = new Headers(image.headers);
  headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  return new Response(image.body, { status: 200, headers });
}
