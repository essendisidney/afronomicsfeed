import { renderTime } from "@/lib/data/fetcher";
import { renderWidget } from "@/lib/embeds";

/** Embeddable widgets for other sites: <iframe src="https://www.afronomicsfeed.com/embed/kenya-tbills">. */
export async function GET(request: Request, { params }: { params: Promise<{ widget: string }> }) {
  const { widget } = await params;
  const html = await renderWidget(widget, new URL(request.url).searchParams, renderTime());
  if (!html) return new Response("Widget unavailable", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=86400",
      "Content-Security-Policy": "frame-ancestors *",
      "X-Robots-Tag": "noindex",
    },
  });
}
