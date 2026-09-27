import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { observationSlots, storedObservationCount } from "@/lib/demo/observations";

export const metadata: Metadata = {
  title: "Observations",
  description: "Observation shapes for Afronomics Feed. No dated print is stored.",
};

export default function ObservationsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Observations" }]}
      kicker="Observations"
      title="What one print would carry"
      lede="A slot stays empty until a source, a unit and an as-of date exist. This page does not store a sample observation."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{observationSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedObservationCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">
          Citations
        </Link>
        {" · "}
        <Link href="/units" className="text-forest underline underline-offset-2">
          Units
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {observationSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Observation shapes" methodology="Stored count is zero. No dated print is attached." />
    </LayerPage>
  );
}
