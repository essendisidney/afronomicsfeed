import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { MarketFileView } from "@/components/markets/MarketFileView";
import { currencies, getInstrumentByKind } from "@/lib/demo/markets";
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
    description: `${row.label} — demonstration print only. Official door: ${row.href}`,
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

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/markets", label: "Markets" },
        { label: row.label },
      ]}
      kicker="Currency file"
      title={row.label}
      lede="This is not a live price. The value below is a demonstration print used to hold the layout."
    >
      <MarketFileView item={row} />
    </LayerPage>
  );
}
