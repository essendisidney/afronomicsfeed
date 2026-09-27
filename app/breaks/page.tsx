import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { breakSlots, storedBreakCount } from "@/lib/demo/breaks";

export const metadata: Metadata = {
  title: "Breaks",
  description: "Break shapes for Afronomics Feed. No series split is stored.",
};

export default function BreaksPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Breaks" }]}
      kicker="Breaks"
      title="Where a series would split"
      lede="A slot stays empty until a method change and a source exist. This page does not store a sample break."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{breakSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedBreakCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
        {" · "}
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/baselines" className="text-forest underline underline-offset-2">
          Baselines
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {breakSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Break shapes" methodology="Stored count is zero. No series split is attached." />
    </LayerPage>
  );
}
