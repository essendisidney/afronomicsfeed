import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { storedWaiverCount, waiverSlots } from "@/lib/demo/waivers";

export const metadata: Metadata = {
  title: "Waivers",
  description: "Waiver shapes for Afronomics Feed. No waiver is stored.",
};

export default function WaiversPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Waivers" }]}
      kicker="Waivers"
      title="What a waiver would release"
      lede="A slot stays empty until a contract and a window exist. This page does not store a waiver."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{waiverSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedWaiverCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/contracts" className="text-forest underline underline-offset-2">Contracts</Link>
        {" · "}
        <Link href="/windows" className="text-forest underline underline-offset-2">Windows</Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">Citations</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {waiverSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Waiver shapes" methodology="Stored count is zero. No waiver is attached." />
    </LayerPage>
  );
}
