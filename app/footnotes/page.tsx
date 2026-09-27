import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { footnoteSlots, storedFootnoteCount } from "@/lib/demo/footnotes";

export const metadata: Metadata = {
  title: "Footnotes",
  description: "Footnote shapes for Afronomics Feed. No caveat is stored.",
};

export default function FootnotesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Footnotes" }]}
      kicker="Footnotes"
      title="What a caveat would cite"
      lede="A slot stays empty until a publisher and a citation exist. This page does not store a sample note."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{footnoteSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedFootnoteCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/lineage" className="text-forest underline underline-offset-2">
          Lineage
        </Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">
          Citations
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {footnoteSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Footnote shapes" methodology="Stored count is zero. No caveat is attached." />
    </LayerPage>
  );
}
