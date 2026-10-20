import type { Metadata } from "next";
import Link from "next/link";
import { DebtPlanner } from "@/components/data/DebtPlanner";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { FollowUp } from "@/components/ui/FollowUp";
import { comparePlans, monthlyRate } from "@/lib/debt-plan";
import { debtPresets } from "@/lib/debt-presets";
import { site } from "@/lib/site";
import { fitDescription, fitTitle, withSocial } from "@/lib/seo";
import { toolDefaults as D } from "@/lib/tool-defaults";

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;

export const metadata: Metadata = withSocial(
  {
    title: fitTitle("Debt payoff planner Kenya: Fuliza, M-Shwari and loans in one plan"),
    description: fitDescription(
      "Put in every debt you carry, Fuliza, mobile loans, bank and SACCO loans, and what you can pay each month: see the order to clear them, the month you are debt-free and what the charges cost. Free, no sign-up.",
    ),
    alternates: { canonical: `${site.url}/rates/kenya/debt-plan` },
  },
  "/rates/kenya/debt-plan",
);

export default function DebtPlanPage() {
  const presets = debtPresets();
  const has = (id: string) => presets.some((p) => p.id === id && p.charge);
  const initial = D.debtPlan.debts
    .filter((d) => has(d.preset))
    .map((d) => ({ name: presets.find((p) => p.id === d.preset)!.label, preset: d.preset, balance: String(d.balance), rate: "", minimum: d.minimum ? String(d.minimum) : "" }));

  // The worked examples on the page, from the same data and the same arithmetic as the planner.
  const fuliza = presets.find((p) => p.id === "fuliza")?.charge ?? null;
  const fulizaRows = fuliza ? [300, 1000, 2000, 5000].map((b) => ({ b, cost: (monthlyRate(fuliza, b) * b) / 100, rate: monthlyRate(fuliza, b) })) : [];
  const example = comparePlans(
    initial.map((r) => ({ name: r.name, balance: Number(r.balance), minimum: Number(r.minimum || 0), charge: presets.find((p) => p.id === r.preset)!.charge! })),
    D.debtPlan.budget,
  );
  const best = example.find((p) => p.feasible);

  const items = [
    {
      q: "Which debt should I pay off first?",
      a: "On cost alone, the one whose charges are the biggest share of what you owe: pay the minimums on everything, then put every spare shilling on that one. Small Fuliza and mobile-loan balances usually come first, because their fees are a large share of a small amount. Paying the smallest balance first costs a little more but clears a debt sooner; the planner shows both.",
    },
    {
      q: "How much does Fuliza cost if I carry it for a month?",
      a: fulizaRows.length
        ? `At Safaricom's published daily fees, a KES ${fulizaRows[2].b.toLocaleString("en-US")} balance carried for 30 days costs about ${kes(fulizaRows[2].cost)}, ${fulizaRows[2].rate.toFixed(0)}% of the balance, before the 1% access fee.`
        : "Fuliza charges a 1% access fee and a daily fee by balance band; see the M-PESA and Fuliza calculator.",
    },
    {
      q: "Is it better to borrow from a bank or SACCO to clear mobile loans?",
      a: "It can cost less, because a bank or SACCO loan's yearly rate is usually far below what a mobile loan costs for a month. Compare the two with the loan true-cost calculator first, and count the new loan's fees. This is information, not advice: your own circumstances decide.",
    },
  ];

  return (
    <PageShell
      share={{ path: "/rates/kenya/debt-plan", campaign: "tool" }}
      crumbs={[{ href: "/", label: "Today" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "Debt payoff planner" }]}
      kicker="Borrowing · Kenya"
      title="Which debt should you pay first?"
      lede={
        <p>
          Put in everything you owe, Fuliza, M-Shwari, a loan app, a bank or SACCO loan, and what you can pay each month. See the order to clear them,
          when you are debt-free, and what the charges cost you on the way.
        </p>
      }
    >
      <DebtPlanner presets={presets} initial={initial} initialBudget={D.debtPlan.budget} />

      {fulizaRows.length ? (
        <section aria-labelledby="fuliza-month" className="mt-12">
          <SectionTitle kicker="Why small debts come first" title="What a Fuliza balance costs if it stays a month" />
          <div className="table-box mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Fuliza charges for 30 days (scrolls sideways)">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Balance carried 30 days</th>
                  <th className="text-right">Daily fees</th>
                  <th className="text-right">Share of the balance</th>
                </tr>
              </thead>
              <tbody>
                {fulizaRows.map((r) => (
                  <tr key={r.b}>
                    <th scope="row">{kes(r.b)}</th>
                    <td data-num className="text-right">
                      {kes(r.cost)}
                    </td>
                    <td data-num className="text-right font-semibold">
                      {r.rate.toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13px] leading-5 text-muted">
            Safaricom&rsquo;s published daily maintenance fees, excise duty included, for 30 days; the one-off 1% access fee is extra.{" "}
            <a href={presets.find((p) => p.id === "fuliza")?.source} className="underline underline-offset-2">
              Source: Safaricom
            </a>
            . {best ? `The planner opens with ${initial.map((r) => `${r.name} ${kes(Number(r.balance))}`).join(", ")} and ${kes(D.debtPlan.budget)} a month: debt-free in ${best.months} months.` : ""}
          </p>
        </section>
      ) : null}

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="Where the charges come from" title="Every rate is published" />
          <ul className="mt-4 space-y-2 text-[14px] leading-6 text-ink-soft">
            {presets
              .filter((p) => p.charge)
              .map((p) => (
                <li key={p.id}>
                  <span className="font-semibold text-ink">{p.label}:</span> {p.note}{" "}
                  {p.source ? (
                    <a href={p.source} className="underline underline-offset-2">
                      Source
                    </a>
                  ) : null}
                </li>
              ))}
          </ul>
        </div>
        <div>
          <SectionTitle kicker="Also see" title="Before you borrow again" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>
              <Link href="/rates/kenya/mobile-loans" className="font-semibold text-forest underline underline-offset-2">
                What mobile loans really cost
              </Link>
            </li>
            <li>
              <Link href="/rates/kenya/loan-cost" className="font-semibold text-forest underline underline-offset-2">
                Loan true-cost calculator
              </Link>
            </li>
            <li>
              <Link href="/rates/kenya/loan-apps" className="font-semibold text-forest underline underline-offset-2">
                Is this loan app licensed?
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <FollowUp heading="Get the Morning: what money costs, every weekday" />
      <p className="mt-6 text-sm text-ink-soft">
        <em>Information, not advice.</em> Your loan agreements decide what you owe. If debt is overwhelming, speak to your lender before you miss a
        payment.
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
