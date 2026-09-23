import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { countries } from "@/lib/demo/countries";
import { getTechLens, techFileHref, techLenses } from "@/lib/demo/tech";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return techLenses.map((lens) => ({ lens: lens.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lens: string }>;
}): Promise<Metadata> {
  const { lens: slug } = await params;
  const lens = getTechLens(slug);
  if (!lens) return {};
  return {
    title: lens.label,
    description: lens.lede,
    alternates: { canonical: `${site.url}/technology/${lens.slug}` },
  };
}

export default async function TechLensPage({
  params,
}: {
  params: Promise<{ lens: string }>;
}) {
  const { lens: slug } = await params;
  const lens = getTechLens(slug);
  if (!lens) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/technology", label: "Technology" },
        { label: lens.label },
      ]}
      kicker="Tech lens"
      title={lens.label}
      lede={lens.lede}
    >
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <li key={country.slug}>
            <Link href={techFileHref(lens.slug, country.slug)} className="block border border-rule px-3 py-3 hover:border-gold">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{country.iso}</p>
              <p className="mt-1 font-serif text-lg">{country.name}</p>
              <p className="mt-1 text-xs text-muted">No sourced row</p>
            </Link>
          </li>
        ))}
      </ul>
      <Provenance source="No production tech book" methodology="No invented rounds. Country files exist so a cited raise or licence has a place to land." />
    </LayerPage>
  );
}
