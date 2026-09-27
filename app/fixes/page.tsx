import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { fixSlots, storedFixCount } from "@/lib/demo/fixes";

export const metadata: Metadata = {
  title: "Fixes",
  description: "Fixing shapes for Afronomics Feed. No rate is stored.",
};

export default function FixesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Fixes" }]}
      kicker="Fixes"
      title="What a fixing would cite"
      lede="A slot stays empty until a cited print and a source exist. This page does not store a sample rate."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{fixSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedFixCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/markets" className="text-forest underline underline-offset-2">
          Markets
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
        {fixSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Fixing shapes" methodology="Stored count is zero. No rate is attached." />
    </LayerPage>
  );
}
