import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { corridors } from "@/lib/demo/trade";

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
      lede="Imports, exports, partners, commodities, AfCFTA, logistics and FX. Corridor pages exist so the graph has somewhere to land a disruption or a rail print."
    >
      <ul className="grid gap-4 lg:grid-cols-2">
        {corridors.map((corridor) => (
          <li key={corridor.slug} className="border border-rule p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">Corridor</p>
            <h2 className="mt-2 font-serif text-2xl">
              <Link href={`/trade/${corridor.slug}`} className="hover:text-forest">
                {corridor.name}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{corridor.geography}</p>
            <p className="mt-2 text-xs text-muted">{corridor.modes.join(" · ")}</p>
          </li>
        ))}
      </ul>
    </LayerPage>
  );
}
