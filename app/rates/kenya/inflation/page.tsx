import type { Metadata } from "next";
import Link from "next/link";
import { InflationCalculator } from "@/components/data/InflationCalculator";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { FollowUp } from "@/components/ui/FollowUp";
import { cpiIndex, loadCpi } from "@/lib/data/cpi";
import { loadKenyaRates } from "@/lib/data/kenya-rates";
import { loadTbills } from "@/lib/data/kenya-tbills";
import { billGrowth, worth, type BillRate, type DepositRate } from "@/lib/inflation";
import { site } from "@/lib/site";
import { toolDefaults } from "@/lib/tool-defaults";
import { fitDescription, fitTitle, withSocial } from "@/lib/seo";

export const revalidate = 3600;

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const monthLabel = (ym: string) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${ym}-01T00:00:00Z`));
const link = "font-semibold text-forest underline underline-offset-2";

export const metadata: Metadata = withSocial(
  {
    title: fitTitle("Kenya inflation calculator: what your shilling has lost since 2010"),
    description: fitDescription(
      "What KES 1,000 from any month since 2010 is worth in today's prices, how much prices rose in all and a year, and what the same money would have made in Treasury bills or a bank deposit. From KNBS's official CPI. Free, no sign-up.",
    ),
    alternates: { canonical: `${site.url}/rates/kenya/inflation` },
  },
  "/rates/kenya/inflation",
);

export default function InflationPage() {
  const file = loadCpi();
  const index = cpiIndex();
  const latest = index[index.length - 1].month;
  const bills: BillRate[] = loadTbills()
    .rows.filter((r) => r.tenor === 364)
    .map((r) => ({ date: r.value_date, rate: r.weighted_avg_rate }));
  const deposits: DepositRate[] = (loadKenyaRates().bank_rates?.rows ?? []).map((r) => ({ month: r.month, rate: r.deposit }));

  const from: string = toolDefaults.inflation.from;
  const ex = worth(1000, from, latest, index)!;
  const decade = worth(1000, `${Number(latest.slice(0, 4)) - 10}${latest.slice(4)}`, latest, index)!;
  const exBill = billGrowth(1000, from, latest, bills);

  const items = [
    {
      q: `What is KES 1,000 from 2015 worth today in Kenya?`,
      a: `KES 1,000 in ${monthLabel(from)} buys what ${kes(ex.value)} buys in ${monthLabel(latest)}: prices rose ${ex.cumulativePct.toFixed(0)}%, about ${ex.yearlyPct.toFixed(1)}% a year, on KNBS's consumer price index.`,
    },
    {
      q: "How much have prices risen in Kenya in the last ten years?",
      a: `${decade.cumulativePct.toFixed(0)}% from ${monthLabel(decade.from)} to ${monthLabel(latest)}, about ${decade.yearlyPct.toFixed(1)}% a year. A shilling buys ${decade.lostPct.toFixed(0)}% less than it did.`,
    },
    {
      q: "Did Treasury bills beat inflation?",
      a: exBill
        ? `KES 1,000 put in 364-day bills in ${monthLabel(from)} and rolled over every year would have grown to about ${kes(exBill)} after 15% tax by ${monthLabel(latest)}, against ${kes(ex.value)} needed to keep up with prices. The calculator checks any period from 2011.`
        : "The calculator compares rolled 364-day bills with prices for any period from 2011.",
    },
  ];

  return (
    <PageShell
      share={{ path: "/rates/kenya/inflation", campaign: "tool" }}
      crumbs={[{ href: "/", label: "Today" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "Inflation calculator" }]}
      kicker="Prices · Kenya"
      title="What your shilling has lost"
      lede={
        <p>
          Pick an amount and a month. See what it is worth in today’s prices, how fast prices rose, and whether a Treasury bill or a bank deposit would
          have kept up.
        </p>
      }
    >
      <InflationCalculator index={index} bills={bills} deposits={deposits} defaultFrom={from} />

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="How it works" title="Official prices, one index" />
          <div className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <p>
              Prices are the Kenya National Bureau of Statistics’ consumer price index (CPI), the figure behind the inflation rate in the news. We divide the
              later month’s index by the earlier one’s: if it rose 50%, you need KES 1,500 to buy what KES 1,000 bought.
            </p>
            <p>
              KNBS rebased the CPI in March 2020 to a new basket (330 items, weights from the 2015/16 household budget survey) with February 2019 = 100. From
              February 2019 we use the new index as KNBS publishes it. Before that we use the old index (February 2009 = 100), scaled so the two meet in
              February 2019, the one month both cover ({file.previous.levels.find((l) => l.month === file.link_month)?.index} on the old base, 100 on
              the new). So any change before February 2019 comes from the old basket, and any change after it from the new one.
            </p>
            <p>
              The old index’s monthly levels before February 2018 are worked back from KNBS’s official 12-month inflation rates, as tabled by the Central
              Bank of Kenya. The releases we use do not print the new index for March 2019 to January 2020, so those months are worked back the same way from the
              12-month rates it printed a year later. KNBS revised its first rebased figures (March 2020 went from 106.53 to 107.48); we use the revised
              ones, which the CBK’s table also follows. Rates are published to two decimals, so very old comparisons can be a few shillings in a thousand
              out.
            </p>
            <p>
              The Treasury bill line buys a 364-day bill on the 1st of the month at the latest auction’s average rate and buys a new one each time it
              matures; the deposit line earns the CBK’s average bank deposit rate each month. Both are after the 15% tax on interest. Checked{" "}
              {file.checked}.
            </p>
          </div>
        </div>
        <div>
          <SectionTitle kicker="Sources" title="Where the numbers come from" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            {file.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} className={link} target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
              </li>
            ))}
            <li>
              <Link href="/markets/kenya-tbills" className={link}>
                Treasury bill auctions
              </Link>{" "}
              and{" "}
              <Link href="/rates/kenya" className={link}>
                bank deposit rates
              </Link>
              , from the Central Bank of Kenya
            </li>
          </ul>
          <SectionTitle kicker="Also see" title="More money tools" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>
              <Link href="/rates/kenya/savings-goal" className={link}>
                Savings goal planner
              </Link>
            </li>
            <li>
              <Link href="/markets/kenya-tbills/calculator" className={link}>
                Treasury bill calculator
              </Link>
            </li>
            <li>
              <Link href="/rates/kenya/net-salary" className={link}>
                Net salary calculator
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <FollowUp heading="Get the Morning: what money costs, every weekday" />
      <p className="mt-6 text-sm text-ink-soft">
        <em>Information, not advice.</em> Past rates and prices do not tell you future ones.
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
