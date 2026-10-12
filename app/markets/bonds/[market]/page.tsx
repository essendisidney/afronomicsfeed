import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BondMarketView, bondMetadata } from "@/components/bonds/BondMarketView";
import { issuersOf, marketsWithRows } from "@/components/bonds/stats";
import { getBondMarket, loadBondMarket } from "@/lib/data/sovereign-bonds";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return marketsWithRows().map(({ market }) => ({ market: market.slug }));
}

type Props = { params: Promise<{ market: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { market: slug } = await params;
  const market = getBondMarket(slug);
  if (!market) return { title: "Not found" };
  return bondMetadata({ market, rows: loadBondMarket(market.slug).rows });
}

export default async function BondMarketPage({ params }: Props) {
  const { market: slug } = await params;
  const market = getBondMarket(slug);
  if (!market) notFound();
  const { rows, updatedAt } = loadBondMarket(market.slug);
  if (!rows.length) notFound();
  return <BondMarketView market={market} rows={rows} updatedAt={updatedAt} issuers={market.slug === "waemu" ? issuersOf(rows) : []} />;
}
