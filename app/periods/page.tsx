import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { periodSlots, storedPeriodCount } from "@/lib/demo/periods";

export const metadata: Metadata = {
  title: "Periods",
  description: "Period words for Afronomics Feed. No window is stored.",
};

export default function PeriodsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Periods" }]}
      kicker="Periods"
      title="What a window would name"
      lede="These are words a series file would use. This page does not store a start date or a sample window."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Vocabulary</p>
          <p className="mt-1 font-serif text-xl">{periodSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedPeriodCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/frequencies" className="text-forest underline underline-offset-2">
          Frequencies
        </Link>
        {" · "}
        <Link href="/releases" className="text-forest underline underline-offset-2">
          Releases
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {periodSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Period words" methodology="Stored count is zero. No window is attached." />
    </LayerPage>
  );
}
