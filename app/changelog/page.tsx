import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { changelogEntries, shippedChangelogCount } from "@/lib/demo/changelog";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Product changelog for Afronomics Feed. Shipped shells only — no invented metrics.",
};

export default function ChangelogPage() {
  const shipped = shippedChangelogCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Changelog" }]}
      kicker="Changelog"
      title="What shipped on the desk"
      lede="Each entry points at live routes. Draft means unpublished. Nothing here invents a KPI."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Entries</p>
          <p className="mt-1 font-serif text-xl">{changelogEntries.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Shipped</p>
          <p className="mt-1 font-serif text-xl">{shipped}</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/status" className="text-forest underline underline-offset-2">
          Status
        </Link>
        {" · "}
        <Link href="/method/registry" className="text-forest underline underline-offset-2">
          Method registry
        </Link>
        {" · "}
        <Link href="/audit" className="text-forest underline underline-offset-2">
          Audit
        </Link>
      </p>

      <ul className="mt-10 space-y-4">
        {changelogEntries.map((entry) => (
          <li key={entry.slug} className="border-b border-rule pb-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              Phase {entry.phase} · {entry.status}
            </p>
            <p className="mt-1 font-serif text-xl">{entry.title}</p>
            <p className="mt-2 text-sm text-ink-soft">{entry.lede}</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {entry.hrefs.map((href) => (
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

      <Provenance source="Build plan phases" methodology="Changelog lists routes, not vanity metrics." />
    </LayerPage>
  );
}
