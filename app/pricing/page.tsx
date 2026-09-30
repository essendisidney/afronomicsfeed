import type { Metadata } from "next";
import Link from "next/link";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";
import { PageShell } from "@/components/data/PageShell";
import { paystackConfigured, verifyTransaction } from "@/lib/billing/paystack";
import { chargeLabel } from "@/lib/billing/plans";
import { pricing, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Afronomics is open for data and headlines. Pro unlocks full analysis; Team and Enterprise add seats, bulk data and licensed feeds.",
  alternates: { canonical: `${site.url}/pricing` },
};

const rows: Array<[string, boolean | string, boolean | string, boolean | string, boolean | string]> = [
  ["The Wire: headlines from African publishers", true, true, true, true],
  ["54 country files with 22 series and history", true, true, true, true],
  ["Data hub rankings and CSV downloads", true, true, true, true],
  ["World Bank pipeline and capital tracker", true, true, true, true],
  ["The Afronomics Weekly newsletter", true, true, true, true],
  ["Full briefs, weekly analysis and explainers", "Summaries", true, true, true],
  ["Country and indicator email alerts", false, "As they launch", "As they launch", true],
  ["Seats", "1", "1", "5", "Unlimited"],
  ["Bulk exports and dataset requests", false, false, true, true],
  ["Licensed feeds, embeds and white-label files", false, false, false, true],
  ["Commissioned research", false, false, false, true],
];

function cell(value: boolean | string) {
  if (value === true) return <span className="text-forest">✓</span>;
  if (value === false) return <span className="text-muted">—</span>;
  return <span className="text-xs text-ink-soft">{value}</span>;
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; reference?: string; trxref?: string }>;
}) {
  const query = await searchParams;
  const reference = query.reference ?? query.trxref;
  const payment = query.checkout === "returned" && reference ? await verifyTransaction(reference) : null;
  const live = paystackConfigured();
  const contact = (subject: string) => `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}`;
  const tiers = [pricing.free, pricing.pro, pricing.professional, pricing.enterprise];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Pricing" }]}
      kicker="Pricing"
      title="Open data. Paid depth."
      lede={
        <p>
          Every number, headline and country file on Afronomics is free to read and cite. Subscriptions pay for the analysis, the alerts and the
          licensed data that institutions build on.
        </p>
      }
    >
      {query.checkout === "returned" ? (
        payment?.status === "success" ? (
          <p className="mb-8 border border-forest/40 bg-paper-2 px-4 py-3 text-sm text-ink">
            Payment confirmed — thank you. Reference <span className="font-mono">{payment.reference}</span>. Your access is sent to {payment.email}{" "}
            within one business day; reply to the Paystack receipt if you need it sooner.
          </p>
        ) : (
          <p className="mb-8 border border-gold/40 bg-paper-2 px-4 py-3 text-sm text-ink">
            We couldn’t confirm a completed payment{reference ? ` for reference ${reference}` : ""}. If you were charged, email{" "}
            <a className="underline" href={`mailto:${site.contactEmail}?subject=Payment`}>
              {site.contactEmail}
            </a>{" "}
            with the reference and we’ll sort it out.
          </p>
        )
      ) : null}

      <div className="grid gap-px bg-rule md:grid-cols-2 lg:grid-cols-4">
        {tiers.map((tier) => (
          <div key={tier.name} className="flex flex-col bg-paper px-5 py-6">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{tier.name}</p>
            <p className="mt-3 font-serif text-4xl text-ink">
              {tier.name === pricing.pro.name ? chargeLabel("pro") : tier.name === pricing.professional.name ? chargeLabel("professional") : tier.price}
              <span className="text-base text-muted">{tier.period}</span>
            </p>
            <p className="mt-3 flex-1 text-sm leading-6 text-ink-soft">{tier.detail}</p>
            <div className="mt-6">
              {tier.name === pricing.free.name ? (
                <Link href="/subscribe" className="block bg-forest px-4 py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-paper hover:bg-forest-mid">
                  Get the weekly
                </Link>
              ) : tier.name === pricing.pro.name && live ? (
                <PaystackCheckout plan="pro" label={`Subscribe · ${chargeLabel("pro")}/mo`} />
              ) : tier.name === pricing.professional.name && live ? (
                <PaystackCheckout plan="professional" label={`Subscribe · ${chargeLabel("professional")}/mo`} variant="ghost" />
              ) : (
                <a
                  href={contact(`Afronomics ${tier.name}`)}
                  className="block border border-ink/20 px-4 py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-ink hover:border-gold"
                >
                  {tier.name === pricing.enterprise.name ? "Talk to us" : "Request access"}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {live ? (
        <div className="mt-8 grid gap-6 border border-gold/40 bg-paper-2 px-5 py-5 md:grid-cols-[1fr_20rem] md:items-end">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">{pricing.trial.name}</p>
            <p className="mt-2 font-serif text-2xl text-ink">{pricing.trial.price} for 14 days</p>
            <p className="mt-1 text-sm text-ink-soft">{pricing.trial.detail}</p>
          </div>
          <PaystackCheckout plan="trial" label={`Start trial · ${chargeLabel("trial")}`} variant="secondary" />
        </div>
      ) : null}

      <section className="mt-14">
        <h2 className="border-b border-rule pb-2 font-serif text-2xl">What each plan includes</h2>
        <div className="overflow-x-auto">
          <table className="data-table">
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
          ["Who subscribes", "Investors, banks, DFIs, climate funds, corporates and advisers who need a defensible view of African markets."],
          ["Paying from Africa", "Kenyan and Nigerian cards, M-Pesa and bank transfer through Paystack. Invoices in USD or KES for teams."],
          ["Citing our data", "Free with attribution: “Source: Afronomics, compiled from [publisher]”. Every CSV carries its source lines."],
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
