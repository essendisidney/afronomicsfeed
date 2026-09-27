import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { gapSlots, recordedGapCount } from "@/lib/demo/gaps";

export const metadata: Metadata = {
  title: "Gaps",
  description: "Gap shapes for Afronomics Feed. No missing print is recorded.",
};

export default function GapsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Gaps" }]}
      kicker="Gaps"
      title="What a missing print would mark"
      lede="A slot stays empty until a series and a missing date exist. This page does not store a sample gap."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{gapSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Recorded</p>
          <p className="mt-1 font-serif text-xl">{recordedGapCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
        {" · "}
        <Link href="/frequencies" className="text-forest underline underline-offset-2">
          Frequencies
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {gapSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Gap shapes" methodology="Recorded count is zero. No missing date is attached." />
    </LayerPage>
  );
}
