import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { savedSearches, searchTemplates } from "@/lib/demo/searches";

export const metadata: Metadata = {
  title: "Saved searches",
  description: "Search templates for Afronomics. Saving requires Auth. The index is not connected.",
};

export default function SearchesPage() {
  const saved = savedSearches();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Searches" }]}
      kicker="Saved searches"
      title="Queries you would keep"
      lede="Templates show the shape of a saved search. Nothing is stored until Auth and a Pro seat exist."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Saved</p>
          <p className="mt-1 font-serif text-xl">{saved.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Search index</p>
          <p className="mt-1 font-serif text-xl">Static</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/search" className="text-forest underline underline-offset-2">
          Search
        </Link>
        {" · "}
        <Link href="/watchlists" className="text-forest underline underline-offset-2">
          Watchlists
        </Link>
        {" · "}
        <Link href="/notifications" className="text-forest underline underline-offset-2">
          Notifications
        </Link>
        {" · "}
        <Link href="/account" className="text-forest underline underline-offset-2">
          Account
        </Link>
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {searchTemplates.map((item) => (
          <li key={item.slug} className="border border-rule px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">{item.query}</p>
            <p className="mt-1 font-serif text-xl">{item.label}</p>
            <p className="mt-2 text-sm text-ink-soft">{item.lede}</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {item.hrefs.map((href) => (
                <li key={href}>
                  <Link href={href} className="text-forest underline underline-offset-2">
                    Open
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
              Save — auth required
            </p>
          </li>
        ))}
      </ul>

      <Provenance source="No search store" methodology="Templates only. No fake saved queries." />
    </LayerPage>
  );
}
