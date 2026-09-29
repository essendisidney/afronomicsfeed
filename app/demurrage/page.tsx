import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { demurrageSlots, storedDemurrageCount } from "@/lib/demo/demurrage";

export const metadata: Metadata = {
  title: "Demurrage",
  description: "Demurrage shapes for Afronomics Feed. No charge is stored.",
};

export default function DemurragePage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Demurrage" }]}
      kicker="Demurrage"
      title="What demurrage would name"
      lede="A slot stays empty until a period and a citation exist. This page does not store a charge."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{demurrageSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedDemurrageCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/periods" className="text-forest underline underline-offset-2">Periods</Link>
        {" · "}
        <Link href="/notices" className="text-forest underline underline-offset-2">Notices</Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">Citations</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {demurrageSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Demurrage shapes" methodology="Stored count is zero. No charge is attached." />
    </LayerPage>
  );
}
