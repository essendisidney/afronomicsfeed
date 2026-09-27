import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { baselineSlots, storedBaselineCount } from "@/lib/demo/baselines";

export const metadata: Metadata = {
  title: "Baselines",
  description: "Baseline shapes for Afronomics Feed. No starting print is stored.",
};

export default function BaselinesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Baselines" }]}
      kicker="Baselines"
      title="What a starting print would cite"
      lede="A slot stays empty until a source, a unit and a date exist. This page does not store a sample baseline."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{baselineSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedBaselineCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/benchmarks" className="text-forest underline underline-offset-2">
          Benchmarks
        </Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {baselineSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Baseline shapes" methodology="Stored count is zero. No starting print is attached." />
    </LayerPage>
  );
}
