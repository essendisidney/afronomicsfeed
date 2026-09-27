import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { aliasSlots, storedAliasCount } from "@/lib/demo/aliases";

export const metadata: Metadata = {
  title: "Aliases",
  description: "Alias shapes for Afronomics Feed. No other name is stored.",
};

export default function AliasesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Aliases" }]}
      kicker="Aliases"
      title="What else a thing would be called"
      lede="A slot stays empty until a source and a cited name exist. This page does not store a sample alias."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{aliasSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedAliasCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/cities" className="text-forest underline underline-offset-2">
          Cities
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
        {" · "}
        <Link href="/identifiers" className="text-forest underline underline-offset-2">
          Identifiers
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {aliasSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Alias shapes" methodology="Stored count is zero. No other name is attached." />
    </LayerPage>
  );
}
