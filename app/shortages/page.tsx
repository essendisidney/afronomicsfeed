import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { shortageSlots, storedShortageCount } from "@/lib/demo/shortages";

export const metadata: Metadata = {
  title: "Shortages",
  description: "Shortage shapes for Afronomics Feed. No gap is stored.",
};

export default function ShortagesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Shortages" }]}
      kicker="Shortages"
      title="What a shortage would record"
      lede="A slot stays empty until a gap file and a lot exist. This page does not store a quantity."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{shortageSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedShortageCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/gaps" className="text-forest underline underline-offset-2">Gaps</Link>
        {" · "}
        <Link href="/lots" className="text-forest underline underline-offset-2">Lots</Link>
        {" · "}
        <Link href="/footnotes" className="text-forest underline underline-offset-2">Footnotes</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {shortageSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Shortage shapes" methodology="Stored count is zero. No quantity is attached." />
    </LayerPage>
  );
}
