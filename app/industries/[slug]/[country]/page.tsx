import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { companiesInCountry } from "@/lib/demo/companies";
import { getCountry } from "@/lib/demo/countries";
import { getIndustry, industries, industriesForCountry, industryCountryParams } from "@/lib/demo/industries";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return industryCountryParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; country: string }>;
}): Promise<Metadata> {
  const { slug, country: countrySlug } = await params;
  const industry = getIndustry(slug);
  const country = getCountry(countrySlug);
  if (!industry || !country) return {};
  return {
    title: `${industry.label} — ${country.name}`,
    description: `${industry.label} file for ${country.name}. ${industry.lede}`,
    alternates: { canonical: `${site.url}/industries/${industry.slug}/${country.slug}` },
  };
}

export default async function IndustryCountryPage({
  params,
}: {
  params: Promise<{ slug: string; country: string }>;
}) {
  const { slug, country: countrySlug } = await params;
  const industry = getIndustry(slug);
  const country = getCountry(countrySlug);
  if (!industry || !country) notFound();
  const peers = industriesForCountry(country.slug).filter((item) => item.slug !== industry.slug);
  const issuers = companiesInCountry(country.slug);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/industries", label: "Industries" },
        { href: `/industries/${industry.slug}`, label: industry.label },
        { label: country.name },
      ]}
      kicker={`${industry.label} · ${country.iso}`}
      title={`${industry.label} in ${country.name}`}
      lede={`${industry.lede} This country cell is empty until a cited issuer, licence or output print exists.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Issuers" />
        <EmptyMetric label="Latest print" />
        <EmptyMetric label="Output" />
      </div>
      {issuers.length > 0 ? (
        <p className="mt-8 text-sm">
          Company files:{" "}
          {issuers.map((company, index) => (
            <span key={company.slug}>
              {index > 0 ? " · " : null}
              <Link href={`/companies/${company.slug}`} className="text-forest underline underline-offset-2">
                {company.name}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
      <p className="mt-4 text-sm">
        <Link href={`/economy/${country.slug}`} className="text-forest underline underline-offset-2">
          {country.name} economy
        </Link>
        {" · "}
        <Link href={`/countries/${country.slug}/companies`} className="text-forest underline underline-offset-2">
          companies series
        </Link>
        {industry.slug === "fintech" ? (
          <>
            {" · "}
            <Link href={`/technology/fintech/${country.slug}`} className="text-forest underline underline-offset-2">
              Fintech lens
            </Link>
          </>
        ) : null}
        {industry.slug === "energy" ? (
          <>
            {" · "}
            <Link href={`/countries/${country.slug}/energy`} className="text-forest underline underline-offset-2">
              Energy series
            </Link>
          </>
        ) : null}
      </p>
      <ul className="mt-6 flex flex-wrap gap-3 text-sm">
        {peers.map((item) => (
          <li key={item.slug}>
            <Link href={`/industries/${item.slug}/${country.slug}`} className="text-forest underline underline-offset-2">
              {item.label}
            </Link>
          </li>
        ))}
        {industries
          .filter((item) => item.slug !== industry.slug && !peers.some((peer) => peer.slug === item.slug))
          .slice(0, 3)
          .map((item) => (
            <li key={item.slug}>
              <Link href={`/industries/${item.slug}/${country.slug}`} className="text-forest underline underline-offset-2">
                {item.label}
              </Link>
            </li>
          ))}
      </ul>
      <Provenance source="No sourced row" methodology="No invented output, market share or ranking." />
    </LayerPage>
  );
}
