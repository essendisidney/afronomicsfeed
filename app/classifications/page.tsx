import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { classificationKinds, codedClassificationCount, vocabularyClassificationCount } from "@/lib/demo/classifications";

export const metadata: Metadata = {
  title: "Classifications",
  description: "How Afronomics groups a file. No statistical code table is stored.",
};

export default function ClassificationsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Classifications" }]}
      kicker="Classifications"
      title="How a file would be grouped"
      lede="These are words the desk already uses. This page does not store a code table."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Vocabulary</p>
          <p className="mt-1 font-serif text-xl">{vocabularyClassificationCount()}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Coded</p>
          <p className="mt-1 font-serif text-xl">{codedClassificationCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/industries" className="text-forest underline underline-offset-2">
          Industries
        </Link>
        {" · "}
        <Link href="/regions" className="text-forest underline underline-offset-2">
          Regions
        </Link>
        {" · "}
        <Link href="/corridors" className="text-forest underline underline-offset-2">
          Corridors
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {classificationKinds.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Classification vocabulary" methodology="Coded count is zero. No code table is attached." />
    </LayerPage>
  );
}
