import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { identifierKinds, registeredIdentifierCount, vocabularyIdentifierCount } from "@/lib/demo/identifiers";

export const metadata: Metadata = {
  title: "Identifiers",
  description: "How an Afronomics entity would be keyed. No crosswalk or sample ticker is stored.",
};

export default function IdentifiersPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Identifiers" }]}
      kicker="Identifiers"
      title="How a name would be keyed"
      lede="These are words for codes the desk already uses. This page does not store a crosswalk or a sample ticker."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Vocabulary</p>
          <p className="mt-1 font-serif text-xl">{vocabularyIdentifierCount()}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Registered</p>
          <p className="mt-1 font-serif text-xl">{registeredIdentifierCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/countries" className="text-forest underline underline-offset-2">
          Countries
        </Link>
        {" · "}
        <Link href="/glossary" className="text-forest underline underline-offset-2">
          Glossary
        </Link>
        {" · "}
        <Link href="/units" className="text-forest underline underline-offset-2">
          Units
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {identifierKinds.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Identifier vocabulary" methodology="Registered count is zero. No ticker or code table is attached." />
    </LayerPage>
  );
}
