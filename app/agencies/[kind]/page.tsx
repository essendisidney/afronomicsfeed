import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { agencyDisplayName, agencyFileHref, agencyKinds, getAgencyKind } from "@/lib/demo/agencies";
import { countries } from "@/lib/demo/countries";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return agencyKinds.map((kind) => ({ kind: kind.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kind: string }>;
}): Promise<Metadata> {
  const { kind: slug } = await params;
  const kind = getAgencyKind(slug);
  if (!kind) return {};
  return {
    title: kind.label,
    description: kind.lede,
    alternates: { canonical: `${site.url}/agencies/${kind.slug}` },
  };
}

export default async function AgencyKindPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  const { kind: slug } = await params;
  const kind = getAgencyKind(slug);
  if (!kind) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/agencies", label: "Agencies" },
        { label: kind.label },
      ]}
      kicker="Agency"
      title={kind.label}
      lede={kind.lede}
    >
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <li key={country.slug}>
            <Link href={agencyFileHref(kind.slug, country.slug)} className="block border border-rule px-3 py-3 hover:border-gold">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{country.iso}</p>
              <p className="mt-1 font-serif text-lg">{agencyDisplayName(kind.slug, country.slug)}</p>
              <p className="mt-1 text-xs text-muted">{country.name}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Provenance source="Official doors only where linked" methodology="No invented circular or rate. The issuing site is the print." />
    </LayerPage>
  );
}
