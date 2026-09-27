import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { lineageSlots, recordedLineageCount } from "@/lib/demo/lineage";

export const metadata: Metadata = {
  title: "Lineage",
  description: "Lineage shapes for Afronomics Feed. No source chain is recorded.",
};

export default function LineagePage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Lineage" }]}
      kicker="Lineage"
      title="What a source chain would hold"
      lede="A slot stays empty until a publisher, a series and a date exist. This page does not store a sample link."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{lineageSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Recorded</p>
          <p className="mt-1 font-serif text-xl">{recordedLineageCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/sources" className="text-forest underline underline-offset-2">
          Sources
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">
          Citations
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {lineageSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Lineage shapes" methodology="Recorded count is zero. No source chain is attached." />
    </LayerPage>
  );
}
