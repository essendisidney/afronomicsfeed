import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { scaleSlots, storedScaleCount } from "@/lib/demo/scales";

export const metadata: Metadata = {
  title: "Scales",
  description: "Scale words for Afronomics Feed. No transformed print is stored.",
};

export default function ScalesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Scales" }]}
      kicker="Scales"
      title="How a print would be drawn"
      lede="These are words a scale file would use. This page does not store a base or a sample transform."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Vocabulary</p>
          <p className="mt-1 font-serif text-xl">{scaleSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedScaleCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/units" className="text-forest underline underline-offset-2">
          Units
        </Link>
        {" · "}
        <Link href="/baselines" className="text-forest underline underline-offset-2">
          Baselines
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {scaleSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Scale words" methodology="Stored count is zero. No transform is attached." />
    </LayerPage>
  );
}
