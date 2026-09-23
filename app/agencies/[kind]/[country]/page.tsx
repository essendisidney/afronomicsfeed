import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { agencyCountryParams, agencyDisplayName, agencyKinds, getAgencyKind, kenyaDeskForAgency } from "@/lib/demo/agencies";
import { getCountry } from "@/lib/demo/countries";
import { personFileHref } from "@/lib/demo/people";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return agencyCountryParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kind: string; country: string }>;
}): Promise<Metadata> {
  const { kind: kindSlug, country: countrySlug } = await params;
  const kind = getAgencyKind(kindSlug);
  const country = getCountry(countrySlug);
  if (!kind || !country) return {};
  return {
    title: `${agencyDisplayName(kind.slug, country.slug)}`,
    description: `${kind.label} file for ${country.name}. ${kind.lede}`,
    alternates: { canonical: `${site.url}/agencies/${kind.slug}/${country.slug}` },
  };
}

export default async function AgencyCountryPage({
  params,
}: {
  params: Promise<{ kind: string; country: string }>;
}) {
  const { kind: kindSlug, country: countrySlug } = await params;
  const kind = getAgencyKind(kindSlug);
  const country = getCountry(countrySlug);
  if (!kind || !country) notFound();
  const title = agencyDisplayName(kind.slug, country.slug);
  const peers = agencyKinds.filter((item) => item.slug !== kind.slug);
  const official = kind.slug === "central-bank" ? country.tape : undefined;
  const kenyaDesk = country.slug === "kenya" ? kenyaDeskForAgency(kind.slug) : undefined;

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/agencies", label: "Agencies" },
        { href: `/agencies/${kind.slug}`, label: kind.label },
        { label: country.name },
      ]}
      kicker={`${kind.label} · ${country.iso}`}
      title={title}
      lede={`${kind.lede} This country file is a door. It does not invent the print.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Latest notice" />
        <EmptyMetric label="As-of" />
        <EmptyMetric label="Mandate document" />
      </div>
      <p className="mt-8 text-sm">
        {official ? (
          <>
            <a href={official.href} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2">
              Official site
            </a>
            {" · "}
          </>
        ) : null}
        <Link href={`/economy/${country.slug}`} className="text-forest underline underline-offset-2">
          {country.name} economy
        </Link>
        {" · "}
        <Link href={`/countries/${country.slug}/policy`} className="text-forest underline underline-offset-2">
          Policy series
        </Link>
        {kind.slug === "central-bank" ? (
          <>
            {" · "}
            <Link href={`/indicators/policy-rate/${country.slug}`} className="text-forest underline underline-offset-2">
              Policy rate cell
            </Link>
            {" · "}
            <Link href={personFileHref("central-bank-governor", country.slug)} className="text-forest underline underline-offset-2">
              Governor role
            </Link>
          </>
        ) : null}
        {kind.slug === "treasury" ? (
          <>
            {" · "}
            <Link href={personFileHref("finance-minister", country.slug)} className="text-forest underline underline-offset-2">
              Finance minister role
            </Link>
          </>
        ) : null}
        {kenyaDesk ? (
          <>
            {" · "}
            <Link href={kenyaDesk.href} className="text-forest underline underline-offset-2">
              {kenyaDesk.label}
            </Link>
          </>
        ) : country.slug === "kenya" ? (
          <>
            {" · "}
            <Link href="/institutions" className="text-forest underline underline-offset-2">
              Kenya institutions
            </Link>
          </>
        ) : null}
      </p>
      <ul className="mt-6 flex flex-wrap gap-3 text-sm">
        {peers.map((item) => (
          <li key={item.slug}>
            <Link href={`/agencies/${item.slug}/${country.slug}`} className="text-forest underline underline-offset-2">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <Provenance source={official?.href ?? "No official door linked"} methodology="No invented circular, rate or gazette." />
    </LayerPage>
  );
}
