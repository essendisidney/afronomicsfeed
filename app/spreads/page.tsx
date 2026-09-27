import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { spreadSlots, storedSpreadCount } from "@/lib/demo/spreads";

export const metadata: Metadata = {
  title: "Spreads",
  description: "Spread shapes for Afronomics Feed. No gap between prints is stored.",
};

export default function SpreadsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Spreads" }]}
      kicker="Spreads"
      title="What a gap between prints would cite"
      lede="A slot stays empty until two sourced prints, a unit and a date exist. This page does not store a sample spread."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{spreadSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedSpreadCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
        {" · "}
        <Link href="/markets" className="text-forest underline underline-offset-2">
          Markets
        </Link>
        {" · "}
        <Link href="/benchmarks" className="text-forest underline underline-offset-2">
          Benchmarks
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {spreadSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Spread shapes" methodology="Stored count is zero. No gap is attached." />
    </LayerPage>
  );
}
