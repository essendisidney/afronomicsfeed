import { NextResponse, type NextRequest } from "next/server";
import { cardUrl, parseShare, shareQuery, sharePath, shareSources, type ShareSource } from "@/lib/share";
import { shareView } from "@/lib/share-card";
import { site } from "@/lib/site";

/**
 * The link a reader shares: /share?kind=fair&mode=save&mine=3.5&place=bank&utm_source=whatsapp&utm_campaign=share.
 * Link previews (WhatsApp, LinkedIn, X, Facebook) read the Open Graph tags here and show the result card; they
 * do not run scripts. A person's browser runs the one-line script and lands on the tool itself, with the
 * campaign tags carried along so the page counter records which channel the visit came from.
 */

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

export function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const spec = parseShare(q);
  const view = spec ? shareView(spec) : null;
  const rawSource = q.get("utm_source");
  const source: ShareSource | null = rawSource && (shareSources as readonly string[]).includes(rawSource) ? (rawSource as ShareSource) : null;
  const tags = new URLSearchParams(source ? { utm_source: source, utm_campaign: "share" } : {}).toString();

  if (!spec || !view) {
    return NextResponse.redirect(new URL(`/rates/kenya/check${tags ? `?${tags}` : ""}`, request.nextUrl.origin), 307);
  }

  const { path, hash } = sharePath(spec);
  const target = `${path}${tags ? `?${tags}` : ""}${hash}`;
  const origin = request.nextUrl.origin;
  const self = `${origin}/share?${shareQuery(spec).toString()}`;
  const image = cardUrl(spec, origin);
  const lang = "lang" in spec ? spec.lang : "en";
  const title = `${view.title} · ${site.name}`;

  const html = `<!doctype html>
<html lang="${esc(lang)}"${lang === "ar" ? ' dir="rtl"' : ""}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(view.description)}">
<meta name="robots" content="noindex, follow">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:title" content="${esc(view.title)}">
<meta property="og:description" content="${esc(view.description)}">
<meta property="og:url" content="${esc(self)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${esc(view.card.title)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(view.title)}">
<meta name="twitter:description" content="${esc(view.description)}">
<meta name="twitter:image" content="${esc(image)}">
<script>location.replace(${JSON.stringify(target).replace(/</g, "\\u003c")});</script>
<style>body{margin:0;padding:48px 16px;background:#0E1524;color:#F5F6F4;font:16px/1.5 system-ui,sans-serif;text-align:center}a{color:#B9A9FF}</style>
</head>
<body>
<p>${esc(view.title)}</p>
<p><a href="${esc(target)}">Open it on ${esc(site.name)}</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "X-Robots-Tag": "noindex",
    },
  });
}
