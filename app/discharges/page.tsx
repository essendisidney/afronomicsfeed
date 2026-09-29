import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { dischargeSlots, storedDischargeCount } from "@/lib/demo/discharges";

export const metadata: Metadata = {
  title: "Discharges",
  description: "Discharge shapes for Afronomics Feed. No quantity is stored.",
};

export default function DischargesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Discharges" }]}
      kicker="Discharges"
      title="What a discharge would record"
      lede="A slot stays empty until a lot and a warehouse exist. This page does not store a quantity."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{dischargeSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedDischargeCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/lots" className="text-forest underline underline-offset-2">Lots</Link>
        {" · "}
        <Link href="/warehouses" className="text-forest underline underline-offset-2">Warehouses</Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">Observations</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {dischargeSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Discharge shapes" methodology="Stored count is zero. No quantity is attached." />
    </LayerPage>
  );
}
