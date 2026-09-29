import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { storedWaybillCount, waybillSlots } from "@/lib/demo/waybills";

export const metadata: Metadata = {
  title: "Waybills",
  description: "Waybill shapes for Afronomics Feed. No carriage document is stored.",
};

export default function WaybillsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Waybills" }]}
      kicker="Waybills"
      title="What a waybill would carry"
      lede="A slot stays empty until a named carrier, a corridor and a cited handover exist. This page does not store a sample waybill."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{waybillSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedWaybillCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/releases" className="text-forest underline underline-offset-2">
          Releases
        </Link>
        {" · "}
        <Link href="/trade" className="text-forest underline underline-offset-2">
          Trade
        </Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">
          Citations
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {waybillSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Waybill shapes" methodology="Stored count is zero. No carriage document is attached." />
    </LayerPage>
  );
}
