import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { storedTallyCount, tallySlots } from "@/lib/demo/tallies";

export const metadata: Metadata = {
  title: "Tallies",
  description: "Tally shapes for Afronomics Feed. No count is stored.",
};

export default function TalliesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Tallies" }]}
      kicker="Tallies"
      title="What a tally would count"
      lede="A slot stays empty until a named lot and a citation exist. This page does not store a count."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{tallySlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedTallyCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/lots" className="text-forest underline underline-offset-2">Lots</Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">Observations</Link>
        {" · "}
        <Link href="/footnotes" className="text-forest underline underline-offset-2">Footnotes</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {tallySlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Tally shapes" methodology="Stored count is zero. No count is attached." />
    </LayerPage>
  );
}
