import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { inspectionSlots, storedInspectionCount } from "@/lib/demo/inspections";

export const metadata: Metadata = {
  title: "Inspections",
  description: "Inspection shapes for Afronomics Feed. No finding is stored.",
};

export default function InspectionsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Inspections" }]}
      kicker="Inspections"
      title="What an inspection would record"
      lede="A slot stays empty until a named site, a date and a cited finding exist. This page does not store a sample inspection."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{inspectionSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedInspectionCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/releases" className="text-forest underline underline-offset-2">
          Releases
        </Link>
        {" · "}
        <Link href="/footnotes" className="text-forest underline underline-offset-2">
          Footnotes
        </Link>
        {" · "}
        <Link href="/periods" className="text-forest underline underline-offset-2">
          Periods
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {inspectionSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Inspection shapes" methodology="Stored count is zero. No finding is attached." />
    </LayerPage>
  );
}
