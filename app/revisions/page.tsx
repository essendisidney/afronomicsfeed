import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { postedRevisionCount, revisionSlots } from "@/lib/demo/revisions";

export const metadata: Metadata = {
  title: "Revisions",
  description: "Revision shapes for Afronomics Feed. No restatement is posted.",
};

export default function RevisionsPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Revisions" }]}
      kicker="Revisions"
      title="What a revision would record"
      lede="A slot stays empty until an old print, a new print and a source exist. This page does not post a sample restatement."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shapes</p>
          <p className="mt-1 font-serif text-xl">{revisionSlots.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Posted</p>
          <p className="mt-1 font-serif text-xl">{postedRevisionCount()}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/corrections" className="text-forest underline underline-offset-2">
          Corrections
        </Link>
        {" · "}
        <Link href="/method/registry" className="text-forest underline underline-offset-2">
          Method registry
        </Link>
        {" · "}
        <Link href="/changelog" className="text-forest underline underline-offset-2">
          Changelog
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {revisionSlots.map((item) => (
          <li key={item.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.status}</p>
            <Link href={item.href} className="mt-1 block font-serif text-xl hover:text-forest">
              {item.label}
            </Link>
            <p className="mt-1 text-sm text-ink-soft">{item.lede}</p>
          </li>
        ))}
      </ul>

      <Provenance source="Revision shapes" methodology="Posted count is zero. No restatement is attached." />
    </LayerPage>
  );
}
