import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { countries } from "@/lib/demo/countries";
import { getIndicator, indicatorCountryHref, indicators } from "@/lib/demo/indicators";

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
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <li key={country.slug}>
            <Link
              href={indicatorCountryHref(indicator.slug, country.slug)}
              className="block border border-rule px-3 py-3 hover:border-gold"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{country.iso}</p>
              <p className="mt-1 font-serif text-lg">{country.name}</p>
              <p className="mt-1 text-xs text-muted">No observation stored</p>
            </Link>
          </li>
        ))}
      </ul>
      <Provenance source="No observation stored" methodology="Append-only when a primary series lands" />
    </LayerPage>
  );
}
