import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { berthSlots, storedBerthCount } from "@/lib/demo/berths";

export const metadata: Metadata = {
  title: "Berths",
  description: "Berth shapes for Afronomics Feed. No call is stored.",
};

export default function BerthsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Berths" }]}
      kicker="Berths"
      title="What a berth would hold"
      lede="A slot stays empty until a corridor file and a citation exist. This page does not store a call."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{berthSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedBerthCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/trade" className="text-forest underline underline-offset-2">Trade</Link>
        {" · "}
        <Link href="/windows" className="text-forest underline underline-offset-2">Windows</Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">Citations</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {berthSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Berth shapes" methodology="Stored count is zero. No call is attached." />
    </LayerPage>
  );
}
