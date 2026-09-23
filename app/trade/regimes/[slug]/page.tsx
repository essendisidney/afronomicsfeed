import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { getTradeRegime, tradeRegimes } from "@/lib/demo/trade";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return tradeRegimes.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const regime = getTradeRegime(slug);
  if (!regime) return {};
  return {
    title: regime.name,
    description: regime.lede,
    alternates: { canonical: `${site.url}/trade/regimes/${regime.slug}` },
  };
}

export default async function TradeRegimePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const regime = getTradeRegime(slug);
  if (!regime) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/trade", label: "Trade" },
        { label: regime.name },
      ]}
      kicker="Trade regime"
      title={regime.name}
      lede={regime.lede}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Protocols on file" />
        <EmptyMetric label="National gazettes" />
        <EmptyMetric label="Tariff lines" note="Not a modelled book" />
      </div>
      <p className="mt-8 text-sm">
        <Link href="/trade/ports" className="text-forest underline underline-offset-2">
          Ports
        </Link>
        {" · "}
        <Link href="/trade/northern-corridor" className="text-forest underline underline-offset-2">
          Northern Corridor
        </Link>
      </p>
      <Provenance source="No instrument stored" methodology="AfCFTA cells stay empty until a cited protocol or gazette exists." />
    </LayerPage>
  );
}
