import { saccoWidget, saccoWidgetHtml } from "@/lib/embeds-sacco";

/**
 * The SACCO member widget (lib/embeds-sacco.ts): <iframe src="https://www.afronomicsfeed.com/embed/sacco/<slug>">.
 * Only the figures SASRA published for that SACCO, with source and date; /embed/sacco/sample is a labelled demo.
 */
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = saccoWidget(slug);
  if (!w) {
    const note = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Afronomics</title><meta name="robots" content="noindex"></head><body style="margin:0;font:14px/1.5 system-ui,sans-serif;color:#1d1512;background:#f7f3ef"><p style="margin:12px">No SACCO with this name is on SASRA&rsquo;s lists. <a href="https://www.afronomicsfeed.com/registry" target="_blank" rel="noopener" style="color:#a33a1c">Find it in the registry</a>.</p></body></html>`;
    return new Response(note, { status: 404, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300", "X-Robots-Tag": "noindex" } });
  }
  return new Response(saccoWidgetHtml(w, new URL(request.url).searchParams.get("theme")), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      "Content-Security-Policy": "frame-ancestors *",
      "X-Robots-Tag": "noindex",
    },
  });
}
