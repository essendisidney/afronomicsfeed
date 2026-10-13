import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BondAuctionView, bondAuctionMetadata } from "@/components/bonds/BondAuctionView";
import { STATIC_MONTHS, bondAuction, recentAuctions, type AuctionLine } from "@/components/bonds/auction";
import { StoryBody } from "@/components/data/AuctionStory";
import { BondMeaning } from "@/components/data/BondMeaning";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { bondStory } from "@/lib/data/auction-stories";
import { fitTitle } from "@/lib/seo";

export const revalidate = 86400;

/** Auctions of the last 24 months are built ahead; older ones render on first request and are then cached. */
export function generateStaticParams() {
  return recentAuctions("kenya", STATIC_MONTHS).map((a) => ({ date: a.date }));
}

type Props = { params: Promise<{ date: string }> };

function load(date: string) {
  const story = bondStory(date);
  const auction = bondAuction("kenya", date);
  return story && auction ? { story, auction } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { date } = await params;
  const hit = load(date);
  if (!hit) return { title: "Auction not found" };
  // The shared description and canonical; Kenya keeps its long-standing headline, which names the bond.
  return {
    ...bondAuctionMetadata(hit.auction),
    title: fitTitle(hit.story.headline),
  };
}

export default async function BondAuctionPage({ params }: Props) {
  const { date } = await params;
  const hit = load(date);
  if (!hit) notFound();
  const { story, auction } = hit;

  // The CBK's price per 100 for each line, from the Kenya file (the shared rows do not carry it).
  const price = new Map(story.rows.map((r) => [`${r.issue}|${r.kind}`, r.price_per_100]));
  const priceColumn = {
    key: "price",
    header: "Price /100",
    numeric: true,
    cell: (l: AuctionLine) => {
      const p = price.get(`${l.issue}|${l.type}`);
      return <span className="font-mono text-xs">{p == null ? "—" : p.toFixed(3)}</span>;
    },
  };

  return (
    <BondAuctionView
      auction={auction}
      updatedAt={auction.updatedAt}
      title={story.headline}
      extraColumns={[priceColumn]}
      intro={
        <>
          <StoryBody paragraphs={story.paragraphs} />
          <BondMeaning rows={story.rows} />
        </>
      }
      after={<NewsletterBand lede="Every Monday: the week's auctions, currencies and the stories that moved African markets. Free." />}
    />
  );
}
