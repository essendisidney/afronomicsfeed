import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { settlementSlots, storedSettlementCount } from "@/lib/demo/settlements";

export const metadata: Metadata = {
  title: "Settlements",
  description: "Settlement shapes for Afronomics Feed. No movement is stored.",
};

export default function SettlementsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Settlements" }]}
      kicker="Settlements"
      title="What a settlement would clear"
      lede="A slot stays empty until a cited movement and a source exist. This page does not store a sample settlement."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{settlementSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedSettlementCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/markets" className="text-forest underline underline-offset-2">
          Markets
        </Link>
        {" · "}
        <Link href="/contracts" className="text-forest underline underline-offset-2">
          Contracts
        </Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {settlementSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Settlement shapes" methodology="Stored count is zero. No movement is attached." />
    </LayerPage>
  );
}
