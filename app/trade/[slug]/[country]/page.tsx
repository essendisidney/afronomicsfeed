import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { getCountry } from "@/lib/demo/countries";
import {
  corridorCountryParams,
  corridors,
  getCorridor,
  portsForCorridor,
  portsForCountry,
} from "@/lib/demo/trade";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return corridorCountryParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; country: string }>;
}): Promise<Metadata> {
  const { slug, country: countrySlug } = await params;
  const corridor = getCorridor(slug);
  const country = getCountry(countrySlug);
  if (!corridor || !country) return {};
  return {
    title: `${country.name} on ${corridor.name}`,
    description: `${country.name} cell on ${corridor.name}. Volumes unpublished until sourced.`,
    alternates: { canonical: `${site.url}/trade/${corridor.slug}/${country.slug}` },
  };
}

export default async function CorridorCountryPage({
  params,
}: {
  params: Promise<{ slug: string; country: string }>;
}) {
  const { slug, country: countrySlug } = await params;
  const corridor = getCorridor(slug);
  const country = getCountry(countrySlug);
  if (!corridor || !country) notFound();
  if (!(corridor.countrySlugs as readonly string[]).includes(country.slug)) notFound();

  const ports = portsForCountry(country.slug).filter(
    (port) => !port.corridorSlug || port.corridorSlug === corridor.slug,
  );
  const corridorPorts = portsForCorridor(corridor.slug);
  const peers = corridor.countrySlugs.filter((item) => item !== country.slug);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/trade", label: "Trade" },
        { href: `/trade/${corridor.slug}`, label: corridor.name },
        { label: country.name },
      ]}
      kicker={`${corridor.name} · ${country.iso}`}
      title={`${country.name} on ${corridor.name}`}
      lede={`${corridor.geography}. This state cell is empty until a cited customs, rail or port print exists.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Throughput" note={corridor.note} />
        <EmptyMetric label="Border dwell" />
        <EmptyMetric label="Disruptions" />
      </div>
      {ports.length > 0 ? (
        <p className="mt-8 text-sm">
          Ports on file:{" "}
          {ports.map((port, index) => (
            <span key={port.slug}>
              {index > 0 ? " · " : null}
              <Link href={`/trade/ports/${port.slug}`} className="text-forest underline underline-offset-2">
                {port.name}
              </Link>
            </span>
          ))}
        </p>
      ) : corridorPorts.length > 0 ? (
        <p className="mt-8 text-sm text-ink-soft">
          Corridor gateway:{" "}
          <Link href={`/trade/ports/${corridorPorts[0].slug}`} className="text-forest underline underline-offset-2">
            {corridorPorts[0].name}
          </Link>
        </p>
      ) : null}
      <p className="mt-4 text-sm">
        <Link href={`/economy/${country.slug}`} className="text-forest underline underline-offset-2">
          {country.name} economy
        </Link>
        {" · "}
        <Link href={`/countries/${country.slug}/trade`} className="text-forest underline underline-offset-2">
          trade series
        </Link>
        {" · "}
        <Link href={`/projects/${country.slug}`} className="text-forest underline underline-offset-2">
          Project Lens
        </Link>
      </p>
      <ul className="mt-6 flex flex-wrap gap-3 text-sm">
        {peers.map((peerSlug) => {
          const peer = getCountry(peerSlug);
          if (!peer) return null;
          return (
            <li key={peerSlug}>
              <Link href={`/trade/${corridor.slug}/${peer.slug}`} className="text-forest underline underline-offset-2">
                {peer.name}
              </Link>
            </li>
          );
        })}
        {corridors
          .filter((item) => item.slug !== corridor.slug && (item.countrySlugs as readonly string[]).includes(country.slug))
          .map((item) => (
            <li key={item.slug}>
              <Link href={`/trade/${item.slug}/${country.slug}`} className="text-forest underline underline-offset-2">
                {item.name}
              </Link>
            </li>
          ))}
      </ul>
      <Provenance source="Corridor geography is editorial" methodology="No invented throughput on a country cell." />
    </LayerPage>
  );
}
