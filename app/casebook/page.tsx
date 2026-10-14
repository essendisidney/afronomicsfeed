import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { asOfLabel } from "@/components/evidence/EvidenceTag";
import { caseCountry, caseSector, caseYear, countryNames, isPublic, sectorNames, showDrafts, visibleCases } from "@/lib/cases";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";

const description =
  "Africa's dated record of financial failures and policy shocks: what conditions looked like before, what set it off, who lost, and what a board can ask now. Every fact linked to the regulator's own document.";

export async function generateMetadata(): Promise<Metadata> {
  const anyPublic = visibleCases(false).length > 0;
  return {
    title: "The Casebook: what happened, who lost, what to ask",
    description: fitDescription(description),
    alternates: { canonical: `${site.url}/casebook` },
    // Not indexed until the first case is signed off: an empty index is not worth a search result.
    robots: anyPublic ? undefined : { index: false, follow: true },
  };
}

type Query = { country?: string; sector?: string; year?: string };

function filterHref(q: Query) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (v) params.set(k, v);
  const s = params.toString();
  return s ? `/casebook?${s}` : "/casebook";
}

export default async function CasebookPage({ searchParams }: { searchParams: Promise<Query> }) {
  const q = await searchParams;
  const all = visibleCases();
  const countries = [...new Set(all.map((c) => c.country))].sort();
  const sectors = [...new Set(all.map((c) => c.sector))].sort();
  const years = [...new Set(all.map(caseYear))].sort().reverse();
  const country = countries.includes(q.country ?? "") ? q.country : undefined;
  const sector = sectors.includes(q.sector ?? "") ? q.sector : undefined;
  const year = years.includes(q.year ?? "") ? q.year : undefined;
  const list = all.filter((c) => (!country || c.country === country) && (!sector || c.sector === sector) && (!year || caseYear(c) === year));
  const base = { country, sector, year };
  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-4 text-[13px] font-medium ${active ? "border-forest bg-forest text-paper" : "border-rule text-ink-soft hover:border-forest hover:text-ink"}`;
  const filters: { key: keyof Query; label: string; values: string[]; name: (v: string) => string }[] = [
    { key: "country", label: "Every country", values: countries, name: (v) => countryNames[v] ?? v },
    { key: "sector", label: "Every sector", values: sectors, name: (v) => sectorNames[v] ?? v },
    { key: "year", label: "Every year", values: years, name: (v) => v },
  ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { label: "Casebook" }]}
      kicker="Casebook"
      title="What happened before, who lost, and what to ask now"
      lede="Each case is a dated file: conditions before, what set it off, the timeline, who lost, the signals that were visible, and the response. Every fact links to the regulator's or the institution's own document."
    >
      {all.length ? (
        <>
          {filters.map((f) =>
            f.values.length > 1 ? (
              <nav key={f.key} aria-label={`Filter by ${f.key}`} className="mt-3 flex flex-wrap gap-2 first:mt-0">
                <Link href={filterHref({ ...base, [f.key]: undefined })} aria-current={!base[f.key] ? "page" : undefined} className={chip(!base[f.key])}>
                  {f.label}
                </Link>
                {f.values.map((v) => (
                  <Link key={v} href={filterHref({ ...base, [f.key]: v })} aria-current={base[f.key] === v ? "page" : undefined} className={chip(base[f.key] === v)}>
                    {f.name(v)}
                  </Link>
                ))}
              </nav>
            ) : null,
          )}
          <p className="tabular mt-6 text-[13px] text-muted">
            {list.length} {list.length === 1 ? "case" : "cases"}
            {showDrafts() ? " · drafts are shown because this is a preview" : ""}
          </p>
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {list.map((c) => (
              <li key={c.id}>
                <Link href={`/casebook/${c.id}`} className="block py-4 hover:bg-paper-2 sm:px-2">
                  <p className="tabular text-[12px] font-semibold text-muted">
                    {c.id} · {caseCountry(c)} · {caseSector(c)} · <time dateTime={c.start}>{asOfLabel(c.start)}</time>
                    {!isPublic(c) ? <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-ink">DRAFT</span> : null}
                  </p>
                  <p className="mt-1 font-serif text-[1.25rem] leading-snug text-ink">{c.title}</p>
                  <p className="mt-1 max-w-3xl text-[14px] leading-6 text-ink-soft">{c.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
          {!list.length ? (
            <p className="mt-3 text-[15px] text-ink-soft">
              No cases match. <Link href="/casebook" className="underline underline-offset-2">Show all</Link>.
            </p>
          ) : null}
        </>
      ) : (
        <p className="max-w-2xl rounded-2xl border border-rule bg-surface px-5 py-5 text-[15px] leading-7 text-ink-soft">
          No case has been signed off yet. Each one is checked line by line against the regulators&rsquo; documents before it is published here.
        </p>
      )}
      <p className="mt-8 text-[13px] text-muted">Facts are linked to their source; Analysis is labelled as ours. Information, not advice.</p>
    </PageShell>
  );
}
