import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { graphFileHref } from "@/lib/demo/graph";
import { corridors } from "@/lib/demo/trade";

export const metadata: Metadata = {
  title: "Corridors",
  description: "Named African trade corridors. No volume or dwell series is stored.",
};

export default function CorridorsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Corridors" }]}
      kicker="Corridors"
      title="Named routes, blank flows"
      lede="Each row is a geography the desk already uses. Throughput, dwell and disruption series are not stored."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Routes</p>
          <p className="mt-1 font-serif text-xl">{corridors.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Volumes stored</p>
          <p className="mt-1 font-serif text-xl">0</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/trade" className="text-forest underline underline-offset-2">
          Trade
        </Link>
        {" · "}
        <Link href="/graph" className="text-forest underline underline-offset-2">
          Graph
        </Link>
        {" · "}
        <Link href="/regions" className="text-forest underline underline-offset-2">
          Regions
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {corridors.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">route</p>
            <Link href={`/trade/${item.slug}`} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.name}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.geography}</p>
            <p className="mt-1 text-sm text-ink-soft">{item.note}</p>
            <p className="mt-2 text-sm">
              <Link href={graphFileHref(item.slug)} className="text-forest underline underline-offset-2">
                Graph desk
              </Link>
            </p>
          </li>
        ))}
      </ul>

      <Provenance source="Corridor catalogue" methodology="Route count is the named file. Volume count is zero." />
    </LayerPage>
  );
}
