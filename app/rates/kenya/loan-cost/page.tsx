import type { Metadata } from "next";
import Link from "next/link";
import { LoanCalculator } from "@/components/data/LoanCalculator";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { FollowUp } from "@/components/ui/FollowUp";
import { loadKenyaRates } from "@/lib/data/kenya-rates";
import { loanCost } from "@/lib/loan-calc";
import { site } from "@/lib/site";
import { fitDescription, fitTitle } from "@/lib/seo";

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const monthName = (ym: string) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${ym}-01T00:00:00Z`));

export const metadata: Metadata = {
  title: fitTitle("Loan true-cost calculator Kenya: flat vs reducing rate, fees and the real APR"),
  description: fitDescription(
    "Turn any loan quote into its true yearly rate: flat or reducing balance, processing and insurance fees included, set against the banks' average lending rate from the CBK. Free, no sign-up.",
  ),
  alternates: { canonical: `${site.url}/rates/kenya/loan-cost` },
};

export default function LoanCostPage() {
  const rows = loadKenyaRates().bank_rates?.rows ?? [];
  const latest = rows.length ? rows.reduce((a, b) => (b.month > a.month ? b : a)) : null;
  const benchmark = latest ? { rate: latest.lending, month: monthName(latest.month), source: loadKenyaRates().bank_rates!.source } : null;

  const flat = loanCost({ amount: 100000, rate: 14, unit: "year", basis: "flat", months: 12 });
  const reducing = loanCost({ amount: 100000, rate: 14, unit: "year", basis: "reducing", months: 12 });
  const sacco = loanCost({ amount: 100000, rate: 1, unit: "month", basis: "flat", months: 12 });
  const terms = [6, 12, 24, 36];

  const items = [
    {
      q: "What is the difference between a flat rate and a reducing balance rate?",
      a: `A flat rate charges interest on the full amount for the whole term, even as you repay. A reducing balance rate charges interest only on what you still owe. On KES 100,000 over 12 months, 14% flat costs ${kes(flat.totalInterest)} in interest; 14% reducing costs ${kes(reducing.totalInterest)}. The flat loan's true yearly rate is about ${flat.apr.toFixed(1)}%.`,
    },
    {
      q: "Is 1% a month the same as 12% a year?",
      a: `Only on a reducing balance. At 1% a month flat, KES 100,000 over 12 months costs ${kes(sacco.totalInterest)} in interest, a true yearly rate of about ${sacco.apr.toFixed(1)}%.`,
    },
    {
      q: "How do fees change what a loan costs?",
      a: "Fees taken at the start mean you receive less than you borrowed but repay the full amount; fees added each month raise every payment. The calculator counts both in the true yearly rate, so two offers with different fees can be compared on one number.",
    },
  ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "Loan true-cost calculator" }]}
      kicker="Borrowing · Kenya"
      title="What does this loan really cost?"
      lede={
        <p>
          Put in the rate and fees from any loan offer, from a bank, SACCO, chama or shop, and see its true yearly rate, what you pay each month, and how
          it compares with what banks charge on average.
        </p>
      }
    >
      <LoanCalculator benchmark={benchmark} />

      <section aria-labelledby="flat-table" className="mt-12">
        <SectionTitle kicker="Same number, different loan" title="14% flat is not 14%" />
        <div className="table-box mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Flat and reducing rates compared (scrolls sideways)">
          <table className="data-table">
            <thead>
              <tr>
                <th>KES 100,000 over</th>
                <th className="text-right">Interest at 14% reducing</th>
                <th className="text-right">Interest at 14% flat</th>
                <th className="text-right">True yearly rate of 14% flat</th>
              </tr>
            </thead>
            <tbody>
              {terms.map((m) => {
                const f = loanCost({ amount: 100000, rate: 14, unit: "year", basis: "flat", months: m });
                const r = loanCost({ amount: 100000, rate: 14, unit: "year", basis: "reducing", months: m });
                return (
                  <tr key={m}>
                    <th scope="row">{m} months</th>
                    <td data-num className="text-right">{Math.round(r.totalInterest).toLocaleString("en-US")}</td>
                    <td data-num className="text-right">{Math.round(f.totalInterest).toLocaleString("en-US")}</td>
                    <td data-num className="text-right font-semibold">{f.apr.toFixed(1)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-muted">
          KES, no fees. The true yearly rate is the monthly rate that matches what you receive with what you repay, times 12 (the usual APR convention).
          {benchmark ? (
            <>
              {" "}
              The banks’ average lending rate, {benchmark.rate.toFixed(2)}% in {benchmark.month}, is from the{" "}
              <a href={benchmark.source} className="underline underline-offset-2">
                Central Bank of Kenya
              </a>
              .
            </>
          ) : null}
        </p>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="Before you sign" title="Four questions for the lender" />
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] leading-6 text-ink-soft">
            <li>Is the rate flat or on the reducing balance?</li>
            <li>What fees come off at the start, and what is added each month?</li>
            <li>What is the APR, all charges included?</li>
            <li>What happens if I repay early, or pay late?</li>
          </ol>
        </div>
        <div>
          <SectionTitle kicker="Also see" title="More on what money costs" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>
              <Link href="/rates/kenya/mobile-loans" className="font-semibold text-forest underline underline-offset-2">
                What mobile loans really cost
              </Link>
            </li>
            <li>
              <Link href="/rates/kenya/loan-apps" className="font-semibold text-forest underline underline-offset-2">
                Is this loan app licensed?
              </Link>
            </li>
            <li>
              <Link href="/rates/kenya/net-salary" className="font-semibold text-forest underline underline-offset-2">
                Net salary calculator
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <FollowUp heading="Get the Morning: what money costs, every weekday" />
      <p className="mt-6 text-sm text-ink-soft">
        <em>Information, not advice.</em> Your loan agreement decides what you owe.
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
