import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { storedTenorCount, tenorSlots } from "@/lib/demo/tenors";

export const metadata: Metadata = {
  title: "Tenors",
  description: "Tenor words for Afronomics Feed. No maturity date is stored.",
};

export default function TenorsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Tenors" }]}
      kicker="Tenors"
      title="How long a claim would run"
      lede="These are words a maturity file would use. This page does not store a date or a sample tenor."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Vocabulary</p>
          <p className="mt-1 font-serif text-xl">{tenorSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedTenorCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/horizons" className="text-forest underline underline-offset-2">
          Horizons
        </Link>
        {" · "}
        <Link href="/markets" className="text-forest underline underline-offset-2">
          Markets
        </Link>
        {" · "}
        <Link href="/frequencies" className="text-forest underline underline-offset-2">
          Frequencies
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {tenorSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Tenor words" methodology="Stored count is zero. No maturity date is attached." />
    </LayerPage>
  );
}
