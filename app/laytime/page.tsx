import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { laytimeSlots, storedLaytimeCount } from "@/lib/demo/laytime";

export const metadata: Metadata = {
  title: "Laytime",
  description: "Laytime shapes for Afronomics Feed. No allowance is stored.",
};

export default function LaytimePage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Laytime" }]}
      kicker="Laytime"
      title="What laytime would allow"
      lede="A slot stays empty until a period and a cutoff exist. This page does not store an allowance."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{laytimeSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedLaytimeCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/periods" className="text-forest underline underline-offset-2">Periods</Link>
        {" · "}
        <Link href="/cutoffs" className="text-forest underline underline-offset-2">Cutoffs</Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">Observations</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {laytimeSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Laytime shapes" methodology="Stored count is zero. No allowance is attached." />
    </LayerPage>
  );
}
