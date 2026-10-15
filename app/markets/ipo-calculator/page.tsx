import type { Metadata } from "next";
import Link from "next/link";
import { IpoCalculator } from "@/components/data/IpoCalculator";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { FollowUp } from "@/components/ui/FollowUp";
import { loadIpoOffers } from "@/lib/data/ipo-offers";
import { latestByTenor, loadTbills } from "@/lib/data/kenya-tbills";
import { apply, scenario } from "@/lib/ipo-calc";
import { site } from "@/lib/site";
import { fitDescription, fitTitle } from "@/lib/seo";

export const revalidate = 3600;

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const longDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

export const metadata: Metadata = {
  title: fitTitle("IPO calculator Kenya: Quickmart and Dangote shares, what your money buys"),
  description: fitDescription(
    "How many Quickmart shares or Dangote receipts your money buys, what you get if the offer is scaled back, and what they are worth if the price opens higher or lower, next to a Treasury bill. Free, no sign-up.",
  ),
  alternates: { canonical: `${site.url}/markets/ipo-calculator` },
};

export default function IpoCalculatorPage() {
  const offers = loadIpoOffers();
  const latest = latestByTenor(loadTbills().rows).get(364)?.latest;
  const bill = latest ? { rate: latest.weighted_avg_rate, date: latest.value_date } : null;
  const q = offers.find((o) => o.id === "quickmart");
  const d = offers.find((o) => o.id === "dangote");
  const q20 = q ? apply(q, 20000) : null;

  const items = [
    ...(q && q20
      ? [
          {
            q: "How many Quickmart shares does KES 20,000 buy?",
            a: `${q20.units.toLocaleString("en-US")} shares at KES ${q.price.toFixed(2)}, for ${kes(q20.cost)}. The minimum is ${q.min_units} shares, ${kes(q.min_units * q.price)}. If the price opens 10% lower they are worth ${kes(scenario(q, q20.units, -10).value)}; 10% higher, ${kes(scenario(q, q20.units, 10).value)}. The offer closes on ${longDate(q.closes)}.`,
          },
        ]
      : []),
    ...(d
      ? [
          {
            q: "What is the minimum for the Dangote receipts in Kenya?",
            a: `${d.min_units} receipts at KES ${d.price.toFixed(2)}, ${kes(d.min_units * d.price)}, as reported by Business Today after the minimum was cut from 2,000. The Kenyan offer closes on ${longDate(d.closes)}.`,
          },
        ]
      : []),
    {
      q: "What happens if an IPO is oversubscribed?",
      a: "When buyers offer more money than there are shares, applications can be scaled back: you get a part of what you asked for and the rest of your money is refunded. The results announcement says what each applicant got.",
    },
  ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { href: "/markets", label: "Markets" }, { label: "IPO calculator" }]}
      kicker="Share offers · Kenya"
      title="What does your money buy in the IPO?"
      lede={
        <p>
          Pick an open offer and put in what you plan to spend. See how many shares you get, what comes back if the offer is scaled back, and what they are
          worth if the price opens higher or lower.
        </p>
      }
    >
      <IpoCalculator offers={offers} bill={bill} />

      <section aria-labelledby="offers" className="mt-12">
        <SectionTitle kicker="From our Receipts" title="The open offers" />
        <div className="table-box mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="Open offers (scrolls sideways)">
          <table className="data-table">
            <thead>
              <tr>
                <th>Offer</th>
                <th className="text-right">Price (KES)</th>
                <th className="text-right">Minimum</th>
                <th>Closes</th>
                <th>Trading</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <th scope="row">
                    <Link href={`/receipts/${o.receipt}`} className="underline underline-offset-2">
                      {o.name}
                    </Link>
                  </th>
                  <td data-num className="text-right">{o.price.toFixed(2)}</td>
                  <td data-num className="text-right">
                    {o.min_units.toLocaleString("en-US")} {o.units} ({Math.round(o.min_units * o.price).toLocaleString("en-US")})
                  </td>
                  <td>{longDate(o.closes)}</td>
                  <td>{o.trading ? `${longDate(o.trading)}, ${o.trading_note}` : o.trading_note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-muted">
          Terms as set out in each Receipt, which cites the offer documents, checked on {longDate(offers[0]?.checked ?? "2026-10-15")}.
          {bill ? ` The Treasury bill comparison uses the latest one-year auction from the Central Bank of Kenya.` : ""}
        </p>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="Before you apply" title="Four things to know" />
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] leading-6 text-ink-soft">
            <li>Who gets the money: the company, or owners who are selling?</li>
            <li>What you pay for each shilling of profit, on what the company actually earned.</li>
            <li>What the dividend pays after tax, next to a Treasury bill.</li>
            <li>The price can open lower than you paid. Only put in money you will not need soon.</li>
          </ol>
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
              <Link href="/rates/kenya/loan-cost" className="font-semibold text-forest underline underline-offset-2">
                Loan true-cost calculator
              </Link>
            </li>
            <li>
              <Link href="/receipts" className="font-semibold text-forest underline underline-offset-2">
                All Receipts
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <FollowUp heading="Get the Morning: what money costs, every weekday" />
      <p className="mt-6 text-sm text-ink-soft">
        <em>Information, not advice.</em> Afronomics and its founder hold no shares in either offer and earn nothing from them.
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
