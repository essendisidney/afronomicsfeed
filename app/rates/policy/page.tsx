import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { Questions } from "@/components/seo/Questions";
import { SectionTitle } from "@/components/data/parts";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { policyBoard } from "@/lib/data/policy-rates";
import { policyAnswers } from "@/lib/seo/answers";
import { site } from "@/lib/site";

export const revalidate = 1800;

export function generateMetadata(): Metadata {
  const { title, description } = policyAnswers();
  return { title, description, alternates: { canonical: `${site.url}/rates/policy` } };
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const pts = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(2)}`;

export default function PolicyRatesPage() {
  const { rows, missing, updatedAt } = policyBoard();

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { label: "Policy rates" }]}
      kicker="Afronomics dataset · Africa"
      title="Central-bank policy rates"
      lede={
        <p>
          The rate each central bank sets, read from the bank’s own website in its own words, beside what the same government paid at its latest one-year
          bill auction. When the bill sits well below the policy rate, the market expects cuts; well above, it expects rises or prices risk.
        </p>
      }
    >
      {rows.length === 0 ? (
        <p className="text-sm text-muted">The first reading lands with the next scheduled run.</p>
      ) : (
        <section>
          <SectionTitle kicker="Today" title="Policy rate against the one-year bill" note="Highest policy rate first. The gap is the one-year bill minus the policy rate, in percentage points." />
          <div className="mt-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Market</th>
                  <th>Rate, as the bank names it</th>
                  <th className="text-right">Policy rate</th>
                  <th>Bank’s date</th>
                  <th className="text-right">One-year bill</th>
                  <th className="text-right">Gap</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.market}>
                    <td>
                      <Link href={r.href} className="font-medium hover:text-forest">
                        {r.market_name}
                      </Link>
                      <a href={r.source} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-muted hover:text-forest">
                        {r.publisher}
                      </a>
                    </td>
                    <td className="text-xs text-ink-soft">
                      {r.label}
                      {r.upper != null ? <span className="block text-[11px] text-muted">corridor to {r.upper.toFixed(2)}% (lending)</span> : null}
                    </td>
                    <td className="text-right font-semibold">{r.rate.toFixed(2)}%</td>
                    <td className="whitespace-nowrap text-xs">{r.date_as_printed ?? "not shown"}</td>
                    <td className="text-right">
                      {r.bill ? (
                        <>
                          {r.bill.rate.toFixed(2)}%<span className="block text-[11px] text-muted">{dateFmt.format(new Date(r.bill.date))}</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-right font-medium">{r.gap == null ? "—" : pts(r.gap)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
            Each policy rate is the figure on the central bank’s website when Afronomics read it{updatedAt ? ` (last read ${dateFmt.format(new Date(updatedAt))})` : ""};
            the bank’s date is the one it prints beside the rate, in its own format. Egypt sets a corridor: the overnight deposit rate is shown, with the
            lending rate beneath. One-year bill rates are each market’s latest 364-day auction from the{" "}
            <Link href="/markets/tbills" className="underline underline-offset-2">
              T-bill monitor
            </Link>
            .
          </p>
          {missing.length ? (
            <p className="mt-2 max-w-3xl text-xs leading-5 text-muted">
              Not yet included, because the bank’s site loads the rate by script rather than printing it: {missing.map((m) => m.market).join(", ")}.
            </p>
          ) : null}
        </section>
      )}
      <CiteBlock title="African central-bank policy rates" path="/rates/policy" publisher="the central banks’ own websites" />
      <Questions items={policyAnswers().items} />
      <NewsletterBand />
    </PageShell>
  );
}
