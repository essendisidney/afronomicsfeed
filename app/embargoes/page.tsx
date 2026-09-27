import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { embargoSlots, storedEmbargoCount } from "@/lib/demo/embargoes";

export const metadata: Metadata = {
  title: "Embargoes",
  description: "Embargo shapes for Afronomics Feed. No hold is stored.",
};

export default function EmbargoesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Embargoes" }]}
      kicker="Embargoes"
      title="What a hold would cite"
      lede="A slot stays empty until a publisher and a time exist. This page does not store a sample embargo."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{embargoSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedEmbargoCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/releases" className="text-forest underline underline-offset-2">
          Releases
        </Link>
        {" · "}
        <Link href="/vintages" className="text-forest underline underline-offset-2">
          Vintages
        </Link>
        {" · "}
        <Link href="/notices" className="text-forest underline underline-offset-2">
          Notices
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {embargoSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Embargo shapes" methodology="Stored count is zero. No hold is attached." />
    </LayerPage>
  );
}
