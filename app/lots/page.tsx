import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { lotSlots, storedLotCount } from "@/lib/demo/lots";

export const metadata: Metadata = {
  title: "Lots",
  description: "Lot shapes for Afronomics Feed. No lot is stored.",
};

export default function LotsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Lots" }]}
      kicker="Lots"
      title="What a lot would name"
      lede="A slot stays empty until a specification and a source exist. This page does not store a sample lot."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{lotSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedLotCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/baskets" className="text-forest underline underline-offset-2">
          Baskets
        </Link>
        {" · "}
        <Link href="/trade" className="text-forest underline underline-offset-2">
          Trade
        </Link>
        {" · "}
        <Link href="/grades" className="text-forest underline underline-offset-2">
          Grades
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {lotSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Lot shapes" methodology="Stored count is zero. No lot is attached." />
    </LayerPage>
  );
}
