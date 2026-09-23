import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { agencyFileHref } from "@/lib/demo/agencies";
import { getCountry } from "@/lib/demo/countries";
import { getPersonRole, personCountryParams, personRoles } from "@/lib/demo/people";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return personCountryParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string; country: string }>;
}): Promise<Metadata> {
  const { role: roleSlug, country: countrySlug } = await params;
  const role = getPersonRole(roleSlug);
  const country = getCountry(countrySlug);
  if (!role || !country) return {};
  return {
    title: `${role.label} — ${country.name}`,
    description: `${role.label} file for ${country.name}. Role file, not a biography.`,
    alternates: { canonical: `${site.url}/people/${role.slug}/${country.slug}` },
  };
}

export default async function PersonCountryPage({
  params,
}: {
  params: Promise<{ role: string; country: string }>;
}) {
  const { role: roleSlug, country: countrySlug } = await params;
  const role = getPersonRole(roleSlug);
  const country = getCountry(countrySlug);
  if (!role || !country) notFound();
  const peers = personRoles.filter((item) => item.slug !== role.slug);
  const agencyHref =
    role.slug === "central-bank-governor"
      ? agencyFileHref("central-bank", country.slug)
      : agencyFileHref("treasury", country.slug);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/people", label: "People" },
        { href: `/people/${role.slug}`, label: role.label },
        { label: country.name },
      ]}
      kicker={`${role.label} · ${country.iso}`}
      title={`${role.label}, ${country.name}`}
      lede={`${role.lede} This country cell does not invent a name.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Name" />
        <EmptyMetric label="Appointed" />
        <EmptyMetric label="Term" />
      </div>
      <p className="mt-8 text-sm">
        <Link href={agencyHref} className="text-forest underline underline-offset-2">
          {role.slug === "central-bank-governor" ? "Central bank file" : "Treasury file"}
        </Link>
        {" · "}
        <Link href={`/economy/${country.slug}`} className="text-forest underline underline-offset-2">
          {country.name} economy
        </Link>
        {" · "}
        <Link href={`/countries/${country.slug}/policy`} className="text-forest underline underline-offset-2">
          Policy series
        </Link>
      </p>
      <ul className="mt-6 flex flex-wrap gap-3 text-sm">
        {peers.map((item) => (
          <li key={item.slug}>
            <Link href={`/people/${item.slug}/${country.slug}`} className="text-forest underline underline-offset-2">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <Provenance source="No sourced appointment" methodology="No invented name, biography or speech." />
    </LayerPage>
  );
}
