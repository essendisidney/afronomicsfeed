import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { getCountry } from "@/lib/demo/countries";
import { ports } from "@/lib/demo/trade";

export const metadata: Metadata = {
  title: "Ports",
  description: "African port files — dwell, throughput and disruption cells unpublished until sourced.",
};

export default function PortsPage() {
  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/trade", label: "Trade" },
        { label: "Ports" },
      ]}
      kicker="Trade · Ports"
      title="Gateways, not invented volumes"
      lede="Each port file exists so a cited dwell time, berth print or disruption can land. Hours and TEU stay blank until a port authority or licensed series is stored."
    >
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ports.map((port) => {
          const country = getCountry(port.countrySlug);
          return (
            <li key={port.slug}>
              <Link href={`/trade/ports/${port.slug}`} className="block border border-rule px-3 py-3 hover:border-gold">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{country?.iso}</p>
                <p className="mt-1 font-serif text-lg">{port.name}</p>
                <p className="mt-1 text-xs text-muted">
                  {port.waters} · {country?.name}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </LayerPage>
  );
}
