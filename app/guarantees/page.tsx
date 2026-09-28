import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { guaranteeSlots, storedGuaranteeCount } from "@/lib/demo/guarantees";

export const metadata: Metadata = {
  title: "Guarantees",
  description: "Guarantee shapes for Afronomics Feed. No security is stored.",
};

export default function GuaranteesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Guarantees" }]}
      kicker="Guarantees"
      title="What a guarantee would secure"
      lede="A slot stays empty until a contract, a citation and a sourced observation exist. This page does not store a sample guarantee."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{guaranteeSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedGuaranteeCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/contracts" className="text-forest underline underline-offset-2">
          Contracts
        </Link>
        {" · "}
        <Link href="/citations" className="text-forest underline underline-offset-2">
          Citations
        </Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {guaranteeSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Guarantee shapes" methodology="Stored count is zero. No security is attached." />
    </LayerPage>
  );
}
