import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { borderSlots, recordedBorderCount } from "@/lib/demo/borders";

export const metadata: Metadata = {
  title: "Borders",
  description: "Border shapes for Afronomics Feed. No post, dwell or disruption is stored.",
};

export default function BordersPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Borders" }]}
      kicker="Borders"
      title="What a border post would hold"
      lede="A slot stays empty until a cited name, a pair of countries and a date exist. This page does not store a sample dwell."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{borderSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Recorded</p>
          <p className="mt-1 font-serif text-xl">{recordedBorderCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/corridors" className="text-forest underline underline-offset-2">
          Corridors
        </Link>
        {" · "}
        <Link href="/trade" className="text-forest underline underline-offset-2">
          Trade
        </Link>
        {" · "}
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {borderSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Border shapes" methodology="Recorded count is zero. No dwell is attached." />
    </LayerPage>
  );
}
