import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { getCountry } from "@/lib/demo/countries";
import { getIndicator, indicatorCountryParams, indicators } from "@/lib/demo/indicators";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return indicatorCountryParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; country: string }>;
}): Promise<Metadata> {
  const { slug, country: countrySlug } = await params;
  const indicator = getIndicator(slug);
  const country = getCountry(countrySlug);
  if (!indicator || !country) return {};
  return {
    title: `${indicator.name} — ${country.name}`,
    description: `${indicator.name} file for ${country.name}. ${indicator.note}`,
    alternates: { canonical: `${site.url}/indicators/${indicator.slug}/${country.slug}` },
  };
}

export default async function IndicatorCountryPage({
  params,
}: {
  params: Promise<{ slug: string; country: string }>;
}) {
  const { slug, country: countrySlug } = await params;
  const indicator = getIndicator(slug);
  const country = getCountry(countrySlug);
  if (!indicator || !country) notFound();

  const peers = indicators.filter((item) => item.slug !== indicator.slug);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/data", label: "Data" },
        { href: `/indicators/${indicator.slug}`, label: indicator.name },
        { label: country.name },
      ]}
      kicker={`${indicator.name} · ${country.iso}`}
      title={`${indicator.name} in ${country.name}`}
      lede={`${indicator.unit}. ${indicator.note} This country cell is blank until a primary observation is stored.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Latest print" />
        <EmptyMetric label="Period" note={indicator.unit} />
        <EmptyMetric label="Source" note={country.tape ? country.tape.label : "No official door linked"} />
      </div>

      <p className="mt-8 text-sm">
        <Link href={`/countries/${country.slug}/${indicator.countrySeries}`} className="text-forest underline underline-offset-2">
          {country.name} {indicator.countrySeries} series
        </Link>
        {country.tape ? (
          <>
            {" · "}
            <a href={country.tape.href} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2">
              {country.tape.label}
            </a>
          </>
        ) : null}
      </p>

      <ul className="mt-6 flex flex-wrap gap-3 text-sm">
        {peers.map((item) => (
          <li key={item.slug}>
            <Link href={`/indicators/${item.slug}/${country.slug}`} className="text-forest underline underline-offset-2">
              {item.name}
            </Link>
          </li>
        ))}
      </ul>

      <Provenance source="No observation stored" methodology="Append-only when a primary series lands" />
    </LayerPage>
  );
}