import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { precisionSlots, storedPrecisionCount } from "@/lib/demo/precision";

export const metadata: Metadata = {
  title: "Precision",
  description: "Precision shapes for Afronomics Feed. No fineness is stored.",
};

export default function PrecisionPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Precision" }]}
      kicker="Precision"
      title="How fine a print would be"
      lede="A slot stays empty until a publisher and a unit exist. This page does not store a sample decimal."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{precisionSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedPrecisionCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
        {" · "}
        <Link href="/units" className="text-forest underline underline-offset-2">
          Units
        </Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {precisionSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Precision shapes" methodology="Stored count is zero. No fineness is attached." />
    </LayerPage>
  );
}
