import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { storedWarehouseCount, warehouseSlots } from "@/lib/demo/warehouses";

export const metadata: Metadata = {
  title: "Warehouses",
  description: "Warehouse shapes for Afronomics Feed. No stock is stored.",
};

export default function WarehousesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Warehouses" }]}
      kicker="Warehouses"
      title="What a warehouse would hold"
      lede="A slot stays empty until a named site, a lot and a date exist. This page does not store a sample stock figure."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{warehouseSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedWarehouseCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/trade" className="text-forest underline underline-offset-2">
          Trade
        </Link>
        {" · "}
        <Link href="/lots" className="text-forest underline underline-offset-2">
          Lots
        </Link>
        {" · "}
        <Link href="/samples" className="text-forest underline underline-offset-2">
          Samples
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {warehouseSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Warehouse shapes" methodology="Stored count is zero. No stock figure is attached." />
    </LayerPage>
  );
}
