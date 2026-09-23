import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { coverageRows } from "@/lib/demo/coverage";

export const metadata: Metadata = {
  title: "Coverage",
  description: "Honest coverage board for Afronomics. Numerators stay low until observations are cited.",
};

export default function CoveragePage() {
  const rows = coverageRows();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Coverage" }]}
      kicker="Coverage"
      title="What the desk has filed"
      lede="Counts of shells and linked doors — not a vanity completion score. Empty observation cells still do not invent prints."
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <li key={row.id} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {row.covered} / {row.total}
            </p>
            <Link href={row.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {row.label}
            </Link>
            <p className="mt-2 text-sm text-ink-soft">{row.note}</p>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm">
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
        {" · "}
        <Link href="/compare" className="text-forest underline underline-offset-2">
          Compare
        </Link>
        {" · "}
        <Link href="/glossary" className="text-forest underline underline-offset-2">
          Glossary
        </Link>
        {" · "}
        <Link href="/changelog" className="text-forest underline underline-offset-2">
          Changelog
        </Link>
      </p>

      <Provenance source="Scaffold inventory" methodology="No synthetic percent-complete. Empty cells stay empty." />
    </LayerPage>
  );
}
