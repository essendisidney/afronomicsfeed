import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { handoverSlots, storedHandoverCount } from "@/lib/demo/handovers";

export const metadata: Metadata = {
  title: "Handovers",
  description: "Handover shapes for Afronomics Feed. No pass is stored.",
};

export default function HandoversPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Handovers" }]}
      kicker="Handovers"
      title="What a handover would pass"
      lede="A slot stays empty until a contract and a release exist. This page does not store a pass."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{handoverSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedHandoverCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/contracts" className="text-forest underline underline-offset-2">Contracts</Link>
        {" · "}
        <Link href="/releases" className="text-forest underline underline-offset-2">Releases</Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">Citations</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {handoverSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Handover shapes" methodology="Stored count is zero. No pass is attached." />
    </LayerPage>
  );
}
