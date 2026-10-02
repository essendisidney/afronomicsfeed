import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutNotice } from "@/components/billing/CheckoutNotice";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { paystackConfigured } from "@/lib/billing/paystack";
import { chargeLabel } from "@/lib/billing/plans";
import { pricing, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing — open data, Pro from KES 1,500 a month",
  description:
    "Every number on Afronomics is free to read and cite. Pro (KES 1,500, about $12 a month) adds the Morning note, auction alerts and the full data API; Team and Enterprise add seats and licensed feeds. Paid by M-Pesa or card.",
  alternates: { canonical: `${site.url}/pricing` },
};

const rows: Array<[string, boolean | string, boolean | string, boolean | string, boolean | string]> = [
  ["The Wire: headlines from African publishers", true, true, true, true],
  ["54 country files with 22 series and history", true, true, true, true],
  ["T-bill monitor for ten markets, auction pages and the Sovereign Bill Index", true, true, true, true],
  ["Data hub rankings and CSV downloads", true, true, true, true],
  ["The Afronomics Weekly newsletter", true, true, true, true],
  ["The Morning note, every weekday before 07:30 Nairobi", "On the site", "By email", "By email", "By email"],
  ["Auction alerts the moment each market reports", "On your phone", "Email and phone", "Email and phone", "Email and webhook"],
  ["Data API", "5-minute cache, attribution", "Full field set", "Full field set, bulk history", "Licensed, redistributable"],
  ["Full briefs, weekly analysis and explainers", "Summaries", true, true, true],
  ["Seats", "1", "1", "5", "Unlimited"],
  ["Bulk exports and dataset requests", false, false, true, true],
  ["Licensed feeds, embeds and white-label files", false, false, false, true],
  ["Commissioned research", false, false, false, true],
];

function cell(value: boolean | string) {
  if (value === true) return <span className="text-up">✓</span>;
  if (value === false) return <span className="text-muted">—</span>;
  return <span className="text-xs text-ink-soft">{value}</span>;
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; reference?: string; trxref?: string }>;
}) {
  const query = await searchParams;
  const live = paystackConfigured();
  const tiers = [pricing.free, pricing.pro, pricing.professional, pricing.enterprise];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Pricing" }]}
      kicker="Pricing"
      title="Open data. Paid depth. Priced for Africa."
      lede={
        <p>
          Every number, headline and country file on Afronomics is free to read and cite. Pro costs what a Nairobi analyst would spend on
          two lunches, and it is the same price for a desk in London or Lagos: KES 1,500 a month, about $12, paid by M-Pesa, card or bank
          transfer.
        </p>
      }
    >
      <CheckoutNotice query={query} />

      <div className="grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => {
          const highlight = tier.name === pricing.pro.name;
          return (
            <div key={tier.name} className={`flex flex-col px-5 py-6 ${highlight ? "bg-night on-night" : "bg-surface"}`}>
              <p className={`text-[12px] font-semibold ${highlight ? "text-accent" : "text-gold"}`}>{tier.name}</p>
              <p className={`mt-3 font-serif text-4xl ${highlight ? "text-night-ink" : "text-ink"}`}>
                {tier.name === pricing.pro.name ? chargeLabel("pro") : tier.name === pricing.professional.name ? chargeLabel("professional") : tier.price}
                <span className={`text-base ${highlight ? "text-night-soft" : "text-muted"}`}>{tier.period}</span>
              </p>
              <p className={`mt-3 flex-1 text-sm leading-6 ${highlight ? "text-night-soft" : "text-ink-soft"}`}>{tier.detail}</p>
              <div className="mt-6">
                {tier.name === pricing.free.name ? (
                  <Link href="/subscribe" className="block rounded-full border border-ink/20 px-4 py-3 text-center text-[13px] font-semibold text-ink hover:border-accent">
                    Get the Morning, free
                  </Link>
                ) : tier.name === pricing.pro.name && live ? (
                  <PaystackCheckout plan="pro" label={`Subscribe · ${chargeLabel("pro")}/mo`} variant="accent" />
                ) : tier.name === pricing.professional.name && live ? (
                  <PaystackCheckout plan="professional" label={`Subscribe · ${chargeLabel("professional")}/mo`} variant="ghost" />
                ) : (
                  <Link
                    href={`/contact?interest=${tier.name === pricing.enterprise.name ? "licensing" : "access"}#enquiry`}
                    className={`block rounded-full px-4 py-3 text-center text-[13px] font-semibold ${highlight ? "bg-accent text-night" : "border border-ink/20 text-ink hover:border-accent"}`}
                  >
                    {tier.name === pricing.enterprise.name ? "Talk to us" : "Request access"}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {live ? (
        <div className="mt-6 grid gap-6 rounded-2xl border border-accent/40 bg-surface px-5 py-5 md:grid-cols-[1fr_20rem] md:items-end">
          <div>
            <p className="text-[12px] font-semibold text-accent">{pricing.trial.name}</p>
            <p className="mt-2 font-serif text-2xl text-ink">{chargeLabel("trial")} for 14 days</p>
            <p className="mt-1 text-sm text-ink-soft">{pricing.trial.detail}</p>
          </div>
          <PaystackCheckout plan="trial" label={`Start the trial · ${chargeLabel("trial")}`} variant="primary" />
        </div>
      ) : null}

      <p className="mt-4 text-xs text-muted">
        Prices in Kenyan shillings; cards in any currency are converted at checkout. Annual billing takes two months off. Institutions wanting the{" "}
        <Link href="/pack" className="underline underline-offset-2">
          Investment Committee Pack
        </Link>{" "}
        or a{" "}
        <Link href="/licensing" className="underline underline-offset-2">
          data licence
        </Link>{" "}
        have their own pages; the{" "}
        <Link href="/prices" className="underline underline-offset-2">
          full price guide
        </Link>{" "}
        lists everything, including sponsorships, training, benchmarking and research.
      </p>

      <section className="mt-14">
        <SectionTitle kicker="Compare" title="What each plan includes" />
        <div className="overflow-x-auto">
          <table className="data-table mt-4">
            <thead>
              <tr>
                <th>Feature</th>
                {tiers.map((tier) => (
                  <th key={tier.name} className="text-center">
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, ...values]) => (
                <tr key={label}>
                  <td className="text-sm">{label}</td>
                  {values.map((value, index) => (
                    <td key={index} className="text-center">
                      {cell(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14 grid gap-8 md:grid-cols-3">
        {[
          [
            "Why this cheap",
            "A Bloomberg terminal costs more each month than most African analysts earn. Afronomics is built by software from public central-bank results, so the price can be set for the people who use it most: analysts, treasurers, fund managers and journalists on the continent. A desk in New York pays the same.",
          ],
          [
            "Paying from Africa",
            live
              ? "M-Pesa, Kenyan and Nigerian cards, bank transfer and any Visa or Mastercard, through Paystack. Teams and institutions can be invoiced in KES or USD instead."
              : "Invoiced in USD or KES, payable by bank transfer or M-Pesa. Request access and the desk sends an invoice within one business day.",
          ],
          ["Citing our data", "Free with attribution: “Source: Afronomics, compiled from [publisher]”. Every CSV and API response carries its source lines."],
        ].map(([title, body]) => (
          <div key={title}>
            <h3 className="font-serif text-xl">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{body}</p>
          </div>
        ))}
      </section>
    </PageShell>
  );
}
