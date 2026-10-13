import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BondAuctionView, bondAuctionMetadata } from "@/components/bonds/BondAuctionView";
import { STATIC_MONTHS, bondAuction, recentAuctions } from "@/components/bonds/auction";

/**
 * One WAEMU issuer's bond auction on one date: /markets/bonds/waemu/senegal/2026-10-09. UMOA-Titres runs a separate
 * auction for each treasury, so the dated page is per issuer. Other markets' dated pages are one level up.
 */

export const revalidate = 3600;

export function generateStaticParams() {
  return recentAuctions("waemu", STATIC_MONTHS).map((a) => ({
    market: "waemu",
    slug: a.issuer!,
    date: a.date,
  }));
}

type Props = {
  params: Promise<{ market: string; slug: string; date: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { market, slug, date } = await params;
  const auction = market === "waemu" ? bondAuction(market, date, slug) : null;
  return auction ? bondAuctionMetadata(auction) : { title: "Auction not found" };
}

export default async function WaemuAuctionPage({ params }: Props) {
  const { market, slug, date } = await params;
  const auction = market === "waemu" ? bondAuction(market, date, slug) : null;
  if (!auction) notFound();
  return <BondAuctionView auction={auction} updatedAt={auction.updatedAt} />;
}
