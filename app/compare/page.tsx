import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { EvidenceTag } from "@/components/evidence/EvidenceTag";
import { HubSections } from "@/components/hub/HubSections";
import { compareSections } from "@/lib/hubs";
import { assetsInMillions, figureEvidence, formatFigure, growth, inYear, institutions, kindPlural, latest, type Figure, type Institution, type Kind } from "@/lib/registry";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";

const description =
  "Kenya's SACCOs, microfinance banks and banks side by side, from SASRA's and CBK's own figures: size, growth, bad loans and capital. Plus savings, loan and borrowing-cost tables.";

export const metadata: Metadata = {
  title: "Compare SACCOs, banks and lenders",
  description: fitDescription(description),
  alternates: { canonical: `${site.url}/compare` },
};

type Col = { label: string; metric: string; kind?: "growth" | "ratio_of"; of?: [string, string] };
type Peer = { id: Kind; title: string; note: string; groupBy: (i: Institution) => string; groups: string[]; cols: Col[] };

const PEERS: Peer[] = [
  {
    id: "sacco_dt",
    title: "Deposit-taking SACCOs",
    note: "By SASRA's size tier, largest first by total assets. Deposits are left out: SASRA's 2025 report repeats total assets in the deposits column for most medium and small SACCOs.",
    groupBy: (i) => i.tier ?? "other",
    groups: ["large", "medium", "small"],
    cols: [
      { label: "Total assets", metric: "assets" },
      { label: "Growth", metric: "assets", kind: "growth" },
      { label: "Gross loans", metric: "gross_loans" },
      { label: "Bad loans (NPL ratio)", metric: "npl_ratio" },
      { label: "Core capital to assets", metric: "core_capital_to_assets" },
    ],
  },
  {
    id: "sacco_nwdt",
    title: "Non-withdrawable-deposit SACCOs",
    note: "By SASRA's size tier, largest first by total assets.",
    groupBy: (i) => i.tier ?? "other",
    groups: ["large", "medium", "small"],
    cols: [
      { label: "Total assets", metric: "assets" },
      { label: "Growth", metric: "assets", kind: "growth" },
      { label: "Deposits", metric: "deposits" },
      { label: "Bad loans (NPL ratio)", metric: "npl_ratio" },
      { label: "Core capital to assets", metric: "core_capital_to_assets" },
    ],
  },
  {
    id: "mfb",
    title: "Microfinance banks",
    note: "Largest first by total assets. CBK marks Kenya Women Microfinance Bank's 2025 figures as unaudited.",
    groupBy: () => "all",
    groups: ["all"],
    cols: [
      { label: "Total assets", metric: "assets" },
      { label: "Customer deposits", metric: "deposits" },
      { label: "Net loans", metric: "net_loans" },
      { label: "Shareholders' funds", metric: "shareholders_funds" },
      { label: "Profit before tax", metric: "profit_before_tax" },
    ],
  },
  {
    id: "bank",
    title: "Commercial banks",
    note: "By CBK's peer group, largest first by total assets. The bad-loan ratio is worked out by code: gross non-performing loans divided by gross loans, both as CBK publishes them.",
    groupBy: (i) => i.directory?.peerGroup ?? "other",
    groups: ["large", "medium", "small"],
    cols: [
      { label: "Total assets", metric: "assets" },
      { label: "Profit before tax", metric: "profit_before_tax" },
      { label: "Return on equity", metric: "roe" },
      { label: "Bad loans (gross NPL ÷ gross loans)", metric: "gross_npl", kind: "ratio_of", of: ["gross_npl", "gross_loans"] },
      { label: "Core capital to risk-weighted assets", metric: "core_capital_to_rwa" },
    ],
  },
];

