import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { assaySlots, storedAssayCount } from "@/lib/demo/assays";

export const metadata: Metadata = {
  title: "Assays",
  description: "Assay shapes for Afronomics Feed. No laboratory result is stored.",
};

export default function AssaysPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Assays" }]}
      kicker="Assays"
      title="What an assay would report"
      lede="A slot stays empty until a named lot, a cited laboratory and an authority exist. This page does not store a sample result."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{assaySlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedAssayCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/samples" className="text-forest underline underline-offset-2">
          Samples
        </Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
        {" · "}
        <Link href="/certificates" className="text-forest underline underline-offset-2">
          Certificates
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {assaySlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Assay shapes" methodology="Stored count is zero. No laboratory result is attached." />
    </LayerPage>
  );
}
