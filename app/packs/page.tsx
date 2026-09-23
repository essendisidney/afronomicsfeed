import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { briefingPacks, deliveredPacks } from "@/lib/demo/packs";

export const metadata: Metadata = {
  title: "Briefing packs",
  description: "Packaged morning and weekly briefing shapes. Nothing is delivered without a live seat.",
};

export default function PacksPage() {
  const delivered = deliveredPacks();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Packs" }]}
      kicker="Briefing packs"
      title="What a pack would gather"
      lede="Each pack lists the files it would pull. Delivery requires Auth and a seat. This page does not invent an inbox."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Delivered</p>
          <p className="mt-1 font-serif text-xl">{delivered.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Delivery</p>
          <p className="mt-1 font-serif text-xl">Not live</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/brief" className="text-forest underline underline-offset-2">
          Daily Brief
        </Link>
        {" · "}
        <Link href="/weekly" className="text-forest underline underline-offset-2">
          Weekly
        </Link>
        {" · "}
        <Link href="/watchlists" className="text-forest underline underline-offset-2">
          Watchlists
        </Link>
        {" · "}
        <Link href="/subscribe" className="text-forest underline underline-offset-2">
          Subscribe
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {briefingPacks.map((pack) => (
          <li key={pack.slug} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {pack.cadence} · {pack.seat} · {pack.status}
            </p>
            <p className="mt-1 font-serif text-xl">{pack.title}</p>
            <p className="mt-2 text-sm text-ink-soft">{pack.lede}</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {pack.hrefs.map((href) => (
                <li key={href}>
                  <Link href={href} className="text-forest underline underline-offset-2">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Deliver — auth required
            </p>
          </li>
        ))}
      </ul>

      <Provenance source="No pack queue" methodology="Shapes only. No email or inbox is filled." />
    </LayerPage>
  );
}
