import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { outlinedRunbookCount, runbooks } from "@/lib/demo/runbooks";

export const metadata: Metadata = {
  title: "Runbooks",
  description: "Desk SOP shells for Afronomics. Empty until an editor files the steps.",
};

export default function RunbooksPage() {
  const outlined = outlinedRunbookCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Runbooks" }]}
      kicker="Runbooks"
      title="How the desk opens a file"
      lede="SOPs for morning open, MPC reads and corridor notes. Outline means a related brief exists. Empty means the steps are not written."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Runbooks</p>
          <p className="mt-1 font-serif text-xl">{runbooks.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Outlined</p>
          <p className="mt-1 font-serif text-xl">{outlined}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/onboarding" className="text-forest underline underline-offset-2">
          Onboarding
        </Link>
        {" · "}
        <Link href="/admin" className="text-forest underline underline-offset-2">
          Editorial
        </Link>
        {" · "}
        <Link href="/method" className="text-forest underline underline-offset-2">
          Method
        </Link>
        {" · "}
        <Link href="/audit" className="text-forest underline underline-offset-2">
          Audit
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {runbooks.map((book) => (
          <li key={book.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {book.desk} · {book.status}
            </p>
            <p className="mt-1 font-serif text-xl">{book.title}</p>
            <p className="mt-1 text-sm text-ink-soft">{book.lede}</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {book.hrefs.map((href) => (
                <li key={href}>
                  <Link href={href} className="text-forest underline underline-offset-2">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>

      <Provenance source="No SOP store" methodology="Shells only. No invented step that claims a write succeeded." />
    </LayerPage>
  );
}
