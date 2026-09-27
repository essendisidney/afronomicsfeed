import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { adjustmentSlots, storedAdjustmentCount } from "@/lib/demo/adjustments";

export const metadata: Metadata = {
  title: "Adjustments",
  description: "Adjustment shapes for Afronomics Feed. No factor is stored.",
};

export default function AdjustmentsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Adjustments" }]}
      kicker="Adjustments"
      title="What a change of method would cite"
      lede="A slot stays empty until a publisher, a method and a date exist. This page does not store a sample factor."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{adjustmentSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedAdjustmentCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/seasons" className="text-forest underline underline-offset-2">
          Seasons
        </Link>
        {" · "}
        <Link href="/baselines" className="text-forest underline underline-offset-2">
          Baselines
        </Link>
        {" · "}
        <Link href="/revisions" className="text-forest underline underline-offset-2">
          Revisions
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {adjustmentSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Adjustment shapes" methodology="Stored count is zero. No factor is attached." />
    </LayerPage>
  );
}
