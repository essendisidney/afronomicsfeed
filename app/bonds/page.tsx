import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { bondSlots, storedBondCount } from "@/lib/demo/bonds";

export const metadata: Metadata = {
  title: "Bonds",
  description: "Bond shapes for Afronomics Feed. No amount is stored.",
};

export default function BondsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Bonds" }]}
      kicker="Bonds"
      title="What a bond would secure"
      lede="A slot stays empty until a contract and a period exist. This page does not store an amount."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{bondSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedBondCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/contracts" className="text-forest underline underline-offset-2">Contracts</Link>
        {" · "}
        <Link href="/periods" className="text-forest underline underline-offset-2">Periods</Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">Citations</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {bondSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Bond shapes" methodology="Stored count is zero. No amount is attached." />
    </LayerPage>
  );
}
