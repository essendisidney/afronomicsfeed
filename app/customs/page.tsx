import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { customsSlots, filedCustomsCount } from "@/lib/demo/customs";

export const metadata: Metadata = {
  title: "Customs",
  description: "Customs shapes for Afronomics Feed. No declaration or tariff line is stored.",
};

export default function CustomsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Customs" }]}
      kicker="Customs"
      title="What a customs file would carry"
      lede="A slot stays empty until an agency, a title and a date exist. This page does not store a sample declaration."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{customsSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Filed</p>
          <p className="mt-1 font-serif text-xl">{filedCustomsCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/trade" className="text-forest underline underline-offset-2">
          Trade
        </Link>
        {" · "}
        <Link href="/sources" className="text-forest underline underline-offset-2">
          Sources
        </Link>
        {" · "}
        <Link href="/licensing" className="text-forest underline underline-offset-2">
          Licensing
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {customsSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Customs shapes" methodology="Filed count is zero. No declaration is attached." />
    </LayerPage>
  );
}