function value(i: Institution, c: Col): { text: string; f: Figure | null } {
  if (c.kind === "growth") {
    const g = growth(i, c.metric);
    return { text: g ? `${g.pct >= 0 ? "+" : "−"}${Math.abs(g.pct).toFixed(1)}%` : "—", f: g?.to ?? null };
  }
  if (c.kind === "ratio_of" && c.of) {
    const top = latest(i, c.of[0]);
    const bottom = top ? inYear(i, c.of[1], top.year) : null;
    if (!top?.value || !bottom?.value) return { text: "—", f: null };
    return { text: `${((top.value / bottom.value) * 100).toFixed(1)}%`, f: top };
  }
  const f = latest(i, c.metric);
  return { text: f ? formatFigure(f) : "—", f };
}

type Query = { peer?: string };

export default async function ComparePage({ searchParams }: { searchParams: Promise<Query> }) {
  const q = await searchParams;
  const peer = PEERS.find((p) => p.id === q.peer) ?? PEERS[0];
  const all = institutions().filter((i) => (peer.id === "bank" ? i.kind === "bank" || i.kind === "mortgage" : i.kind === peer.id) && i.figures.length);
  const sorted = [...all].sort((a, b) => (assetsInMillions(b) ?? -1) - (assetsInMillions(a) ?? -1));
  // One source per table: every cell in it comes from the same report and as-of date.
  const sample = sorted.flatMap((i) => peer.cols.map((c) => latest(i, c.of?.[0] ?? c.metric))).find(Boolean) ?? null;
  const chip = (active: boolean) =>
    `inline-flex min-h-11 items-center rounded-full border px-4 text-[13px] font-medium ${active ? "border-forest bg-forest text-paper" : "border-rule text-ink-soft hover:border-forest hover:text-ink"}`;

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { label: "Compare" }]}
      kicker="Compare"
      title="Side by side, in the same units"
      lede="Kenya's SACCOs, microfinance banks and banks compared on the regulators' own figures. Every table names its source; nothing is scored or ranked as better or worse."
    >
      <nav aria-label="Choose a peer group" className="flex flex-wrap gap-2">
        {PEERS.map((p) => (
          <Link key={p.id} href={p.id === PEERS[0].id ? "/compare" : `/compare?peer=${p.id}`} aria-current={peer.id === p.id ? "page" : undefined} className={chip(peer.id === p.id)}>
            {kindPlural[p.id]}
          </Link>
        ))}
      </nav>

      <section aria-labelledby="peer-table" className="mt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="peer-table" className="font-serif text-2xl text-ink">
            {peer.title}
          </h2>
          {sample ? <EvidenceTag {...figureEvidence(sample)} /> : null}
        </div>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-ink-soft">{peer.note}</p>
        {peer.groups.map((g) => {
          const rows = sorted.filter((i) => peer.groupBy(i) === g);
          if (!rows.length) return null;
          return (
            <div key={g} className="mt-6">
              {peer.groups.length > 1 ? <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted">{g === "other" ? "Not grouped" : `${g} (${rows.length})`}</h3> : null}
              <div className="table-box mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label={`${peer.title}, ${g} (scrolls sideways)`}>
                <table className="data-table min-w-[720px]">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      {peer.cols.map((c) => (
                        <th key={c.label} scope="col" className="text-right">
                          {c.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((i) => (
                      <tr key={i.slug}>
                        <th scope="row" className="row-label">
                          <Link href={`/registry/${i.slug}`} className="text-ink underline-offset-2 hover:text-forest hover:underline">
                            {i.name}
                          </Link>
                        </th>
                        {peer.cols.map((c) => (
                          <td key={c.label} className="text-right" data-num>
                            {value(i, c).text}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        <p className="mt-4 text-[13px] text-muted">
          Figures for the year to 31 December, as published. Growth is worked out by code from the two published years.{" "}
          <Link href="/registry" className="underline underline-offset-2">
            Every licensed institution
          </Link>{" "}
          ·{" "}
          <a href="/api/registry" className="underline underline-offset-2" data-track="download_click">
            Download CSV
          </a>
          . Information, not advice.
        </p>
      </section>

      <div className="mt-14">
        <HubSections sections={compareSections} />
      </div>
    </PageShell>
  );
}
