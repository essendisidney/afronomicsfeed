import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { seasonSlots, storedSeasonCount } from "@/lib/demo/seasons";

export const metadata: Metadata = {
  title: "Seasons",
  description: "Season words for Afronomics Feed. No window is stored.",
};

export default function SeasonsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Seasons" }]}
      kicker="Seasons"
      title="When a print would sit"
      lede="These are words a season file would use. This page does not store a start date or a sample window."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Vocabulary</p>
          <p className="mt-1 font-serif text-xl">{seasonSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedSeasonCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/periods" className="text-forest underline underline-offset-2">
          Periods
        </Link>
        {" · "}
        <Link href="/calendar" className="text-forest underline underline-offset-2">
          Calendar
        </Link>
        {" · "}
        <Link href="/series" className="text-forest underline underline-offset-2">
          Series
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {seasonSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Season words" methodology="Stored count is zero. No window is attached." />
    </LayerPage>
  );
}
