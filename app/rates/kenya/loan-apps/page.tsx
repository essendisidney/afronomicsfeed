import type { Metadata } from "next";
import Link from "next/link";
import { LenderSearch } from "@/components/data/LenderSearch";
import { LoanReportForm } from "@/components/data/LoanReportForm";
import type { LoanCell } from "@/app/api/loan-reports/route";
import { rpc } from "@/lib/store";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { ShareRow } from "@/components/ui/ShareRow";
import { lenderDomain, lenderHref, loadLenders } from "@/lib/data/loan-apps";
import { site } from "@/lib/site";

export const revalidate = 3600;

const longDate = (iso: string | null | undefined) =>
  iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }) : "";

export function generateMetadata(): Metadata {
  const f = loadLenders();
  return {
    title: "Is this loan app licensed? Kenya's licensed digital lenders, searchable",
    description: f
      ? `Search all ${f.lenders.length} digital credit providers licensed by the Central Bank of Kenya (directory of ${longDate(f.updated)}), and see which were added or dropped.`
      : "Search the digital credit providers licensed by the Central Bank of Kenya.",
    alternates: { canonical: `${site.url}/rates/kenya/loan-apps` },
  };
}

async function scorecard(): Promise<LoanCell[]> {
  const r = await rpc("af_loan_report_summary", { p_secret: process.env.AF_CRON_SECRET ?? "" });
  return r.ok && Array.isArray(r.value) ? (r.value as LoanCell[]) : [];
}

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;

