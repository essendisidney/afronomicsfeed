import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuctionNav, StoryBody } from "@/components/data/AuctionStory";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { allTbillWeeks, fmtDate, tbillStory } from "@/lib/data/auction-stories";
import { tenorLabel } from "@/lib/data/kenya-tbills";
import { site } from "@/lib/site";

export const revalidate = 86400;

export function generateStaticParams() {
  return allTbillWeeks()
    .slice(0, 40)
    .map((week) => ({ date: week.date }));
}

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const story = /^\d{4}-\d{2}-\d{2}$/.test(date) ? tbillStory(date) : null;
  if (!story) return { title: "Auction not found" };
  return {
    title: story.headline,
    description: story.paragraphs.slice(0, 2).join(" ").slice(0, 300),
    alternates: { canonical: `${site.url}/markets/kenya-tbills/${date}` },
  };
}

const kes = (m: number | null | undefined) => (m == null ? "—" : `KES ${(m / 1000).toFixed(2)}bn`);

export default async function TbillAuctionPage({ params }: Props) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  const story = tbillStory(date);
  if (!story) notFound();
  const { week, older, newer } = story;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.headline,
    datePublished: week.date,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    isBasedOn: week.source,
    mainEntityOfPage: `${site.url}/markets/kenya-tbills/${week.date}`,
  };

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets/kenya-tbills", label: "Kenya T-bills" }, { label: week.date }]}
      kicker={`Kenya Treasury bills · auction of ${fmtDate(week.date)}`}
      title={story.headline}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StoryBody paragraphs={story.paragraphs} />

      <section className="mt-12">
        <SectionTitle kicker="Results" title="By tenor" />
        <div className="overflow-x-auto">
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th>Tenor</th>
                <th className="text-right">Rate</th>
                <th className="text-right">Previous</th>
                <th className="text-right">Offered</th>
                <th className="text-right">Bids</th>
                <th className="text-right">Subscription</th>
                <th className="text-right">Accepted</th>
                <th className="text-right">Price /100</th>
              </tr>
            </thead>
            <tbody>
              {week.rows.map((row) => {
                const prev = older?.rows.find((item) => item.tenor === row.tenor);
                return (
                  <tr key={row.tenor}>
                    <td>{tenorLabel[row.tenor]}</td>
                    <td className="text-right font-mono text-sm">{row.weighted_avg_rate.toFixed(3)}%</td>
                    <td className="text-right font-mono text-xs text-muted">{prev ? `${prev.weighted_avg_rate.toFixed(3)}%` : "—"}</td>
                    <td className="text-right font-mono text-xs">{kes(row.offered_kes_m)}</td>
                    <td className="text-right font-mono text-xs">{kes(row.received_kes_m)}</td>
                    <td className="text-right font-mono text-xs">{row.subscription_pct == null ? "—" : `${row.subscription_pct.toFixed(0)}%`}</td>
                    <td className="text-right font-mono text-xs">{kes(row.accepted_kes_m)}</td>
                    <td className="text-right font-mono text-xs">{row.price_per_100 == null ? "—" : row.price_per_100.toFixed(3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {week.source ? <SourceLine name="Central Bank of Kenya result notice" href={week.source} detail="the PDF these figures were read from" /> : null}
      </section>

      <AuctionNav base="/markets/kenya-tbills" newer={newer?.date ?? null} older={older?.date ?? null} />
      <NewsletterBand lede="Every Monday: the week's auctions, currencies and the stories that moved African markets. Free." />
    </PageShell>
  );
}
