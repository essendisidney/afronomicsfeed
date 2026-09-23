import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { countries } from "@/lib/demo/countries";
import { countriesForIndustry, getIndustry, industries, industryFileHref } from "@/lib/demo/industries";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return industries.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return {
    title: industry.label,
    description: industry.lede,
    alternates: { canonical: `${site.url}/industries/${industry.slug}` },
  };
}

export default async function IndustryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();
  const tagged = new Set(countriesForIndustry(industry.slug).map((item) => item.slug));

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/industries", label: "Industries" },
        { label: industry.label },
      ]}
      kicker="Industry"
      title={industry.label}
      lede={industry.lede}
    >
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((country) => (
          <li key={country.slug}>
            <Link href={industryFileHref(industry.slug, country.slug)} className="block border border-rule px-3 py-3 hover:border-gold">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{country.iso}</p>
              <p className="mt-1 font-serif text-lg">{country.name}</p>
              <p className="mt-1 text-xs text-muted">{tagged.has(country.slug) ? "On the graph" : "No sourced row"}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Provenance source="No production industry book" methodology="Tagged countries inherit sector labels from the country file. No invented output." />
    </LayerPage>
  );
}