export default async function LoanAppsPage() {
  const f = loadLenders();
  const cells = await scorecard();
  const scored = cells.filter((c) => c.median != null).sort((a, b) => a.median! - b.median!);
  const reports = cells.reduce((n, c) => n + c.n, 0);
  const updated = longDate(f?.updated) || "the latest directory";
  const lenders = (f?.lenders ?? []).map((l) => ({ ...l, domain: lenderDomain(l.email) }));
  const recent = [...lenders].filter((l) => l.licensed).sort((a, b) => b.licensed!.localeCompare(a.licensed!)).slice(0, 8);
  const items = [
    {
      q: "How do I know if a loan app is licensed in Kenya?",
      a: `Find the company behind the app (in its terms or the app store's developer details) and look for it on the Central Bank of Kenya's directory of digital credit providers. ${f ? `The directory of ${updated} lists ${lenders.length} licensed lenders; search them on this page.` : ""} A digital lender not on the list is not licensed by the CBK.`,
    },
    {
      q: "Is it legal to lend through an app without a CBK licence?",
      a: "Since the Central Bank of Kenya (Amendment) Act 2021, a non-deposit-taking business lending digitally needs a CBK licence as a digital credit provider. Banks, microfinance banks and SACCOs are licensed separately and are not in this directory.",
    },
  ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "Is this loan app licensed?" }]}
      kicker="Loan app check · Kenya"
      title="Is this loan app licensed?"
      lede={
        <p>
          Search every digital lender the Central Bank of Kenya has licensed, from its own directory{f ? ` of ${updated}` : ""}. Unlicensed apps are where
          most abuse happens: shaming contacts, hidden fees, impossible terms. Check before you borrow.
        </p>
      }
    >
      {f ? (
        <LenderSearch lenders={lenders} updated={updated} />
      ) : (
        <p className="rounded-xl border border-rule bg-surface px-4 py-3 text-sm text-ink-soft">The CBK’s directory is being read for the first time; check back within a day.</p>
      )}
      <div className="mt-4">
        <ShareRow text="Is your loan app licensed? Search every lender the Central Bank of Kenya has licensed:" path="/rates/kenya/loan-apps" />
      </div>

      {f ? (
        <section className="mt-12">
          <SectionTitle
            kicker="Scorecard · from borrowers"
            title="What each licensed lender really costs"
            note="Cost per KES 1,000 borrowed for 30 days, every fee included, from borrowers’ own reports over 12 months. Shown once five borrowers have reported a lender."
          />
          {scored.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Lender</th>
                    <th className="text-right">Middle cost</th>
                    <th className="text-right">Middle half</th>
                    <th className="text-right">Contacted friends or family</th>
                    <th className="text-right">Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {scored.map((c) => (
                    <tr key={c.lender}>
                      <td className="font-medium text-ink">
                        <Link href={lenderHref(c.lender)} className="hover:text-forest">
                          {c.lender}
                        </Link>
                      </td>
                      <td className="text-right font-semibold">{kes(c.median!)}</td>
                      <td className="text-right">
                        {kes(c.low!)} – {kes(c.high!)}
                      </td>
                      <td className="text-right">{c.shamed_pct != null ? `${c.shamed_pct}%` : "—"}</td>
                      <td className="text-right">{c.n}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-4 max-w-2xl rounded-xl border border-rule bg-surface px-4 py-3 text-sm text-ink-soft">
              {reports
                ? `${reports} loan${reports === 1 ? "" : "s"} reported so far; no lender has five yet, so nothing is published. Add yours below.`
                : "Collecting from today: add a loan you have taken below. The first lender appears once five borrowers have reported it."}
            </p>
          )}
          <div id="report" className="mt-6 scroll-mt-24">
            <LoanReportForm lenders={lenders.map((l) => l.name)} />
          </div>
          <p className="mt-2 text-[12px] text-muted">
            For comparison, a bank or SACCO loan at 15% a year costs about KES 12 per KES 1,000 for 30 days. Figures are what borrowers report, checked only
            for range; a lender can ask us to look again at any figure.
          </p>
        </section>
      ) : null}

      {f ? (
        <section className="mt-12 grid gap-10 lg:grid-cols-2">
          <div>
            <SectionTitle kicker="Newest" title="Most recently licensed" />
            <ul className="mt-3 divide-y divide-rule text-sm">
              {recent.map((l) => (
                <li key={l.no} className="flex justify-between gap-3 py-2">
                  <Link href={lenderHref(l.name)} className="text-ink hover:text-forest">
                    {l.name}
                  </Link>
                  <span className="whitespace-nowrap text-muted">{longDate(l.licensed)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionTitle kicker="Watch" title="No longer on the list" note="Lenders that were in an earlier directory we read and are missing from the latest." />
            {f.removed.length ? (
              <ul className="mt-3 divide-y divide-rule text-sm">
                {f.removed.map((r) => (
                  <li key={r.name} className="flex justify-between gap-3 py-2">
                    <Link href={lenderHref(r.name)} className="text-ink hover:text-forest">
                      {r.name}
                    </Link>
                    <span className="whitespace-nowrap text-muted">gone by {longDate(r.dropped_by)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">None yet: we compare each new directory with the one before.</p>
            )}
          </div>
        </section>
      ) : null}

      <section className="mt-12 max-w-3xl text-sm leading-6 text-ink-soft">
        <SectionTitle kicker="Before you borrow" title="Licensed is not the same as cheap" />
        <p className="mt-3">
          A licence means the CBK supervises the lender, not that its loan is good value. Compare what a one-month loan really costs on{" "}
          <Link href="/rates/kenya/mobile-loans" className="font-semibold text-forest underline underline-offset-2">
            mobile loan costs
          </Link>
          , and against a SACCO or bank on{" "}
          <Link href="/rates/kenya" className="underline underline-offset-2">
            Kenya rates compared
          </Link>
          .
        </p>
      </section>

      {f ? (
        <p className="mt-10 text-sm text-ink-soft">
          Source: Central Bank of Kenya,{" "}
          <a href={f.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            Directory of Digital Credit Providers
          </a>
          , updated {updated}; read {longDate(f.read_at.slice(0, 10))}. Contact details as the CBK publishes them. <em>Information, not advice.</em>
        </p>
      ) : null}
      <Questions items={items} />
    </PageShell>
  );
}
