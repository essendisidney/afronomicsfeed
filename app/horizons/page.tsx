import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { horizonSlots, storedHorizonCount } from "@/lib/demo/horizons";

export const metadata: Metadata = {
  title: "Horizons",
  description: "Horizon words for Afronomics Feed. No forecast is stored.",
};

export default function HorizonsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Horizons" }]}
      kicker="Horizons"
      title="How far a note would look"
      lede="These are words a forecast file would use. This page does not store a window or a sample forecast."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Vocabulary</p>
          <p className="mt-1 font-serif text-xl">{horizonSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedHorizonCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/periods" className="text-forest underline underline-offset-2">
          Periods
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
        {" · "}
        <Link href="/benchmarks" className="text-forest underline underline-offset-2">
          Benchmarks
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {horizonSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Horizon words" methodology="Stored count is zero. No forecast is attached." />
    </LayerPage>
  );
}
