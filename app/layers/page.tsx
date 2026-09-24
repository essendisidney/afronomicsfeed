import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { intelligenceLayers, layersByState } from "@/lib/demo/layers";

export const metadata: Metadata = {
  title: "Layers",
  description: "NEWS → DATA → CONTEXT → SIGNALS → DECISIONS on Afronomics. Honest live / scaffold / offline status.",
};

export default function LayersPage() {
  const live = layersByState("live").length;
  const scaffold = layersByState("scaffold").length;
  const offline = layersByState("offline").length;

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Layers" }]}
      kicker="Intelligence layers"
      title="News to decisions"
      lede="The product path is NEWS → DATA → CONTEXT → SIGNALS → DECISIONS. Status is honest: live means it ships, scaffold means shape without a store, offline means Auth or delivery is dark."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Live</p>
          <p className="mt-1 font-serif text-xl">{live}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Scaffold</p>
          <p className="mt-1 font-serif text-xl">{scaffold}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Offline</p>
          <p className="mt-1 font-serif text-xl">{offline}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/coverage" className="text-forest underline underline-offset-2">
          Coverage
        </Link>
        {" · "}
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
        {" · "}
        <Link href="/onboarding" className="text-forest underline underline-offset-2">
          Onboarding
        </Link>
        {" · "}
        <Link href="/glossary" className="text-forest underline underline-offset-2">
          Glossary
        </Link>
      </p>

      <ol className="mt-10 list-none space-y-4">
        {intelligenceLayers.map((layer) => (
          <li key={layer.slug} className="border-b border-rule pb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {layer.order} · {layer.state}
            </p>
            <p className="mt-1 font-serif text-2xl">{layer.label}</p>
            <p className="mt-2 text-sm text-ink-soft">{layer.lede}</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {layer.hrefs.map((href) => (
                <li key={href}>
                  <Link href={href} className="text-forest underline underline-offset-2">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>

      <Provenance source="Product layer map" methodology="No layer invents a green light for a dark store." />
    </LayerPage>
  );
}
