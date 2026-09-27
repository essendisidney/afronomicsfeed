import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { storedModeCount, transportModes, vocabularyModeCount } from "@/lib/demo/modes";

export const metadata: Metadata = {
  title: "Modes",
  description: "Transport mode words for Afronomics Feed. No tonnage is stored.",
};

export default function ModesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Modes" }]}
      kicker="Modes"
      title="How a route would move"
      lede="These are words the corridor files already use. This page does not store a tonnage or a dwell."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Vocabulary</p>
          <p className="mt-1 font-serif text-xl">{vocabularyModeCount()}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedModeCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/corridors" className="text-forest underline underline-offset-2">
          Corridors
        </Link>
        {" · "}
        <Link href="/trade" className="text-forest underline underline-offset-2">
          Trade
        </Link>
        {" · "}
        <Link href="/units" className="text-forest underline underline-offset-2">
          Units
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {transportModes.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Mode vocabulary" methodology="Stored count is zero. No tonnage is attached." />
    </LayerPage>
  );
}
