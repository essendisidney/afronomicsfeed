import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { MarketFileView } from "@/components/markets/MarketFileView";
import { exchanges, getInstrumentByKind } from "@/lib/demo/markets";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return exchanges.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = getInstrumentByKind("exchange", slug);
  if (!row) return {};
  return {
    title: `${row.label} exchange file`,
    description: `${row.label} — demonstration print only. Official door: ${row.href}`,
    alternates: { canonical: `${site.url}${row.fileHref}` },
  };
}

export default async function ExchangePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const row = getInstrumentByKind("exchange", slug);
  if (!row) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/markets", label: "Markets" },
        { label: row.label },
      ]}
      kicker="Exchange file"
      title={row.label}
      lede="This is not a live index. The official tape lives at the exchange door."
    >
      <MarketFileView item={row} />
    </LayerPage>
  );
}
