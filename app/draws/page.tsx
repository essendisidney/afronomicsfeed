import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { drawSlots, storedDrawCount } from "@/lib/demo/draws";

export const metadata: Metadata = {
  title: "Draws",
  description: "Draw shapes for Afronomics Feed. No selection is stored.",
};

export default function DrawsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Draws" }]}
      kicker="Draws"
      title="What a draw would select"
      lede="A slot stays empty until an observation and a source exist. This page does not store a sample draw."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{drawSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedDrawCount()}</p>
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
        <Link href="/samples" className="text-forest underline underline-offset-2">
          Samples
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {drawSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Draw shapes" methodology="Stored count is zero. No selection is attached." />
    </LayerPage>
  );
}
