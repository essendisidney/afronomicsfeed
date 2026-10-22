import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { ReferenceTerms } from "@/components/data/ReferenceTerms";
import { SectionTitle } from "@/components/data/parts";
import { TableScroll } from "@/components/ui/DataTable";
import { MarkdownBody } from "@/components/ui/MarkdownBody";
import { billIndexLatest, indexName, indexShort } from "@/lib/data/bill-index";
import { indexRevisionRows } from "@/lib/data/index-releases";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { loadMethod } from "@/lib/methods";
import { citeLines } from "@/lib/reference-rates";
import { fitDescription, fitTitle } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: fitTitle(`${indexShort} method, revision log and governance`),
  description: fitDescription(
    "How the Afronomics African Sovereign Bill Index is built: inputs and sources, the formula, data sufficiency, revisions and errors, governance and conflicts, the review cycle, an IOSCO checklist, and how to cite and license it.",
  ),
  alternates: { canonical: `${site.url}/markets/bill-index/method` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const bp = (v: number | null) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : "±"}${Math.abs(v).toFixed(1)} bps`);

export default function BillIndexMethodPage() {
  const method = loadMethod("asbi");
  const revisions = loadMethod("asbi-revisions");
  const governance = loadMethod("governance");
  const idx = billIndexLatest(364);
  const rows = indexRevisionRows();
  const cite = citeLines({
    name: indexName,
    shortName: indexShort,
    version: method.version ?? "1.0",
    readingDate: idx?.latest.date ?? new Date().toISOString().slice(0, 10),
    url: `${site.url}/markets/bill-index`,
    detail: "364-day",
  });

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { href: "/markets/bill-index", label: indexShort }, { label: "Method" }]}
      kicker={`${indexName} · method version ${method.version}`}
      title={`How the ${indexShort} is built, revised and governed`}
      lede={
        <p>
          The published method of the{" "}
          <Link href="/markets/bill-index" className="underline underline-offset-2">
            {indexName}
          </Link>
          , with IOSCO’s Principles for Financial Benchmarks used as a checklist. It is an indicative reference rate: free to quote with the credit,
          and licensed for commercial and benchmark use on the terms below.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <p className="text-[13px] font-medium text-muted">{method.status}</p>
          <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-[13px]">
            <dt className="text-muted">Method</dt>
            <dd className="font-semibold text-ink">Version {method.version}</dd>
            <dt className="text-muted">In force since</dt>
            <dd className="text-ink">{method.inForceSince ? dayFmt.format(new Date(method.inForceSince)) : "—"}</dd>
            <dt className="text-muted">Next review</dt>
            <dd className="text-ink">{method.nextReview ? dayFmt.format(new Date(method.nextReview)) : "—"}</dd>
            {idx ? (
              <>
                <dt className="text-muted">Latest reading</dt>
                <dd className="text-ink">
                  {idx.latest.value.toFixed(2)}%, {dayFmt.format(new Date(idx.latest.date))}
                </dd>
              </>
            ) : null}
          </dl>
          <p className="mt-3 text-[12px] text-muted">
            <a href="#revisions" className="underline underline-offset-2">
              Revision log
            </a>{" "}
            ·{" "}
            <a href="#governance" className="underline underline-offset-2">
              Governance
            </a>{" "}
            ·{" "}
            <a href="#cite" className="underline underline-offset-2">
              How to cite
            </a>
          </p>
        </div>
      }
    >
      <section className="max-w-3xl">
        <MarkdownBody content={method.body} />
      </section>

      <section className="mt-14">
        <SectionTitle kicker="Inputs" title="Every market’s input and its source" note="The 364-day result counted in the latest reading. The measure is the one each central bank publishes." />
        <TableScroll label="ASBI inputs by market" className="mt-2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>Publisher</th>
                <th>Rate published</th>
                <th>Latest 364-day result</th>
              </tr>
            </thead>
            <tbody>
              {billMarkets.map((m) => {
                const c = idx?.contributions.find((x) => x.market.slug === m.slug);
                const any = loadBillMarket(m.slug).rows.find((r) => r.tenor === 364);
                return (
                  <tr key={m.slug}>
                    <td>
                      <Link href={m.href} className="font-medium hover:text-forest">
                        {m.country}
                      </Link>
                    </td>
                    <td className="text-xs">
                      <a href={m.sourcePage} target="_blank" rel="noopener noreferrer" className="hover:text-forest">
                        {m.publisher}
                      </a>
                    </td>
                    <td className="text-xs">{m.rateNote}</td>
                    <td className="text-xs">
                      {c ? `${c.rate.toFixed(2)}%, ${dayFmt.format(new Date(c.date))}` : any ? `Not counted: last result ${dayFmt.format(new Date(any.date))}` : "None held"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableScroll>
      </section>

      <section id="revisions" className="mt-14 scroll-mt-24">
        <SectionTitle kicker="Revision log" title="Changes, corrections and revisions" />
        <div className="mt-4 max-w-3xl">
          <MarkdownBody content={revisions.body} />
        </div>
        <h3 className="mt-8 font-serif text-xl text-ink">Each release against the recomputed series</h3>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">
          The Monday release is the value of record and is never overwritten. The page chart and the API recompute every week from the auctions held
          today, so a result that arrived after the cut-off, or a restated one, moves the recomputed value. Computed each time this page is built.
        </p>
        {rows.length ? (
          <TableScroll label="ASBI releases against the recomputed series" className="mt-3">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Week</th>
                  <th className="text-right">Published</th>
                  <th className="text-right">Recomputed</th>
                  <th className="text-right">Difference</th>
                  <th>Markets whose input changed</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.file}>
                    <td>
                      <a href={`https://github.com/essendisidney/afronomicsfeed/blob/main/editions/index/${r.file}.json`} target="_blank" rel="noopener noreferrer" className="hover:text-forest">
                        {dayFmt.format(new Date(r.week))}
                      </a>
                    </td>
                    <td className="text-right">{r.published.toFixed(3)}%</td>
                    <td className="text-right">{r.current == null ? "—" : `${r.current.toFixed(3)}%`}</td>
                    <td className="text-right text-xs">{bp(r.diffBps)}</td>
                    <td className="text-xs">
                      {r.changed.length
                        ? r.changed
                            .map(
                              (c) =>
                                `${c.country}: ${c.published ? `${c.published.rate.toFixed(2)}% (${c.published.date})` : "none"} → ${c.current ? `${c.current.rate.toFixed(2)}% (${c.current.date})` : "none"}`,
                            )
                            .join("; ")
                        : "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        ) : (
          <p className="mt-3 text-sm text-ink-soft">No releases saved yet.</p>
        )}
      </section>

      <section id="governance" className="mt-14 max-w-3xl scroll-mt-24">
        <SectionTitle kicker="Governance" title={governance.title} note={governance.documented ? `Updated ${dateFmt.format(new Date(governance.documented))}.` : undefined} />
        <div className="mt-4">
          <MarkdownBody content={governance.body} />
        </div>
      </section>

      <ReferenceTerms shortName={indexShort} cite={cite} />
    </PageShell>
  );
}
