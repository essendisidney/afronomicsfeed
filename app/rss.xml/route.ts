import { getAllArticles } from "@/lib/content";
import { allTbillWeeks, bondDates, bondStory, tbillStory } from "@/lib/data/auction-stories";
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
  type Entry = { title: string; url: string; date: string; html: string };
  const auctions: Entry[] = [
    ...allTbillWeeks()
      .slice(0, 12)
      .flatMap((week) => {
        const story = tbillStory(week.date);
        return story ? [{ title: story.headline, url: `${site.url}/markets/kenya-tbills/${week.date}`, date: week.date, html: story.paragraphs.map((p) => `<p>${escapeXml(p)}</p>`).join("") }] : [];
      }),
    ...bondDates()
      .slice(0, 8)
      .flatMap((date) => {
        const story = bondStory(date);
        return story ? [{ title: story.headline, url: `${site.url}/markets/kenya-bonds/${date}`, date, html: story.paragraphs.map((p) => `<p>${escapeXml(p)}</p>`).join("") }] : [];
      }),
  ];
  const auctionItems = auctions
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(
      (entry) => `
        <item>
          <title>${escapeXml(entry.title)}</title>
          <link>${entry.url}</link>
          <guid>${entry.url}</guid>
          <pubDate>${new Date(`${entry.date}T12:00:00+03:00`).toUTCString()}</pubDate>
          <description><![CDATA[${entry.html}]]></description>
        </item>`,
    )
    .join("");

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
      <title>${escapeXml(site.name)}</title>
      <link>${site.url}</link>
      <description>${escapeXml(site.description)}</description>
      <language>en-ke</language>
      ${auctionItems}
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
