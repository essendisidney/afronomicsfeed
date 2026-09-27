import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { indexSlots, storedIndexCount } from "@/lib/demo/indices";

export const metadata: Metadata = {
  title: "Indices",
  description: "Index shapes for Afronomics Feed. No index is stored.",
};

export default function IndicesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Indices" }]}
      kicker="Indices"
      title="What an index would include"
      lede="A slot stays empty until constituents and a source exist. This page does not store a sample index."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{indexSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedIndexCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/markets" className="text-forest underline underline-offset-2">
          Markets
        </Link>
        {" · "}
        <Link href="/baskets" className="text-forest underline underline-offset-2">
          Baskets
        </Link>
        {" · "}
        <Link href="/constituents" className="text-forest underline underline-offset-2">
          Constituents
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {indexSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Index shapes" methodology="Stored count is zero. No index is attached." />
    </LayerPage>
  );
}
