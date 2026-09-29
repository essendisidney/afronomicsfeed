import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { receiptSlots, storedReceiptCount } from "@/lib/demo/receipts";

export const metadata: Metadata = {
  title: "Receipts",
  description: "Receipt shapes for Afronomics Feed. No confirmation is stored.",
};

export default function ReceiptsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Receipts" }]}
      kicker="Receipts"
      title="What a receipt would confirm"
      lede="A slot stays empty until a lot and a stamp exist. This page does not store a confirmation."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{receiptSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedReceiptCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/lots" className="text-forest underline underline-offset-2">Lots</Link>
        {" · "}
        <Link href="/stamps" className="text-forest underline underline-offset-2">Stamps</Link>
        {" · "}
        <Link href="/footnotes" className="text-forest underline underline-offset-2">Footnotes</Link>
      </p>

      <ul className="mt-10 space-y-3">
        {receiptSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">{item.label}</Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Receipt shapes" methodology="Stored count is zero. No confirmation is attached." />
    </LayerPage>
  );
}
