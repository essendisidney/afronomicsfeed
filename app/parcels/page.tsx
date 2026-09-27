import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { parcelSlots, storedParcelCount } from "@/lib/demo/parcels";

export const metadata: Metadata = {
  title: "Parcels",
  description: "Parcel shapes for Afronomics Feed. No shipment is stored.",
};

export default function ParcelsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Parcels" }]}
      kicker="Parcels"
      title="What a parcel would carry"
      lede="A slot stays empty until a movement and a source exist. This page does not store a sample parcel."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{parcelSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedParcelCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/trade" className="text-forest underline underline-offset-2">
          Trade
        </Link>
        {" · "}
        <Link href="/customs" className="text-forest underline underline-offset-2">
          Customs
        </Link>
        {" · "}
        <Link href="/corridors" className="text-forest underline underline-offset-2">
          Corridors
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {parcelSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Parcel shapes" methodology="Stored count is zero. No shipment is attached." />
    </LayerPage>
  );
}
