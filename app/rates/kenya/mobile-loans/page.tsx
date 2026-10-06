import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { Questions } from "@/components/seo/Questions";
import { SectionTitle } from "@/components/data/parts";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { ShareResult } from "@/components/ui/ShareResult";
import { fairBench } from "@/lib/data/kenya-rates";
import { mobileLoanBoard } from "@/lib/data/mobile-loans";
import { mobileLoanAnswers } from "@/lib/seo/answers";
import { mobileSentence } from "@/lib/share-card";
import { site } from "@/lib/site";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const { title, description } = mobileLoanAnswers();
  return { title, description, alternates: { canonical: `${site.url}/rates/kenya/mobile-loans` } };
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const kes = (n: number) => `KES ${n.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;

export default function MobileLoansPage() {
  const loans = mobileLoanBoard();
  const bench = fairBench();
  const bankMonth = bench ? (1000 * bench.lendingAvg * 30) / 365 / 100 : null;
  const cheapest = loans[0];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "Mobile loans" }]}
      kicker="Afronomics comparison · Kenya"
      title="What a mobile loan really costs"
      lede={
        <p>
          Mobile loans are quick and need no paperwork. Their price is quoted per month or per day, which makes it hard to compare with a bank. Here
          is each provider’s own published charge, the shillings it costs to borrow KES 1,000 for a month, and that charge as a yearly rate.
        </p>
      }
      aside={
        cheapest && bench ? (
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-medium text-muted">Borrow KES 1,000 for 30 days</p>
            <p className="mt-1 font-serif text-3xl text-ink">
              {kes(cheapest.costPer1000)}
              {cheapest.from ? "+" : ""}
            </p>
            <p className="mt-1 text-[14px] text-ink">{cheapest.product}, the lowest published charge here</p>
            <p className="mt-1 text-[12px] text-muted">About {kes(bankMonth!)} at the bank lending average of {bench.lendingAvg.toFixed(2)}% a year</p>
          </div>
        ) : null
      }
    >
      <section>
        <SectionTitle
          kicker="Compared"
          title="The same KES 1,000, for a month"
          note="Charges as each provider publishes them. A yearly rate is the month’s charge × 365 ÷ 30, without compounding, so it can be set beside a bank’s rate."
        />
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Loan</th>
                <th>What the provider publishes</th>
                <th className="text-right">KES 1,000 for 30 days costs</th>
                <th className="text-right">As a yearly rate</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((l) => (
                <tr key={l.product}>
                  <td>
                    <a href={l.source} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-forest">
                      {l.product}
                    </a>
                    <span className="block text-[11px] text-muted">
                      {l.provider} · read {dateFmt.format(new Date(l.read_on))}
                    </span>
                  </td>
                  <td className="max-w-md text-xs italic text-ink-soft">“{l.as_published}”</td>
                  <td className="text-right font-semibold">
                    {l.from ? "from " : ""}
                    {kes(l.costPer1000)}
                  </td>
                  <td className="text-right">
                    {l.from ? "from " : ""}
                    {l.yearlySimple.toFixed(0)}%
                  </td>
                </tr>
              ))}
              {bench ? (
                <tr className="bg-paper-2">
                  <td>
                    <Link href="/rates/kenya" className="font-medium hover:text-forest">
                      Benchmark: bank loan, industry average
                    </Link>
                    <span className="block text-[11px] text-muted">Central Bank of Kenya, {bench.asOf}</span>
                  </td>
                  <td className="text-xs text-ink-soft">Weighted average lending rate across commercial banks</td>
                  <td className="text-right font-semibold">{kes(bankMonth!)}</td>
                  <td className="text-right">{bench.lendingAvg.toFixed(2)}%</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
          Fuliza is usually repaid within days: on a KES 1,000 balance it costs KES 10 once, then KES 6 for each day it stays unpaid, so a week
          costs KES 52. A provider that says “starting at” or “from” charges some borrowers more; the figure shown is the lowest it publishes. Repaying early, late
          fees and rollovers change what you pay; read the provider’s own terms. A bank loan needs time, a credit check and often security; a mobile
          loan is quicker but costs more. This is information, not advice.
        </p>
        {cheapest && bench ? <ShareResult spec={{ kind: "mobile" }} text={`${mobileSentence(cheapest, bench.lendingAvg)}. Compare every provider:`} /> : null}
      </section>

      <section className="mt-12 max-w-3xl">
        <SectionTitle kicker="Before you borrow" title="Three questions" />
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-7 text-ink-soft">
          <li>How many shillings will I repay in total, and on what date?</li>
          <li>What happens if I am a day late: is there a fee, and does the loan roll over?</li>
          <li>Could a SACCO, chama or bank lend the same amount for less, if I can wait a few days?</li>
        </ol>
        <p className="mt-4 text-sm">
          Offered a loan with a different price?{" "}
          <Link href="/rates/kenya/check" className="font-medium text-forest underline underline-offset-2">
            Check it against the bank average
          </Link>
          .
        </p>
      </section>

      <CiteBlock title="What a mobile loan really costs in Kenya" path="/rates/kenya/mobile-loans" publisher="the providers’ published charges and the Central Bank of Kenya" />
      <Questions items={mobileLoanAnswers().items} />
      <NewsletterBand />
    </PageShell>
  );
}
