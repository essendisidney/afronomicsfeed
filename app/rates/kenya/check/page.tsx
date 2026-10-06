import type { Metadata } from "next";
import Link from "next/link";
import { FairRate } from "@/components/data/FairRate";
import { PageShell } from "@/components/data/PageShell";
import { fairBench } from "@/lib/data/kenya-rates";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Is my rate fair? — check a Kenya savings or loan rate against the published benchmarks",
  description:
    "Type the interest rate a bank, SACCO, fund or lender offered you and see how it compares with the Treasury bill, the best published money market fund after tax, and the Central Bank's averages for what banks pay and charge — with the gap in shillings.",
  alternates: { canonical: `${site.url}/rates/kenya/check` },
};

export default function FairRatePage() {
  const bench = fairBench();
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "Is my rate fair?" }]}
      kicker="Fair-rate check · Kenya"
      title="Is the rate you were offered fair?"
      lede={
        <p>
          A saver who knows the government pays {bench ? `${bench.bill364Gross.toFixed(2)}%` : "about 9%"} on a one-year bill can judge the 6% a bank
          offers. A borrower who knows banks charge {bench ? `${bench.lendingAvg.toFixed(2)}%` : "about 14%"} on average can judge the 24% a lender
          quotes. Type yours; the comparison uses only published figures and puts the gap in shillings.
        </p>
      }
    >
      {bench ? <FairRate bench={bench} /> : <p className="text-sm text-ink-soft">Benchmarks are loading.</p>}
      <section className="mt-12 grid gap-8 md:grid-cols-3 text-sm leading-6 text-ink-soft">
        <div>
          <h3 className="font-serif text-xl text-ink">Where the benchmarks come from</h3>
          <p className="mt-2">
            Treasury bill rates from the Central Bank of Kenya’s auction results; fund yields from each manager’s own published figure; bank deposit, savings
            and lending averages from the Central Bank’s monthly weighted averages across all banks. All on the{" "}
            <Link href="/rates/kenya" className="underline underline-offset-2">
              comparison page
            </Link>
            .
          </p>
        </div>
        <div>
          <h3 className="font-serif text-xl text-ink">What “fair” means here</h3>
          <p className="mt-2">For savings: near or above what the government itself pays, after tax. For loans: near or below the average bank rate. It is a yardstick, not a judgement of any institution; fees, flexibility and risk are yours to weigh.</p>
        </div>
        <div>
          <h3 className="font-serif text-xl text-ink">Share it</h3>
          <p className="mt-2">Forward this page to anyone being quoted a rate. It works on any phone, and the benchmarks update as each auction and monthly average is published.</p>
          <p className="mt-2">
            Also for{" "}
            <Link href="/rates/nigeria/check" className="underline underline-offset-2">
              Nigeria
            </Link>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
}
