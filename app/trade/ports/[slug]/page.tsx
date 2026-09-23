import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { EmptyMetric } from "@/components/ui/EmptyMetric";
import { Provenance } from "@/components/ui/Provenance";
import { cityForPort } from "@/lib/demo/cities";
import { getCountry } from "@/lib/demo/countries";
import { getCorridor, getPort, ports, portsForCountry } from "@/lib/demo/trade";
import { site } from "@/lib/site";

export function generateStaticParams() {
  return ports.map((port) => ({ slug: port.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const port = getPort(slug);
  if (!port) return {};
  const country = getCountry(port.countrySlug);
  return {
    title: `${port.name} port`,
    description: `${port.name} (${country?.name}). Throughput and dwell unpublished until sourced.`,
    alternates: { canonical: `${site.url}/trade/ports/${port.slug}` },
  };
}

export default async function PortPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const port = getPort(slug);
  if (!port) notFound();
  const country = getCountry(port.countrySlug);
  if (!country) notFound();
  const corridor = port.corridorSlug ? getCorridor(port.corridorSlug) : undefined;
  const peers = portsForCountry(country.slug).filter((item) => item.slug !== port.slug);
  const city = cityForPort(port.slug);

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/trade", label: "Trade" },
        { href: "/trade/ports", label: "Ports" },
        { label: port.name },
      ]}
      kicker={`Port · ${country.iso}`}
      title={`${port.name}`}
      lede={`${port.waters}. ${country.name}. Dwell, throughput and berth occupancy stay blank until a port-authority or licensed series is stored.`}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <EmptyMetric label="Throughput" />
        <EmptyMetric label="Average dwell" />
        <EmptyMetric label="Active disruptions" />
      </div>
      <p className="mt-8 text-sm">
        <Link href={`/economy/${country.slug}`} className="text-forest underline underline-offset-2">
          {country.name} economy
        </Link>
        {" · "}
        <Link href={`/countries/${country.slug}/trade`} className="text-forest underline underline-offset-2">
          trade series
        </Link>
        {corridor ? (
          <>
            {" · "}
            <Link href={`/trade/${corridor.slug}/${country.slug}`} className="text-forest underline underline-offset-2">
              {corridor.name}
            </Link>
          </>
        ) : null}
        {city ? (
          <>
            {" · "}
            <Link href={`/cities/${city.slug}`} className="text-forest underline underline-offset-2">
              {city.name}
            </Link>
          </>
        ) : null}
      </p>
      {peers.length > 0 ? (
        <ul className="mt-6 flex flex-wrap gap-3 text-sm">
          {peers.map((item) => (
            <li key={item.slug}>
              <Link href={`/trade/ports/${item.slug}`} className="text-forest underline underline-offset-2">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <Provenance source="Port geography is editorial" methodology="No invented TEU, dwell hours or berth occupancy." />
    </LayerPage>
  );
}
