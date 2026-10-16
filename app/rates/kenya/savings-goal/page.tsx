import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SavingsGoalPlanner } from "@/components/data/SavingsGoalPlanner";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { FollowUp } from "@/components/ui/FollowUp";
import { savingsDates, savingsPlaces } from "@/lib/savings-places";
import { plan } from "@/lib/savings-goal";
import { site } from "@/lib/site";
import { fitDescription, fitTitle, withSocial } from "@/lib/seo";

export const revalidate = 3600;

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;

export const metadata: Metadata = withSocial(
  {
    title: fitTitle("Savings goal planner Kenya: how much to save each month, and where"),
    description: fitDescription(
      "School fees, rent, a plot or an emergency fund: put in the goal and the date, and see what to save each month in a money market fund, a bank deposit or a savings account, at today's after-tax rates. Free, no sign-up.",
    ),
    alternates: { canonical: `${site.url}/rates/kenya/savings-goal` },
  },
  "/rates/kenya/savings-goal",
);

export default function SavingsGoalPage() {
  const p = savingsPlaces();
  const { today, defaultBy } = savingsDates();
  const year = plan(100000, 0, 12, p);

  const items = [
    {
      q: "How much should I save each month to have KES 100,000 in a year?",
      a: `About ${kes(year[0].monthly)} a month in ${year[0].place.short ?? year[0].place.name} at today's after-tax rate, against ${kes(100000 / 12)} if the money earns nothing. The planner works it out for any goal and date.`,
    },
    {
      q: "Where should I keep money I am saving for school fees?",
      a: "Somewhere you can reach on the date and that pays more than inflation after tax. On the rates we track, money market funds currently pay more than bank savings accounts and pay out in a few days; a fixed deposit locks the money for its term. Rates change, so check them before you choose.",
    },
    {
      q: "Can I save monthly in Treasury bills?",
      a: "Not easily: a Treasury bill needs at least KES 50,000 of face value at once. One way is to build up the amount in a money market fund first, then buy a bill.",
    },
  ];

  return (
    <PageShell
      share={{ path: "/rates/kenya/savings-goal", campaign: "tool" }}
      crumbs={[{ href: "/", label: "Today" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "Savings goal planner" }]}
      kicker="Saving · Kenya"
      title="How much do you need to save each month?"
      lede={
        <p>
          School fees, rent, a plot, an emergency fund. Put in the goal and the date, and see what to put away each month, and where your money works
          hardest, at today’s rates after tax.
        </p>
      }
    >
      <SavingsGoalPlanner places={p} today={today} defaultBy={defaultBy} />

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="Where the rates come from" title="Today’s rates, after tax" />
          <p className="mt-4 text-[14px] leading-6 text-ink-soft">
            Money market fund yields are each manager’s own published figure; bank rates are the Central Bank of Kenya’s averages. All are shown after the
            15% withholding tax on interest. See every fund and bank rate on{" "}
            <Link href="/rates/kenya" className="font-semibold text-forest underline underline-offset-2">
              Kenya rates compared
            </Link>
            . SACCOs pay their dividends and deposit interest once a year, so they are compared separately on{" "}
            <Link href="/rates/kenya/saccos" className="font-semibold text-forest underline underline-offset-2">
              SACCO rates
            </Link>
            .
          </p>
        </div>
        <div>
          <SectionTitle kicker="Also see" title="More money tools" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>
              <Link href="/markets/kenya-tbills/calculator" className="font-semibold text-forest underline underline-offset-2">
                Treasury bill calculator
              </Link>
            </li>
            <li>
              <Link href="/rates/kenya/net-salary" className="font-semibold text-forest underline underline-offset-2">
                Net salary calculator
              </Link>
            </li>
            <li>
              <Link href="/rates/kenya/mpesa-charges" className="font-semibold text-forest underline underline-offset-2">
                M-PESA and Fuliza charges
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <FollowUp heading="Get the Morning: what money costs, every weekday" />
      <p className="mt-6 text-sm text-ink-soft">
        <em>Information, not advice.</em> Fund yields are not guaranteed.
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
