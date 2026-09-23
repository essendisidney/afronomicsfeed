import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { cities, cityCountryName, getCity } from "@/lib/demo/cities";
import { getCountry } from "@/lib/demo/countries";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return cities.map((city) => ({ slug: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) return {};
  return {
    title: city.name,
    description: `${city.name} — ${city.role} in ${getCountry(city.countrySlug)?.name ?? city.countrySlug}.`,
    alternates: { canonical: `${site.url}/cities/${city.slug}` },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();
  const countryName = cityCountryName(city);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/cities", label: "Cities" },
        { label: city.name },
      ]}
      kicker={`City · ${countryName}`}
      title={city.name}
      lede={`${city.role} in ${countryName}. This file stays empty until a cited desk, print or project lands.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Desk notes" />
        <EmptyMetric label="Latest print" />
        <EmptyMetric label="Projects" />
      </div>
      <p className="mt-8 text-sm">
        <Link href={`/economy/${city.countrySlug}`} className="text-forest underline underline-offset-2">
          {countryName} economy
        </Link>
        {city.portSlug ? (
          <>
            {" · "}
            <Link href={`/trade/ports/${city.portSlug}`} className="text-forest underline underline-offset-2">
              Port file
            </Link>
          </>
        ) : null}
        {city.exchangeHref ? (
          <>
            {" · "}
            <Link href={city.exchangeHref} className="text-forest underline underline-offset-2">
              Exchange tape
            </Link>
          </>
        ) : null}
        <span>
          {" · "}
          <Link href={`/agencies/central-bank/${city.countrySlug}`} className="text-forest underline underline-offset-2">
            Central bank file
          </Link>
        </span>
      </p>
      <Provenance source="No sourced city book" methodology="No invented population, GDP or traffic figures." />
    </LayerPage>
  );
}
