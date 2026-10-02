import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuctionNav, StoryBody } from "@/components/data/AuctionStory";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { AlertButton } from "@/components/ui/AlertButton";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { PlainMeaning } from "@/components/data/PlainMeaning";
import { fmtDate, marketDates, marketStory } from "@/lib/data/market-stories";
import { billMarkets } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";

export const revalidate = 86400;

/** Pre-render the latest 12 auctions of each market; older dates render on demand and are then cached. */
export function generateStaticParams() {
  return billMarkets
    .filter((m) => m.slug !== "kenya")
    .flatMap((m) => marketDates(m.slug).slice(0, 12).map((w) => ({ country: m.slug, date: w.date })));
}

type Props = { params: Promise<{ country: string; date: string }> };
const ISO = /^\d{4}-\d{2}-\d{2}$/;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, date } = await params;
  const story = ISO.test(date) ? marketStory(country, date) : null;
  if (!story) return { title: "Auction not found" };
  return {
    title: story.headline,
    description: story.paragraphs.slice(0, 2).join(" ").slice(0, 300),
    alternates: { canonical: `${site.url}/markets/tbills/${story.market.slug}/${date}` },
  };
}

export default async function MarketAuctionPage({ params }: Props) {
  const { country, date } = await params;
  if (!ISO.test(date)) notFound();
  const story = marketStory(country, date);
  if (!story) notFound();
  const { market, week, older, newer, prevOf } = story;
  const money = (m: number | null) => (m == null ? "—" : m >= 1000 ? `${market.currency} ${(m / 1000).toFixed(2)}bn` : `${market.currency} ${m.toFixed(0)}m`);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: story.headline,
    datePublished: week.date,
    author: { "@type": "Organization", name: site.name, url: site.url },
    publisher: { "@type": "Organization", name: site.name, url: site.url },
    isBasedOn: week.source,
    mainEntityOfPage: `${site.url}/markets/tbills/${market.slug}/${week.date}`,
  };

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets/tbills", label: "T-bill monitor" }, { href: market.href, label: market.country }, { label: week.date }]}
      kicker={`${market.country} Treasury bills · auction of ${fmtDate(week.date)}`}
      title={story.headline}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StoryBody paragraphs={story.paragraphs} />
      <PlainMeaning
        currency={market.currency}
        iso={market.iso}
        country={market.country}
        rows={week.rows.map((r) => ({ tenor: r.tenor, rate: r.rate, prev: story.prevOf(r.tenor)?.rate ?? null }))}
      />

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
                <th className="text-right">Accepted</th>
              </tr>
            </thead>
            <tbody>
              {week.rows.map((row) => {
                const prev = prevOf(row.tenor);
                return (
                  <tr key={row.tenor}>
                    <td>{row.tenor}-day</td>
                    <td className="text-right text-sm">{row.rate.toFixed(3)}%</td>
                    <td className="text-right text-xs text-muted">{prev ? `${prev.rate.toFixed(3)}%` : "—"}</td>
                    <td className="text-right text-xs">{money(row.offered)}</td>
                    <td className="text-right text-xs">{money(row.received)}</td>
                    <td className="text-right text-xs">{money(row.accepted)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {week.source ? <SourceLine name={`${market.publisher} result`} href={week.source} detail={market.rateNote} /> : null}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <AlertButton market={market.slug} label={`Alert me on ${market.country} results`} />
          <Link href="/markets/borrowing-costs" className="text-[13px] text-forest underline underline-offset-2">
            Real yields and demand across Africa
          </Link>
        </div>
      </section>

      <AuctionNav base={`/markets/tbills/${market.slug}`} newer={newer?.date ?? null} older={older?.date ?? null} />
      <CiteBlock title={`${market.country} Treasury bill auction, ${fmtDate(week.date)}`} path={`/markets/tbills/${market.slug}/${week.date}`} publisher={`the ${market.publisher}`} csv={`/api/data/tbills/${market.slug}`} />
      <NewsletterBand />
    </PageShell>
  );
}
