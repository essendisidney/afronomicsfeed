import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { countries } from "@/lib/demo/countries";
import { getPersonRole, personFileHref, personRoles } from "@/lib/demo/people";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return personRoles.map((role) => ({ role: role.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const { role: slug } = await params;
  const role = getPersonRole(slug);
  if (!role) return {};
  return {
    title: role.label,
    description: role.lede,
    alternates: { canonical: `${site.url}/people/${role.slug}` },
  };
}

export default async function PersonRolePage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role: slug } = await params;
  const role = getPersonRole(slug);
  if (!role) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/people", label: "People" },
        { label: role.label },
      ]}
      kicker="Role"
      title={role.label}
      lede={role.lede}
    >
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <li key={country.slug}>
            <Link href={personFileHref(role.slug, country.slug)} className="block border border-rule px-3 py-3 hover:border-gold">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{country.iso}</p>
              <p className="mt-1 font-serif text-lg">{country.name}</p>
              <p className="mt-1 text-xs text-muted">No sourced appointment</p>
            </Link>
          </li>
        ))}
      </ul>
      <Provenance source="No biography book" methodology="Role files only. Names are not invented." />
    </LayerPage>
  );
}
