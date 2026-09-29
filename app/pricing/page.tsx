import type { Metadata } from "next";
import Link from "next/link";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";
import { PageHeader } from "@/components/ui/PageHeader";
import { entitlementRows } from "@/lib/demo/entitlements";
import { pricing } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Afronomics Free, Pro ($29), Professional ($149) and Enterprise. Kenya desk trial KES 500. Paystack opens only when the secret is set.",
};

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const query = await searchParams;
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Pricing"
        title="Free for the habit. Paid for the file."
        lede="Headlines and country shells stay open. Depth, exports, alerts and Ask sit on a seat. Paystack can open a hosted page. A charge does not open a seat until the payer has an account."
      />

      <div className="mt-10 grid gap-6 border-t border-rule pt-10 sm:grid-cols-3">
        <div>
          <h2 className="font-serif text-xl">Who pays</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Investors, banks, DFIs, climate funds, corporates and consultants who need a
            defensible African file — not a news river.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-xl">What they buy</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Structured capital, climate and country intelligence, alerts, and later API
            allowance. Not a tip. Not a live tape.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-xl">Who should not</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Anyone looking for buy/sell language or invented GDP. That reader will bounce.
            That is intended.
          </p>
        </div>
      </div>

      {query.checkout === "returned" ? (
        <p className="mt-8 border border-rule px-4 py-3 text-sm text-ink-soft">
          Paystack sent the browser back. The seat stays closed until the webhook verifies the charge and an account exists.
        </p>
      ) : null}

      <div className="mt-12 border border-gold/40 bg-gold/10 px-5 py-5">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">Kenya desk trial</p>
        <p className="mt-2 font-serif text-2xl text-ink">
          {pricing.trial.price} → {pricing.trial.name}
        </p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">{pricing.trial.detail}</p>
        <div className="mt-5 max-w-xs">
          <PaystackCheckout plan="trial" label="Start trial — KES 500 via Paystack" variant="secondary" />
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-4">
        <article className="flex flex-col border border-rule p-6">
          <h2 className="font-serif text-2xl">{pricing.free.name}</h2>
          <p className="mt-3 font-serif text-3xl">{pricing.free.price}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{pricing.free.cadence}</p>
          <p className="mt-4 flex-1 text-sm leading-6 text-ink-soft">{pricing.free.detail}</p>
          <Link
            href="/brief"
            className="mt-6 border border-ink/20 px-4 py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em]"
          >
            Read the Brief
          </Link>
        </article>

        <article className="flex flex-col border border-forest bg-paper-2 p-6">
          <h2 className="font-serif text-2xl">{pricing.pro.name}</h2>
          <p className="mt-3 font-serif text-3xl">
            {pricing.pro.price}
            <span className="text-lg text-muted">{pricing.pro.period}</span>
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{pricing.pro.cadence}</p>
          <p className="mt-4 flex-1 text-sm leading-6 text-ink-soft">{pricing.pro.detail}</p>
          <div className="mt-6">
            <PaystackCheckout plan="pro" label="Pay $29 / mo with Paystack" />
          </div>
        </article>

        <article className="flex flex-col border border-rule p-6">
          <h2 className="font-serif text-2xl">{pricing.professional.name}</h2>
          <p className="mt-3 font-serif text-3xl">
            {pricing.professional.price}
            <span className="text-lg text-muted">{pricing.professional.period}</span>
          </p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            {pricing.professional.cadence}
          </p>
          <p className="mt-4 flex-1 text-sm leading-6 text-ink-soft">{pricing.professional.detail}</p>
          <div className="mt-6">
            <PaystackCheckout plan="professional" label="Pay $149 / mo with Paystack" variant="ghost" />
          </div>
        </article>

        <article className="flex flex-col border border-rule p-6">
          <h2 className="font-serif text-2xl">{pricing.enterprise.name}</h2>
          <p className="mt-3 font-serif text-3xl">{pricing.enterprise.price}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            {pricing.enterprise.cadence}
          </p>
          <p className="mt-4 flex-1 text-sm leading-6 text-ink-soft">{pricing.enterprise.detail}</p>
          <Link
            href="/advisory"
            className="mt-6 border border-ink/20 px-4 py-3 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em]"
          >
            Contact the desk
          </Link>
        </article>
      </div>

      <section className="mt-14">
        <h2 className="font-serif text-2xl">Seat matrix</h2>
        <p className="mt-2 text-sm text-ink-soft">
          What each tier is meant to unlock. Paystack collects the charge. This matrix does not grant a seat.{" "}
          <Link href="/account" className="text-forest underline underline-offset-2">
            Account
          </Link>
          .
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free</th>
                <th>Pro</th>
                <th>Professional</th>
                <th>Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {entitlementRows.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>{row.free}</td>
                  <td>{row.pro}</td>
                  <td>{row.professional}</td>
                  <td>{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
