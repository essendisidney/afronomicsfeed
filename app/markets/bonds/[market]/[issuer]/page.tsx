import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BondMarketView, bondMetadata } from "@/components/bonds/BondMarketView";
import { issuersOf } from "@/components/bonds/stats";
import { getBondMarket, loadBondMarket } from "@/lib/data/sovereign-bonds";

/** One issuing country inside a pooled market (WAEMU): /markets/bonds/waemu/senegal. */

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return issuersOf(loadBondMarket("waemu").rows).map((i) => ({ market: "waemu", issuer: i.slug }));
}

type Props = { params: Promise<{ market: string; issuer: string }> };

function resolve(slug: string, issuerSlug: string) {
  const market = getBondMarket(slug);
  if (!market || market.slug !== "waemu") return null;
  const all = loadBondMarket(market.slug);
  const issuers = issuersOf(all.rows);
  const issuer = issuers.find((i) => i.slug === issuerSlug);
  if (!issuer) return null;
  return { market, issuer, issuers, rows: all.rows.filter((r) => r.issue === issuer.name), updatedAt: all.updatedAt };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { market, issuer } = await params;
  const hit = resolve(market, issuer);
  if (!hit) return { title: "Not found" };
  return bondMetadata(hit);
}

export default async function BondIssuerPage({ params }: Props) {
  const { market, issuer } = await params;
  const hit = resolve(market, issuer);
  if (!hit || !hit.rows.length) notFound();
  return <BondMarketView market={hit.market} rows={hit.rows} updatedAt={hit.updatedAt} issuer={hit.issuer} issuers={hit.issuers} />;
}
