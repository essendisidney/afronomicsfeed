import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { EvidenceTag } from "@/components/evidence/EvidenceTag";
import { figureEvidence, formatFigure, institutions, kindLabels, kindPlural, kindsInOrder, latest, regulatorOf, type Kind } from "@/lib/registry";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";

const description =
  "Every SACCO, microfinance bank and bank licensed in Kenya, with its licence status and the figures SASRA and CBK publish for it: assets, deposits, loans, bad loans and capital, each linked to the regulator's page.";

export const metadata: Metadata = {
  title: "Registry of Kenya's licensed SACCOs and banks",
  description: fitDescription(description),
  alternates: { canonical: `${site.url}/registry` },
};

type Query = { kind?: string; county?: string; status?: string; page?: string };

/** Rows per page: the full list (400+ rows) was a 45,000px scroll on a phone and too heavy for a slow connection. */
const PAGE_SIZE = 100;

const statusLabels: Record<string, string> = {
  licensed: "Licensed",
  authorised: "Authorised",
  restricted: "Restricted to credit only",
  revoked: "Licence revoked",
  expired: "Authorisation expired",
};

function href(q: Query) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(q)) if (v) p.set(k, v);
  const s = p.toString();
  return s ? `/registry?${s}` : "/registry";
}

export default async function RegistryPage({ searchParams }: { searchParams: Promise<Query> }) {
  const q = await searchParams;
  const all = institutions();
  const kind = kindsInOrder.includes(q.kind as Kind) ? (q.kind as Kind) : undefined;
  const counties = [...new Set(all.filter((i) => i.county && (!kind || i.kind === kind)).map((i) => i.county!))].sort();
  const county = counties.includes(q.county ?? "") ? q.county : undefined;
  const statuses = [...new Set(all.map((i) => i.status).filter((s): s is string => Boolean(s)))];
  const status = statuses.includes(q.status ?? "") ? q.status : undefined;
  const list = all.filter((i) => (!kind || i.kind === kind) && (!county || i.county === county) && (!status || i.status === status));
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, Number.parseInt(q.page ?? "1", 10) || 1));
  const first = (page - 1) * PAGE_SIZE;
  const shown = list.slice(first, first + PAGE_SIZE);
  const pager = (where: string) =>
    pages > 1 ? (
      <nav aria-label={`Registry pages, ${where}`} className="mt-3 flex flex-wrap items-center gap-2 text-[14px]">
        {Array.from({ length: pages }, (_, n) => n + 1).map((n) => (
          <Link
            key={n}
            href={href({ kind, county, status, page: n > 1 ? String(n) : undefined })}
            aria-current={n === page ? "page" : undefined}
            aria-label={`Page ${n}: ${list[(n - 1) * PAGE_SIZE].name} to ${list[Math.min(list.length, n * PAGE_SIZE) - 1].name}`}
            className={`${chip(n === page)} min-w-11 justify-center`}
          >
            {n}
          </Link>
        ))}
      </nav>
    ) : null;
  const chip = (active: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-[13px] font-medium ${active ? "border-forest bg-forest text-paper" : "border-rule text-ink-soft hover:border-forest hover:text-ink"}`;
  const counts = Object.fromEntries(kindsInOrder.map((k) => [k, all.filter((i) => i.kind === k).length]));

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { href: "/compare", label: "Compare" }, { label: "Registry" }]}
      kicker="Registry"
      title="Every licensed SACCO, microfinance bank and bank in Kenya"
      lede="Built only from what the regulators publish: SASRA for SACCOs, the Central Bank of Kenya for banks and microfinance banks. Each figure links to the page it comes from. Per-institution figures are published once a year."
    >
      {/* One sideways-scrolling row on a phone: wrapped, the chips re-flowed into more rows when the web font arrived. */}
      <nav aria-label="Filter by kind" className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        <Link href={href({ county, status })} aria-current={!kind ? "page" : undefined} className={chip(!kind)}>
          All ({all.length})
        </Link>
        {kindsInOrder.map((k) =>
          counts[k] ? (
            <Link key={k} href={href({ kind: k, status })} aria-current={kind === k ? "page" : undefined} className={chip(kind === k)}>
              {kindPlural[k]} ({counts[k]})
            </Link>
          ) : null,
        )}
      </nav>
      <form action="/registry" className="mt-4 flex flex-wrap items-end gap-3 text-[14px]">
        {kind ? <input type="hidden" name="kind" value={kind} /> : null}
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-muted">County</span>
          <select name="county" defaultValue={county ?? ""} className="min-h-11 rounded-lg border border-rule bg-surface px-3 text-ink">
            <option value="">Every county</option>
            {counties.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold text-muted">Status</span>
          <select name="status" defaultValue={status ?? ""} className="min-h-11 rounded-lg border border-rule bg-surface px-3 text-ink">
            <option value="">Any status</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {statusLabels[s] ?? s}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="min-h-11 rounded-lg border border-forest px-4 font-semibold text-forest hover:bg-forest hover:text-paper">
          Show
        </button>
        {/* Own row on a phone: squeezed in beside "Show", the links re-wrapped when the web font arrived (layout shift). */}
        <span className="flex w-full gap-4 sm:ml-auto sm:w-auto">
          <a href="/api/registry" className="inline-flex min-h-11 items-center font-semibold text-forest underline underline-offset-4" data-track="download_click">
            Download CSV
          </a>
          <a href="/api/registry?format=xlsx" className="inline-flex min-h-11 items-center font-semibold text-forest underline underline-offset-4" data-track="download_click">
            Excel
          </a>
        </span>
      </form>

      <p className="tabular mt-6 text-[13px] text-muted">
        {list.length} {list.length === 1 ? "institution" : "institutions"}
        {pages > 1 ? `, A to Z; showing ${first + 1}–${first + shown.length}` : ""}
      </p>
      {pager("top")}
      <div className="table-box mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label="Registry (scrolls sideways)">
        <table className="data-table min-w-[640px]">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Kind</th>
              <th scope="col">County</th>
              <th scope="col">Status</th>
              <th scope="col" className="text-right">
                Total assets
              </th>
            </tr>
          </thead>
          <tbody>
            {shown.map((i) => {
              const assets = latest(i, "assets");
              return (
                <tr key={i.slug}>
                  <th scope="row" className="row-label">
                    <Link href={`/registry/${i.slug}`} className="text-ink underline-offset-2 hover:text-forest hover:underline">
                      {i.name}
                    </Link>
                  </th>
                  <td>{kindLabels[i.kind]}</td>
                  <td>{i.county ?? "—"}</td>
                  <td>{i.status ? (statusLabels[i.status] ?? i.status) : "Not on the latest list"}</td>
                  <td className="text-right" data-num>
                    {assets ? (
                      <span className="inline-flex flex-col items-end gap-1">
                        <span>{formatFigure(assets)}</span>
                        <EvidenceTag {...figureEvidence(assets)} />
                      </span>
                    ) : (
                      <span className="text-muted">Not published</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pager("bottom")}
      <p className="mt-6 max-w-3xl text-[13px] leading-5 text-muted">
        Licence status is from SASRA&rsquo;s list for the current year and CBK&rsquo;s latest directories. Figures are the regulators&rsquo;: SASRA&rsquo;s
        annual report gives assets, deposits and loans for each SACCO; CBK&rsquo;s gives each bank&rsquo;s and microfinance bank&rsquo;s. Names are joined
        across documents by code; where a name could not be joined with certainty, its figures are not shown. Information, not advice;{" "}
        {regulatorOf("sacco_dt")} and CBK are the authorities on licensing.
      </p>
    </PageShell>
  );
}
