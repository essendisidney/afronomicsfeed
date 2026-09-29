import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { laycanSlots, storedLaycanCount } from "@/lib/demo/laycans";

export const metadata: Metadata = {
  title: "Laycans",
  description: "Laycan shapes for Afronomics Feed. No window is stored.",
};

export default function LaycansPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Laycans" }]}
      kicker="Laycans"
      title="What a laycan would bound"
      lede="A slot stays empty until a window and a citation exist. This page does not store a date."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{laycanSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedLaycanCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/windows" className="text-forest underline underline-offset-2">Windows</Link>
        {" · "}
        <Link href="/cutoffs" className="text-forest underline underline-offset-2">Cutoffs</Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">Citations</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {laycanSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Laycan shapes" methodology="Stored count is zero. No date is attached." />
    </LayerPage>
  );
}
