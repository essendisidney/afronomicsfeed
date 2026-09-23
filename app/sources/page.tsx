import type { Metadata } from "next";
import Link from "next/link";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { Provenance } from "@/components/ui/Provenance";
import { linkedSourceCount, officialSources } from "@/lib/demo/sources";

export const metadata: Metadata = {
  title: "Sources",
  description: "Official doors Afronomics may cite. Pending rows are not verified as production citations.",
};

export default function SourcesPage() {
  const linked = linkedSourceCount();

  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Sources" }]}
      kicker="Source registry"
      title="Doors before prints"
      lede="Each row is an official site the desk may cite. Linked means the door is on the file. Pending means verification is not filed — figures stay blank."
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Sources</p>
          <p className="mt-1 font-serif text-xl">{officialSources.length}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Linked</p>
          <p className="mt-1 font-serif text-xl">{linked}</p>
        </div>
        <div className="border border-rule px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">Scrapers</p>
          <p className="mt-1 font-serif text-xl">None</p>
        </div>
      </div>

      <p className="mt-6 text-sm">
        <Link href="/method/registry" className="text-forest underline underline-offset-2">
          Method registry
        </Link>
        {" · "}
        <Link href="/graph" className="text-forest underline underline-offset-2">
          Graph
        </Link>
        {" · "}
        <Link href="/ingestion" className="text-forest underline underline-offset-2">
          Ingestion
        </Link>
        {" · "}
        <Link href="/institutions" className="text-forest underline underline-offset-2">
          Institutions
        </Link>
      </p>

      <ul className="mt-10 space-y-3">
        {officialSources.map((source) => (
          <li key={source.slug} className="border-b border-rule pb-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-gold">
              {source.kind}
              {source.countrySlug ? ` · ${source.countrySlug}` : " · continental"} · {source.status}
            </p>
            <a
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block font-serif text-xl hover:text-forest"
            >
              {source.label}
            </a>
            <p className="mt-1 text-sm text-ink-soft">{source.note}</p>
            {source.countrySlug ? (
              <p className="mt-2 text-sm">
                <Link
                  href={`/countries/${source.countrySlug}`}
                  className="text-forest underline underline-offset-2"
                >
                  Country file
                </Link>
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      <Provenance
        source="Official door index"
        methodology="No scrape. No invented print from a linked URL alone."
      />
    </LayerPage>
  );
}
