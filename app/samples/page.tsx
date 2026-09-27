import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { sampleSlots, storedSampleCount } from "@/lib/demo/samples";

export const metadata: Metadata = {
  title: "Samples",
  description: "Sample shapes for Afronomics Feed. No draw is stored.",
};

export default function SamplesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Samples" }]}
      kicker="Samples"
      title="What a sample would stand for"
      lede="A slot stays empty until an observation and a source exist. This page does not store a sample draw."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{sampleSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedSampleCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
        {" · "}
        <Link href="/gaps" className="text-forest underline underline-offset-2">
          Gaps
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {sampleSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Sample shapes" methodology="Stored count is zero. No draw is attached." />
    </LayerPage>
  );
}
