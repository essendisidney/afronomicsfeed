import { renderTime } from "@/lib/data/fetcher";
import { renderWidget } from "@/lib/embeds";

/** Embeddable widgets for other sites: <iframe src="https://www.afronomicsfeed.com/embed/kenya-tbills">. */
export async function GET(request: Request, { params }: { params: Promise<{ widget: string }> }) {
  const { widget } = await params;
  const html = await renderWidget(widget, new URL(request.url).searchParams, renderTime());
  if (!html) {
    // Shown inside someone else's page: a small, styled note instead of raw text, and short caching so it recovers.
    const note = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Afronomics</title></head><body style="margin:0;font:14px/1.5 system-ui,sans-serif;color:#1d1512;background:#f7f3ef"><p style="margin:12px">This Afronomics widget is updating. <a href="https://www.afronomicsfeed.com" target="_blank" rel="noopener" style="color:#a33a1c">See the latest figures on afronomicsfeed.com</a>.</p></body></html>`;
    return new Response(note, { status: 503, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=60" } });
  }
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=900, stale-while-revalidate=86400",
      "Content-Security-Policy": "frame-ancestors *",
      "X-Robots-Tag": "noindex",
    },
  });
}
