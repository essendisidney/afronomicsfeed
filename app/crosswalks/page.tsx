import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { crosswalkSlots, storedCrosswalkCount } from "@/lib/demo/crosswalks";

export const metadata: Metadata = {
  title: "Crosswalks",
  description: "Crosswalk shapes for Afronomics Feed. No code map is stored.",
};

export default function CrosswalksPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Crosswalks" }]}
      kicker="Crosswalks"
      title="How two code lists would meet"
      lede="A slot stays empty until two cited lists and a publisher exist. This page does not store a sample map."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{crosswalkSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedCrosswalkCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/classifications" className="text-forest underline underline-offset-2">
          Classifications
        </Link>
        {" · "}
        <Link href="/regions" className="text-forest underline underline-offset-2">
          Regions
        </Link>
        {" · "}
        <Link href="/corridors" className="text-forest underline underline-offset-2">
          Corridors
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {crosswalkSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Crosswalk shapes" methodology="Stored count is zero. No map is attached." />
    </LayerPage>
  );
}
