import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { seriesShapes, storedSeriesCount } from "@/lib/demo/series";

export const metadata: Metadata = {
  title: "Series",
  description: "Series shapes for Afronomics Feed. No observation is stored.",
};

export default function SeriesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Series" }]}
      kicker="Series"
      title="What a series would hold"
      lede="A shape stays empty until a source, unit and as-of date exist. This page does not store a sample observation."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{seriesShapes.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedSeriesCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/data" className="text-forest underline underline-offset-2">
          Data
        </Link>
        {" · "}
        <Link href="/units" className="text-forest underline underline-offset-2">
          Units
        </Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">
          Citations
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {seriesShapes.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Series shapes" methodology="Stored count is zero. No observation is attached." />
    </LayerPage>
  );
}
