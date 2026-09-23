import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { getCountry } from "@/lib/demo/countries";
import { corridors, ports, tradeRegimes } from "@/lib/demo/trade";

export const metadata: Metadata = {
  title: "Trade",
  description: "African trade corridors, ports, AfCFTA and FX constraints — volumes unpublished until sourced.",
};

export default function TradePage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Trade" }]}
      kicker="Afronomics Trade"
      title="Corridors, ports and the constraints between them"
      lede="Imports, exports, partners, commodities, AfCFTA, logistics and FX. Corridor and port files exist so the graph has somewhere to land a disruption or a rail print."
    >
      <p className="mb-8 text-sm">
        <Link href="/graph/northern-corridor" className="text-forest underline underline-offset-2">
          Northern Corridor graph desk
        </Link>
        {" · "}
        <Link href="/graph/central-corridor" className="text-forest underline underline-offset-2">
          Central Corridor graph desk
        </Link>
        {" · "}
        <Link href="/graph/lobito-corridor" className="text-forest underline underline-offset-2">
          Lobito Corridor graph desk
        </Link>
        {" · "}
        <Link href="/calendar" className="text-forest underline underline-offset-2">
          Calendar
        </Link>
        {" · "}
        <Link href="/compare" className="text-forest underline underline-offset-2">
          Compare desks
        </Link>
        {" · "}
        <Link href="/sources" className="text-forest underline underline-offset-2">
          Sources
        </Link>
      </p>
      <section>
        <h2 className="font-serif text-2xl">Corridors</h2>
        <ul className="mt-4 grid gap-4 lg:grid-cols-2">
          {corridors.map((corridor) => (
            <li key={corridor.slug} className="border border-rule p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">Corridor</p>
              <h3 className="mt-2 font-serif text-2xl">
                <Link href={`/trade/${corridor.slug}`} className="hover:text-forest">
                  {corridor.name}
                </Link>
              </h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{corridor.geography}</p>
              <p className="mt-2 text-xs text-muted">{corridor.modes.join(" · ")}</p>
              <p className="mt-3 text-xs text-muted">{corridor.countrySlugs.length} country files</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">
          <Link href="/trade/ports" className="hover:text-forest">
            Ports
          </Link>
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {ports.map((port) => {
            const country = getCountry(port.countrySlug);
            return (
              <li key={port.slug}>
                <Link href={`/trade/ports/${port.slug}`} className="block border border-rule px-3 py-3 hover:border-gold">
                  <p className="font-serif text-lg">{port.name}</p>
                  <p className="mt-1 text-xs text-muted">{country?.name}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl">Regimes</h2>
        <ul className="mt-4 space-y-3">
          {tradeRegimes.map((regime) => (
            <li key={regime.slug} className="border border-rule p-5">
              <h3 className="font-serif text-2xl">
                <Link href={`/trade/regimes/${regime.slug}`} className="hover:text-forest">
                  {regime.name}
                </Link>
              </h3>
              <p className="mt-2 text-sm text-ink-soft">{regime.lede}</p>
            </li>
          ))}
        </ul>
      </section>
    </LayerPage>
  );
}
