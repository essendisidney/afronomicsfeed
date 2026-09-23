import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { featuredCountrySlugs, getCountry } from "@/lib/demo/countries";
import { getIndicator, indicators } from "@/lib/demo/indicators";

export function generateStaticParams() {
  return indicators.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const indicator = getIndicator(slug);
  if (!indicator) return {};
  return {
    title: `${indicator.name} in Africa`,
    description: indicator.note,
  };
}

export default async function IndicatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const indicator = getIndicator(slug);
  if (!indicator) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/data", label: "Data" },
        { label: indicator.name },
      ]}
      kicker="Indicator"
      title={indicator.name}
      lede={`${indicator.unit}. ${indicator.note}`}
    >
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {featuredCountrySlugs.map((countrySlug) => {
          const country = getCountry(countrySlug);
          return <EmptyMetric key={countrySlug} label={country?.name ?? countrySlug} />;
        })}
      </div>
      <Provenance source="No observation stored" methodology="Append-only when a primary series lands" />
    </LayerPage>
  );
}
