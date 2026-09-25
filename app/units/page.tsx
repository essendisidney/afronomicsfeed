import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { observationUnits, vocabularyUnitCount } from "@/lib/demo/units";

export const metadata: Metadata = {
  title: "Units",
  description: "Observation unit vocabulary for Afronomics Feed. No series is stored on this page.",
};

export default function UnitsPage() {
  const vocabulary = vocabularyUnitCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Units" }]}
      kicker="Units"
      title="How a number would be named"
      lede="These are words, not a database. A blank cell stays blank. This page does not store a rate, an index, or a physical series."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Units</p>
          <p className="mt-1 font-serif text-xl">{observationUnits.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Vocabulary</p>
          <p className="mt-1 font-serif text-xl">{vocabulary}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/glossary" className="text-forest underline underline-offset-2">
          Glossary
        </Link>
        {" · "}
        <Link href="/sources" className="text-forest underline underline-offset-2">
          Sources
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {observationUnits.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <p className="mt-1 font-serif text-xl">{item.label}</p>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Unit vocabulary" methodology="No observation is attached to a unit on this page." />
    </LayerPage>
  );
}
