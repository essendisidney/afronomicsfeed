import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { getCountry } from "@/lib/demo/countries";
import { getTechLens, techCountryParams, techLenses } from "@/lib/demo/tech";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return techCountryParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lens: string; country: string }>;
}): Promise<Metadata> {
  const { lens: lensSlug, country: countrySlug } = await params;
  const lens = getTechLens(lensSlug);
  const country = getCountry(countrySlug);
  if (!lens || !country) return {};
  return {
    title: `${lens.label} — ${country.name}`,
    description: `${lens.label} file for ${country.name}. ${lens.lede}`,
    alternates: { canonical: `${site.url}/technology/${lens.slug}/${country.slug}` },
  };
}

export default async function TechCountryPage({
  params,
}: {
  params: Promise<{ lens: string; country: string }>;
}) {
  const { lens: lensSlug, country: countrySlug } = await params;
  const lens = getTechLens(lensSlug);
  const country = getCountry(countrySlug);
  if (!lens || !country) notFound();

  const peers = techLenses.filter((item) => item.slug !== lens.slug);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/technology", label: "Technology" },
        { href: `/technology/${lens.slug}`, label: lens.label },
        { label: country.name },
      ]}
      kicker={`${lens.label} · ${country.iso}`}
      title={`${lens.label} in ${country.name}`}
      lede={`${lens.lede} This country cell is empty until a cited company, licence or facility exists.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Companies" />
        <EmptyMetric label="Latest event" />
        <EmptyMetric label="Regulator door" note="See institutions when tagged" />
      </div>
      <p className="mt-8 text-sm">
        <Link href={`/countries/${country.slug}/technology`} className="text-forest underline underline-offset-2">
          {country.name} technology series
        </Link>
        {" · "}
        <Link href={`/capital/vc/${country.slug}`} className="text-forest underline underline-offset-2">
          VC book
        </Link>
        {" · "}
        <Link href={`/companies`} className="text-forest underline underline-offset-2">
          Company intelligence
        </Link>
      </p>
      <ul className="mt-6 flex flex-wrap gap-3 text-sm">
        {peers.map((item) => (
          <li key={item.slug}>
            <Link href={`/technology/${item.slug}/${country.slug}`} className="text-forest underline underline-offset-2">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <Provenance source="No sourced row" methodology="No invented rounds. Failures and acquisitions sit next to raises when a filing exists." />
    </LayerPage>
  );
}
