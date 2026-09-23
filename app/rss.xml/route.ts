import { getAllArticles } from "@/lib/content";
import { articleHref } from "@/lib/format";
import { site } from "@/lib/site";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export async function GET() {
  const items = getAllArticles()
    .map((article) => {
      const url = `${site.url}${articleHref(article.category, article.slug)}`;
      const bullets = article.teaser.map((line) => `<li>${escapeXml(line)}</li>`).join("");
      return `
        <item>
          <title>${escapeXml(article.title)}</title>
          <link>${url}</link>
          <guid>${url}</guid>
          <pubDate>${new Date(`${article.date}T06:00:00+03:00`).toUTCString()}</pubDate>
          <description><![CDATA[<p>${escapeXml(article.summary)}</p><ul>${bullets}</ul>]]></description>
        </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0">
    <channel>
      <title>${escapeXml(site.name)} — free teasers</title>
      <link>${site.url}</link>
      <description>${escapeXml(site.description)}</description>
      <language>en-ke</language>
      ${items}
    </channel>
  </rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
