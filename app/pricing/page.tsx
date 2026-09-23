import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutStub } from "@/components/ui/CheckoutStub";
import { PageHeader } from "@/components/ui/PageHeader";
import { pricing } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Afronomics Free, Pro ($29), Professional ($149) and Enterprise. Kenya desk trial KES 500. Checkout is not live.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Pricing"
        title="Free for the habit. Paid for the file."
        lede="Headlines and country shells stay open. Depth, exports, alerts and Ask sit on a seat. No live payments in this build."
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

      <div className="mt-12 border border-gold/40 bg-gold/10 px-5 py-5">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">Kenya desk trial</p>
        <p className="mt-2 font-serif text-2xl text-ink">
          {pricing.trial.price} → {pricing.trial.name}
        </p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">{pricing.trial.detail}</p>
        <div className="mt-5 max-w-xs">
          <CheckoutStub label="Start trial — M-Pesa checkout coming soon" variant="secondary" />
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
            <CheckoutStub label="$29 / mo — checkout soon" />
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
            <CheckoutStub label="$149 / mo — checkout soon" variant="ghost" />
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
    </div>
  );
}
