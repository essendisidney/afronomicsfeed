import { chartEmbedHtml } from "@/lib/charts/embed";
import { getReceipt, visibleReceipts } from "@/lib/receipts";

/**
 * One Receipt chart for other sites' pages: <iframe src="https://www.afronomicsfeed.com/embed/chart/<slug>/<n>">,
 * n counted from 1 in the Receipt's order. Built at deploy time for every chart of every visible Receipt; any other
 * address is a 404. Framing by any site is allowed here only (frame-ancestors *; next.config.ts keeps the rest of the
 * site SAMEORIGIN), and the page is never indexed (X-Robots-Tag here, a robots meta in the page).
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return visibleReceipts().flatMap((r) => r.charts.map((_, i) => ({ slug: r.slug, n: String(i + 1) })));
}

export async function GET(_request: Request, { params }: RouteContext<"/embed/chart/[slug]/[n]">) {
  const { slug, n } = await params;
  const r = getReceipt(slug);
  const html = r && /^[1-9]$/.test(n) ? chartEmbedHtml(r, Number(n)) : null;
  if (!html) return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" } });
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Security-Policy": "frame-ancestors *",
      "X-Robots-Tag": "noindex",
    },
  });
}
