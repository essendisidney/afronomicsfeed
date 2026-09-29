import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { storedStowageCount, stowageSlots } from "@/lib/demo/stowage";

export const metadata: Metadata = {
  title: "Stowage",
  description: "Stowage shapes for Afronomics Feed. No placement is stored.",
};

export default function StowagePage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Stowage" }]}
      kicker="Stowage"
      title="What stowage would place"
      lede="A slot stays empty until a corridor file and a warehouse exist. This page does not store a placement."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{stowageSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedStowageCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/trade" className="text-forest underline underline-offset-2">Trade</Link>
        {" · "}
        <Link href="/warehouses" className="text-forest underline underline-offset-2">Warehouses</Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">Observations</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {stowageSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Stowage shapes" methodology="Stored count is zero. No placement is attached." />
    </LayerPage>
  );
}
