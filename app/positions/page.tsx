import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { positionSlots, storedPositionCount } from "@/lib/demo/positions";

export const metadata: Metadata = {
  title: "Positions",
  description: "Position shapes for Afronomics Feed. No holding is stored.",
};

export default function PositionsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Positions" }]}
      kicker="Positions"
      title="What a position would hold"
      lede="A slot stays empty until a cited holding and a source exist. This page does not store a sample position."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{positionSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedPositionCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/markets" className="text-forest underline underline-offset-2">
          Markets
        </Link>
        {" · "}
        <Link href="/lots" className="text-forest underline underline-offset-2">
          Lots
        </Link>
        {" · "}
        <Link href="/curves" className="text-forest underline underline-offset-2">
          Curves
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {positionSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Position shapes" methodology="Stored count is zero. No holding is attached." />
    </LayerPage>
  );
}
