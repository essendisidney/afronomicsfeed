import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { postedVintageCount, vintageSlots } from "@/lib/demo/vintages";

export const metadata: Metadata = {
  title: "Vintages",
  description: "Vintage shapes for Afronomics Feed. No restatement is posted.",
};

export default function VintagesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Vintages" }]}
      kicker="Vintages"
      title="What a restatement would carry"
      lede="A slot stays empty until a source, a prior figure and a date exist. This page does not store a sample vintage."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{vintageSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Posted</p>
          <p className="mt-1 font-serif text-xl">{postedVintageCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/revisions" className="text-forest underline underline-offset-2">
          Revisions
        </Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
        {" · "}
        <Link href="/releases" className="text-forest underline underline-offset-2">
          Releases
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {vintageSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Vintage shapes" methodology="Posted count is zero. No restatement is attached." />
    </LayerPage>
  );
}
