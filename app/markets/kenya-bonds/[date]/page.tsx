import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AuctionNav, StoryBody } from "@/components/data/AuctionStory";
import { BondMeaning } from "@/components/data/BondMeaning";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { bondDates, bondStory, fmtDate } from "@/lib/data/auction-stories";
import { yearsToMaturity } from "@/lib/data/kenya-bonds";
import { site } from "@/lib/site";

export const revalidate = 86400;

export function generateStaticParams() {
  return bondDates()
    .slice(0, 30)
    .map((date) => ({ date }));
}

type Props = { params: Promise<{ date: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const story = /^\d{4}-\d{2}-\d{2}$/.test(date) ? bondStory(date) : null;
  if (!story) return { title: "Auction not found" };
  return {
    title: story.headline,
    description: story.paragraphs.slice(0, 2).join(" ").slice(0, 300),
    alternates: { canonical: `${site.url}/markets/kenya-bonds/${date}` },
  };
}

const kes = (m: number | null | undefined) => (m == null ? "—" : `KES ${(m / 1000).toFixed(2)}bn`);

export default async function BondAuctionPage({ params }: Props) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  const story = bondStory(date);
  if (!story) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.headline,
    datePublished: date,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    isBasedOn: story.rows[0]?.source,
    mainEntityOfPage: `${site.url}/markets/kenya-bonds/${date}`,
  };

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets/kenya-bonds", label: "Kenya bonds" }, { label: date }]}
      kicker={`Kenya Treasury bonds · auction of ${fmtDate(date)}`}
      title={story.headline}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StoryBody paragraphs={story.paragraphs} />
      <BondMeaning rows={story.rows} />

      <section className="mt-12">
        <SectionTitle kicker="Results" title="By bond" />
        <div className="overflow-x-auto">
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th>Bond</th>
                <th>Sale</th>
                <th className="text-right">Yield</th>
                <th className="text-right">Coupon</th>
                <th className="text-right">Years left</th>
                <th className="text-right">Bids</th>
                <th className="text-right">Accepted</th>
                <th className="text-right">Price /100</th>
              </tr>
            </thead>
            <tbody>
              {story.rows.map((row) => (
                <tr key={`${row.issue}-${row.kind}`}>
                  <td className="font-mono text-xs">{row.issue}</td>
                  <td className="text-xs text-ink-soft">{row.kind}</td>
                  <td className="text-right font-mono text-sm">{row.weighted_avg_rate.toFixed(3)}%</td>
                  <td className="text-right font-mono text-xs">{row.coupon == null ? "—" : `${row.coupon.toFixed(3)}%`}</td>
                  <td className="text-right font-mono text-xs">{yearsToMaturity(row).toFixed(1)}</td>
                  <td className="text-right font-mono text-xs">{kes(row.received_kes_m)}</td>
                  <td className="text-right font-mono text-xs">{kes(row.accepted_kes_m)}</td>
                  <td className="text-right font-mono text-xs">{row.price_per_100 == null ? "—" : row.price_per_100.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {story.rows[0] ? <SourceLine name="Central Bank of Kenya result notice" href={story.rows[0].source} detail="the PDF these figures were read from" /> : null}
      </section>

      <AuctionNav base="/markets/kenya-bonds" newer={story.newer} older={story.older} />
      <NewsletterBand lede="Every Monday: the week's auctions, currencies and the stories that moved African markets. Free." />
    </PageShell>
  );
}
