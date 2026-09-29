import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { quotaSlots, storedQuotaCount } from "@/lib/demo/quotas";

export const metadata: Metadata = {
  title: "Quotas",
  description: "Quota shapes for Afronomics Feed. No fill is stored.",
};

export default function QuotasPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Quotas" }]}
      kicker="Quotas"
      title="What a quota would limit"
      lede="A slot stays empty until a named authority, a cited notice and a period exist. This page does not store a sample fill."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{quotaSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedQuotaCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/releases" className="text-forest underline underline-offset-2">
          Releases
        </Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
        {" · "}
        <Link href="/periods" className="text-forest underline underline-offset-2">
          Periods
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {quotaSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Quota shapes" methodology="Stored count is zero. No fill is attached." />
    </LayerPage>
  );
}
