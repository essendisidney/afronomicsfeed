import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { getCountry } from "@/lib/demo/countries";
import { corridorCountryHref, corridors, getCorridor, portsForCorridor } from "@/lib/demo/trade";

export function generateStaticParams() {
  return corridors.map((corridor) => ({ slug: corridor.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const corridor = getCorridor(slug);
  if (!corridor) return {};
  return {
    title: corridor.name,
    description: `${corridor.name} — ${corridor.geography}. Trade volumes unpublished until sourced.`,
  };
}

export default async function CorridorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const corridor = getCorridor(slug);
  if (!corridor) notFound();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/trade", label: "Trade" },
        { label: corridor.name },
      ]}
      kicker="Trade corridor"
      title={corridor.name}
      lede={corridor.geography}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Trade volume" note={corridor.note} />
        <EmptyMetric label="Port dwell" />
        <EmptyMetric label="Active disruptions" />
      </div>
      <p className="mt-6 text-sm text-ink-soft">Modes on file: {corridor.modes.join(", ")}.</p>
      <section className="mt-8">
        <h2 className="font-serif text-2xl">Country cells</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {corridor.countrySlugs.map((countrySlug) => {
            const country = getCountry(countrySlug);
            if (!country) return null;
            return (
              <li key={countrySlug}>
                <Link
                  href={corridorCountryHref(corridor.slug, country.slug)}
                  className="block border border-rule px-3 py-3 hover:border-gold"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{country.iso}</p>
                  <p className="mt-1 font-serif text-lg">{country.name}</p>
                  <p className="mt-1 text-xs text-muted">No sourced print</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      {portsForCorridor(corridor.slug).length > 0 ? (
        <p className="mt-6 text-sm">
          Ports:{" "}
          {portsForCorridor(corridor.slug).map((port, index) => (
            <span key={port.slug}>
              {index > 0 ? " · " : null}
              <Link href={`/trade/ports/${port.slug}`} className="text-forest underline underline-offset-2">
                {port.name}
              </Link>
            </span>
          ))}
        </p>
      ) : null}
      <Provenance source="Corridor geography is editorial" methodology="No invented throughput" />
    </LayerPage>
  );
}
