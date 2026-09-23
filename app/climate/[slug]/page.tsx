import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { climateCountryParams, climateDoors, climateSlots } from "@/lib/demo/climate";
import { getCountry } from "@/lib/demo/countries";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return climateCountryParams();
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
    title: `${country.name} climate capital`,
    description: `Climate capital, energy mix and the funding gap for ${country.name}. Cells stay empty until sourced.`,
    alternates: { canonical: `${site.url}/climate/${country.slug}` },
  };
}

export default async function ClimateCountryPage({
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
        { href: "/climate", label: "Climate" },
        { label: country.name },
      ]}
      kicker={`Climate · ${country.iso}`}
      title={`${country.name} climate capital`}
      lede="Committed, deployed and the gap stay blank until each figure carries a source. This file exists so a cited facility has a place to land."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {climateSlots.map((slot) => (
          <EmptyMetric key={slot} label={slot} />
        ))}
      </div>

      <p className="mt-8 text-sm">
        <Link href={`/countries/${country.slug}/climate`} className="text-forest underline underline-offset-2">
          {country.name} climate series
        </Link>
        {" · "}
        <Link href={`/countries/${country.slug}/energy`} className="text-forest underline underline-offset-2">
          Energy series
        </Link>
        {" · "}
        <Link href={`/projects/${country.slug}`} className="text-forest underline underline-offset-2">
          Project Lens
        </Link>
      </p>

      <ul className="mt-6 flex flex-wrap gap-3 text-sm">
        {climateDoors.map((door) => (
          <li key={door.href}>
            <Link href={`${door.href}/${country.slug}`} className="text-forest underline underline-offset-2">
              {door.label}
            </Link>
          </li>
        ))}
      </ul>

      <Provenance source="Not stored" methodology="Climate Finance Gap is methodology only until licensed project and DFI books exist." />
    </LayerPage>
  );
}
