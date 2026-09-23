import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { agencyFileHref } from "@/lib/demo/agencies";
import { citiesInCountry } from "@/lib/demo/cities";
import { countries, getCountry } from "@/lib/demo/countries";
import { indicatorCountryHref, indicators } from "@/lib/demo/indicators";
import { industriesForCountry, industryFileHref } from "@/lib/demo/industries";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return countries.map((country) => ({ slug: country.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const country = getCountry(slug);
  if (!country) return {};
  return {
    title: `${country.name} economy`,
    description: `Macro file for ${country.name}. Pulse and indicator cells unpublished until a primary series is stored.`,
    alternates: { canonical: `${site.url}/economy/${country.slug}` },
  };
}

export default async function EconomyCountryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const country = getCountry(slug);
  if (!country) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/economy", label: "Economy" },
        { label: country.name },
      ]}
      kicker={`Economy · ${country.iso}`}
      title={`${country.name} economy`}
      lede={`Currency ${country.currency}. Growth, inflation, rates and debt stay blank until a cited print exists.`}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {indicators.map((item) => (
          <Link key={item.slug} href={indicatorCountryHref(item.slug, country.slug)} className="hover:border-gold">
            <EmptyMetric label={item.name} note="Open the indicator cell" />
          </Link>
        ))}
      </div>
      <p className="mt-8 text-sm">
        <Link href={`/countries/${country.slug}/economy`} className="text-forest underline underline-offset-2">
          {country.name} economy series
        </Link>
        {" · "}
        <Link href={`/countries/${country.slug}/pulse`} className="text-forest underline underline-offset-2">
          Pulse
        </Link>
        {" · "}
        <Link href={`/climate/${country.slug}`} className="text-forest underline underline-offset-2">
          Climate capital
        </Link>
        {" · "}
        <Link href={`/projects/${country.slug}`} className="text-forest underline underline-offset-2">
          Project Lens
        </Link>
        {" · "}
        <Link href={agencyFileHref("central-bank", country.slug)} className="text-forest underline underline-offset-2">
          Central bank
        </Link>
        {industriesForCountry(country.slug)
          .slice(0, 2)
          .map((item) => (
            <span key={item.slug}>
              {" · "}
              <Link href={industryFileHref(item.slug, country.slug)} className="text-forest underline underline-offset-2">
                {item.label}
              </Link>
            </span>
          ))}
        {citiesInCountry(country.slug).map((city) => (
          <span key={city.slug}>
            {" · "}
            <Link href={`/cities/${city.slug}`} className="text-forest underline underline-offset-2">
              {city.name}
            </Link>
          </span>
        ))}
      </p>
      <Provenance source="No observation stored" methodology="Afronomics Pulse remains methodology until a primary series is stored." />
    </LayerPage>
  );
}
