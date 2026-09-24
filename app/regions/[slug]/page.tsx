import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { getCountry } from "@/lib/demo/countries";
import { getGraphDesk } from "@/lib/demo/graph";
import { getRegionHub, regionHubs } from "@/lib/demo/regions";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return regionHubs().map((hub) => ({ slug: hub.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hub = getRegionHub(slug);
  if (!hub) return {};
  return {
    title: hub.label,
    description: hub.lede,
    alternates: { canonical: `${site.url}/regions/${hub.slug}` },
  };
}

export default async function RegionHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hub = getRegionHub(slug);
  if (!hub) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/regions", label: "Regions" },
        { label: hub.label },
      ]}
      kicker="Region"
      title={hub.label}
      lede={hub.lede}
    >
      <section>
        <h2 className="font-serif text-2xl">Graph desks</h2>
        {hub.deskSlugs.length === 0 ? (
          <p className="mt-3 text-sm text-ink-soft">No graph desk yet for this region.</p>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {hub.deskSlugs.map((deskSlug) => {
              const desk = getGraphDesk(deskSlug);
              return (
                <li key={deskSlug}>
                  <Link
                    href={`/graph/${deskSlug}`}
                    className="block border border-rule px-4 py-3 hover:border-gold"
                  >
                    <p className="font-serif text-xl">{desk?.label ?? deskSlug}</p>
                    <p className="mt-1 text-sm text-ink-soft">{desk?.lede}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Country terminals</h2>
        <ul className="mt-4 columns-2 gap-x-8 text-sm sm:columns-3">
          {hub.countrySlugs.map((countrySlug) => {
            const country = getCountry(countrySlug);
            return (
              <li key={countrySlug} className="mb-2 break-inside-avoid">
                <Link href={`/countries/${countrySlug}`} className="text-forest underline underline-offset-2">
                  {country?.name ?? countrySlug}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Provenance source={`${hub.label} index`} methodology="No regional scoreboard. Empty cells stay empty." />
    </LayerPage>
  );
}
