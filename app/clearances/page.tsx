import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { clearanceSlots, storedClearanceCount } from "@/lib/demo/clearances";

export const metadata: Metadata = {
  title: "Clearances",
  description: "Clearance shapes for Afronomics Feed. No decision is stored.",
};

export default function ClearancesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Clearances" }]}
      kicker="Clearances"
      title="What a clearance would record"
      lede="A slot stays empty until a filing door, a post and a cited decision exist. This page does not store a sample clearance."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{clearanceSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedClearanceCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/releases" className="text-forest underline underline-offset-2">
          Releases
        </Link>
        {" · "}
        <Link href="/customs" className="text-forest underline underline-offset-2">
          Customs
        </Link>
        {" · "}
        <Link href="/borders" className="text-forest underline underline-offset-2">
          Borders
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {clearanceSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Clearance shapes" methodology="Stored count is zero. No decision is attached." />
    </LayerPage>
  );
}
