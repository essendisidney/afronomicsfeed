import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { MarketFileView } from "@/components/markets/MarketFileView";
import { currencies, getInstrumentByKind } from "@/lib/demo/markets";
import { fxForLabel, loadFxQuote } from "@/lib/fx/reference";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return currencies.map((row) => ({ code: row.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const row = getInstrumentByKind("currency", code);
  if (!row) return {};
  return {
    title: `${row.label} market file`,
    description: `${row.label} daily reference, when the rate feed returns a number. Official door: ${row.href}`,
    alternates: { canonical: `${site.url}${row.fileHref}` },
  };
}

export default async function CurrencyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const row = getInstrumentByKind("currency", code);
  if (!row) notFound();
  const quote = await loadFxQuote();
  const value = fxForLabel(row.label, quote);
  const peerValues = Object.fromEntries(
    currencies.flatMap((item) => {
      const rate = fxForLabel(item.label, quote);
      return rate ? [[item.label, rate] as const] : [];
    }),
  );

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/markets", label: "Markets" },
        { label: row.label },
      ]}
      kicker="Currency file"
      title={row.label}
      lede="Daily mid-market reference when the feed returns a number. Not a central-bank dealing rate."
    >
      <MarketFileView
        item={row}
        peerValues={peerValues}
        reference={
          value && quote
            ? { value, updated: quote.updated, sourceName: quote.sourceName, sourceUrl: quote.sourceUrl }
            : null
        }
      />
    </LayerPage>
  );
}
