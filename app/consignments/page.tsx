import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { consignmentSlots, storedConsignmentCount } from "@/lib/demo/consignments";

export const metadata: Metadata = {
  title: "Consignments",
  description: "Consignment shapes for Afronomics Feed. No movement is stored.",
};

export default function ConsignmentsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Consignments" }]}
      kicker="Consignments"
      title="What a consignment would move"
      lede="A slot stays empty until a named contract, a lot and a cited border post exist. This page does not store a sample consignment."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{consignmentSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedConsignmentCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/contracts" className="text-forest underline underline-offset-2">
          Contracts
        </Link>
        {" · "}
        <Link href="/lots" className="text-forest underline underline-offset-2">
          Lots
        </Link>
        {" · "}
        <Link href="/borders" className="text-forest underline underline-offset-2">
          Borders
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {consignmentSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Consignment shapes" methodology="Stored count is zero. No movement is attached." />
    </LayerPage>
  );
}
