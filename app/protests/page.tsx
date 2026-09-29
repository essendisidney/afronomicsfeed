import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { protestSlots, storedProtestCount } from "@/lib/demo/protests";

export const metadata: Metadata = {
  title: "Protests",
  description: "Protest shapes for Afronomics Feed. No note is stored.",
};

export default function ProtestsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Protests" }]}
      kicker="Protests"
      title="What a protest would note"
      lede="A slot stays empty until a footnote and a lot exist. This page does not store a note."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{protestSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedProtestCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/footnotes" className="text-forest underline underline-offset-2">Footnotes</Link>
        {" · "}
        <Link href="/lots" className="text-forest underline underline-offset-2">Lots</Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">Citations</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {protestSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Protest shapes" methodology="Stored count is zero. No note is attached." />
    </LayerPage>
  );
}
