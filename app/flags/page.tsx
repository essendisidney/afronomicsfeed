import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { flagSlots, storedFlagCount } from "@/lib/demo/flags";

export const metadata: Metadata = {
  title: "Flags",
  description: "Quality-mark words for Afronomics Feed. No flag is stored.",
};

export default function FlagsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Flags" }]}
      kicker="Flags"
      title="What a quality mark would say"
      lede="These are words a quality file would use. This page does not store a sample flag."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Vocabulary</p>
          <p className="mt-1 font-serif text-xl">{flagSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Stored</p>
          <p className="mt-1 font-serif text-xl">{storedFlagCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/gaps" className="text-forest underline underline-offset-2">
          Gaps
        </Link>
        {" · "}
        <Link href="/revisions" className="text-forest underline underline-offset-2">
          Revisions
        </Link>
        {" · "}
        <Link href="/observations" className="text-forest underline underline-offset-2">
          Observations
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {flagSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Flag words" methodology="Stored count is zero. No quality mark is attached." />
    </LayerPage>
  );
}
