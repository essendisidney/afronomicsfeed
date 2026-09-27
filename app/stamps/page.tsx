import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { stampSlots, storedStampCount } from "@/lib/demo/stamps";

export const metadata: Metadata = {
  title: "Stamps",
  description: "As-of shapes for Afronomics Feed. No date is stored.",
};

export default function StampsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Stamps" }]}
      kicker="Stamps"
      title="What a stamp would date"
      lede="A slot stays empty until an as-of and a source exist. This page does not store a sample date."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{stampSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedStampCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
        {" · "}
        <Link href="/vintages" className="text-forest underline underline-offset-2">
          Vintages
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {stampSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Stamp shapes" methodology="Stored count is zero. No as-of date is attached." />
    </LayerPage>
  );
}
