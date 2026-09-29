import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { dutySlots, storedDutyCount } from "@/lib/demo/duties";

export const metadata: Metadata = {
  title: "Duties",
  description: "Duty shapes for Afronomics Feed. No assessment amount is stored.",
};

export default function DutiesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Duties" }]}
      kicker="Duties"
      title="What a duty would assess"
      lede="A slot stays empty until a named customs authority, a cited notice and a receipt exist. This page does not store a sample duty."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{dutySlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedDutyCount()}</p>
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
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {dutySlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Duty shapes" methodology="Stored count is zero. No assessment amount is attached." />
    </LayerPage>
  );
}
