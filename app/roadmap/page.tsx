import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { roadmapByLane, roadmapItems } from "@/lib/demo/roadmap";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Public product roadmap for Afronomics. Scaffold and blocked stay honest — no invented ship dates.",
};

export default function RoadmapPage() {
  const items = roadmapItems();
  const shipped = roadmapByLane("shipped").length;
  const scaffold = roadmapByLane("scaffold").length;
  const blocked = roadmapByLane("blocked").length;

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Roadmap" }]}
      kicker="Roadmap"
      title="What shipped, what scaffolds, what blocks"
      lede="Derived from the product changelog and go-live gates. Scaffold means the shell exists. Blocked means official prints cannot land yet. No calendar invents a dark-store ship date."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shipped</p>
          <p className="mt-1 font-serif text-xl">{shipped}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Scaffold</p>
          <p className="mt-1 font-serif text-xl">{scaffold}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Blocked</p>
          <p className="mt-1 font-serif text-xl">{blocked}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/changelog" className="text-forest underline underline-offset-2">
          Changelog
        </Link>
        {" · "}
        <Link href="/golive" className="text-forest underline underline-offset-2">
          Go live
        </Link>
        {" · "}
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
        {" · "}
        <Link href="/coverage" className="text-forest underline underline-offset-2">
          Coverage
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {items.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.lane}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance
        source="Changelog + go-live gates"
        methodology="No roadmap row invents a ship date for a blocked store."
      />
    </LayerPage>
  );
}
