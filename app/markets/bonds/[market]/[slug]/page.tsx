import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { BondAuctionView, bondAuctionMetadata } from "@/components/bonds/BondAuctionView";
import { BondMarketView, bondMetadata } from "@/components/bonds/BondMarketView";
import { ISO_DATE, STATIC_MONTHS, bondAuction, recentAuctions } from "@/components/bonds/auction";
import { issuersOf, marketsWithRows } from "@/components/bonds/stats";
import { getBondMarket, loadBondMarket } from "@/lib/data/sovereign-bonds";

/**
 * Two kinds of page share this segment (Next allows one dynamic name per level):
 * - a dated auction, /markets/bonds/uganda/2026-10-07 (every market but WAEMU, whose auctions are per issuer:
 *   /markets/bonds/waemu/senegal/2026-10-09, in [date] below; Kenya's live at /markets/kenya-bonds/{date});
 * - one issuing country inside a pooled market (WAEMU), /markets/bonds/waemu/senegal.
 */

export const revalidate = 3600;

export function generateStaticParams() {
  const issuers = issuersOf(loadBondMarket("waemu").rows).map((i) => ({
    market: "waemu",
    slug: i.slug,
  }));
  // Auctions of the last 24 months are built ahead; older ones render on first request and are then cached.
  const dated = marketsWithRows()
    .filter(({ market }) => market.slug !== "waemu" && market.slug !== "kenya")
    .flatMap(({ market }) =>
      recentAuctions(market.slug, STATIC_MONTHS).map((a) => ({
        market: market.slug,
        slug: a.date,
      })),
    );
  return [...issuers, ...dated];
}

type Props = { params: Promise<{ market: string; slug: string }> };

function resolveIssuer(slug: string, issuerSlug: string) {
  const market = getBondMarket(slug);
  if (!market || market.slug !== "waemu") return null;
  const all = loadBondMarket(market.slug);
  const issuers = issuersOf(all.rows);
  const issuer = issuers.find((i) => i.slug === issuerSlug);
  if (!issuer) return null;
  return {
    market,
    issuer,
    issuers,
    rows: all.rows.filter((r) => r.issue === issuer.name),
    updatedAt: all.updatedAt,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { market, slug } = await params;
  if (ISO_DATE.test(slug)) {
    const auction = market === "kenya" ? null : bondAuction(market, slug);
    return auction ? bondAuctionMetadata(auction) : { title: "Auction not found" };
  }
  const hit = resolveIssuer(market, slug);
  if (!hit) return { title: "Not found" };
  return bondMetadata(hit);
}

export default async function BondSlugPage({ params }: Props) {
  const { market, slug } = await params;
  if (ISO_DATE.test(slug)) {
    // Kenya's dated pages have lived at /markets/kenya-bonds/{date} since before this route; one URL per auction.
    if (market === "kenya") permanentRedirect(`/markets/kenya-bonds/${slug}`);
    const auction = bondAuction(market, slug);
    if (!auction) notFound();
    return <BondAuctionView auction={auction} updatedAt={auction.updatedAt} />;
  }
  const hit = resolveIssuer(market, slug);
  if (!hit || !hit.rows.length) notFound();
  return <BondMarketView market={hit.market} rows={hit.rows} updatedAt={hit.updatedAt} issuer={hit.issuer} issuers={hit.issuers} />;
}
