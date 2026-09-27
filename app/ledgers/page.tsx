import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { ledgerSlots, storedLedgerCount } from "@/lib/demo/ledgers";

export const metadata: Metadata = {
  title: "Ledgers",
  description: "Ledger shapes for Afronomics Feed. No book is stored.",
};

export default function LedgersPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Ledgers" }]}
      kicker="Ledgers"
      title="What a ledger would post"
      lede="A slot stays empty until a cited entry and a source exist. This page does not store a sample ledger."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{ledgerSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedLedgerCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
        {" · "}
        <Link href="/baselines" className="text-forest underline underline-offset-2">
          Baselines
        </Link>
        {" · "}
        <Link href="/periods" className="text-forest underline underline-offset-2">
          Periods
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {ledgerSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Ledger shapes" methodology="Stored count is zero. No entry is attached." />
    </LayerPage>
  );
}
