import type { Metadata } from "next";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { ResolvePanel } from "@/components/graph/ResolvePanel";
import { Provenance } from "@/components/ui/Provenance";
import { knownEntityCatalog } from "@/lib/ingestion/entity-resolution";

export const metadata: Metadata = {
  title: "Entity resolution",
  description: "Resolve a name against the Afronomics graph. Unknown names stay unresolved.",
};

export default function GraphResolvePage() {
  const catalog = knownEntityCatalog();

  return (
    <LayerPage
      crumbs={[
        { href: "/", label: "Home" },
        { href: "/graph", label: "Graph" },
        { label: "Resolve" },
      ]}
      kicker="Entity resolution"
      title="Match a name, or refuse"
      lede="The resolver only returns nodes already on the Kenya desk graph. It does not create entities."
    >
      <ResolvePanel />
      <section className="mt-12">
        <h2 className="font-serif text-2xl">Known catalog</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.map((item) => (
            <li key={item.id} className="border border-rule px-3 py-2 text-sm">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.kind}</p>
              <p className="mt-1 font-serif text-lg">{item.label}</p>
            </li>
          ))}
        </ul>
      </section>
      <Provenance source="In-memory Kenya catalog" methodology="No upsert. Unknown names return confidence none." />
    </LayerPage>
  );
}
