import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { factorSlots, storedFactorCount } from "@/lib/demo/factors";

export const metadata: Metadata = {
  title: "Factors",
  description: "Conversion shapes for Afronomics Feed. No factor is stored.",
};

export default function FactorsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Factors" }]}
      kicker="Factors"
      title="What a conversion would cite"
      lede="A slot stays empty until two units and a source exist. This page does not store a sample factor."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{factorSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedFactorCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/units" className="text-forest underline underline-offset-2">
          Units
        </Link>
        {" · "}
        <Link href="/markets" className="text-forest underline underline-offset-2">
          Markets
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {factorSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Factor shapes" methodology="Stored count is zero. No conversion is attached." />
    </LayerPage>
  );
}
