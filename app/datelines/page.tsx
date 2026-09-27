import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { datelineSlots, filedDatelineCount } from "@/lib/demo/datelines";

export const metadata: Metadata = {
  title: "Datelines",
  description: "Dateline shapes for Afronomics Feed. No story is filed from a place.",
};

export default function DatelinesPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Datelines" }]}
      kicker="Datelines"
      title="Where a file would be signed"
      lede="A place stays empty until a story is filed from it. This page does not invent a dateline."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Places</p>
          <p className="mt-1 font-serif text-xl">{datelineSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Filed</p>
          <p className="mt-1 font-serif text-xl">{filedDatelineCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/today" className="text-forest underline underline-offset-2">
          Morning file
        </Link>
        {" · "}
        <Link href="/cities" className="text-forest underline underline-offset-2">
          Cities
        </Link>
        {" · "}
        <Link href="/correspondents" className="text-forest underline underline-offset-2">
          Correspondents
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {datelineSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Dateline shapes" methodology="Filed count is zero. No story is attached." />
    </LayerPage>
  );
}
