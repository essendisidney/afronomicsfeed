import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutNotice } from "@/components/billing/CheckoutNotice";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { paystackConfigured } from "@/lib/billing/paystack";
import { aboutText, comparables, KES_PER_USD, priceText, rateCard, type RateItem } from "@/lib/billing/ratecard";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Price guide — everything Afronomics sells, in shillings and dollars",
  description:
    "The full Afronomics rate card: Pro from KES 1,500 a month, the Investment Committee Pack from KES 12,000, data licences from KES 7,500, sponsorships, widgets, training, benchmarking and research. Priced for Africa, the same price anywhere, paid by M-Pesa, card or invoice.",
  alternates: { canonical: `${site.url}/prices` },
};

function Price({ item }: { item: RateItem }) {
  return (
    <p className="font-serif text-3xl text-ink">
      {priceText(item)}
      {item.unit ? <span className="ml-1 text-sm text-muted">{item.unit}</span> : null}
    </p>
  );
}

function Action({ item, live }: { item: RateItem; live: boolean }) {
  if (item.checkout && live) {
    return <PaystackCheckout plan={item.checkout} label={item.amount && item.unit.includes("month") ? "Subscribe" : "Pay now"} variant="primary" />;
  }
  if (item.amount === 0) {
    return (
      <Link href={item.href ?? "/"} className="inline-block rounded-full border border-ink/20 px-4 py-2 text-[13px] font-semibold text-ink hover:border-accent">
        Open it
      </Link>
    );
  }
  return (
    <Link
      href={`/contact?interest=${item.enquiry ?? "other"}&about=${encodeURIComponent(item.name)}#enquiry`}
      className="inline-block rounded-full border border-ink/20 px-4 py-2 text-[13px] font-semibold text-ink hover:border-accent"
    >
      {item.status === "soon" ? "Join the list" : item.amount == null ? "Ask for a quote" : "Request an invoice"}
    </Link>
  );
}

export default async function PricesPage({ searchParams }: { searchParams: Promise<{ checkout?: string; reference?: string; trxref?: string }> }) {
  const query = await searchParams;
  const live = paystackConfigured();
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/pricing", label: "Pricing" }, { label: "Price guide" }]}
      kicker="Price guide"
      title="Everything Afronomics sells, on one page"
      lede={
        <p>
          Prices are set in Kenyan shillings for the people who use the site most, and a desk in London or Lagos pays the same. The dollar
          figures are for reference at about KES {KES_PER_USD} to the dollar. Pay by M-Pesa, card or bank transfer at checkout, or ask for an
          invoice in KES or USD. Annual billing takes two months off everything monthly.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5 text-[13px] leading-5 text-ink-soft">
          <p className="text-[14px] font-semibold text-ink">Why these prices</p>
          <p className="mt-2">
            A terminal costs more a month than most African analysts earn. Afronomics is assembled by software from the results central banks
            publish, so the price can be set for the analyst, the SACCO treasurer and the newsroom, and still be the best value on any desk in
            the world.
          </p>
          <p className="mt-2">Launch rates hold for twelve months for anyone who signs during 2026.</p>
        </div>
      }
    >
      <CheckoutNotice query={query} />

      <nav className="flex flex-wrap gap-2 text-[13px]" aria-label="Groups">
        {rateCard.map((g) => (
          <a key={g.id} href={`#${g.id}`} className="rounded-full border border-rule bg-surface px-3 py-1 text-ink-soft hover:border-accent">
            {g.title}
          </a>
        ))}
        <a href="#compare" className="rounded-full border border-rule bg-surface px-3 py-1 text-ink-soft hover:border-accent">
          Against the world
        </a>
      </nav>

      {rateCard.map((g) => (
        <section key={g.id} id={g.id} className="mt-12 scroll-mt-24">
          <SectionTitle kicker={g.title} title={g.who} />
          <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2">
            {g.items.map((item) => (
              <article key={item.id} className="flex flex-col bg-surface px-5 py-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[15px] font-semibold text-ink">
                    {item.href ? (
                      <Link href={item.href} className="hover:underline">
                        {item.name}
                      </Link>
                    ) : (
                      item.name
                    )}
                  </h3>
                  {item.status === "soon" ? <span className="rounded-full bg-paper-2 px-2 py-0.5 text-[11px] font-semibold text-muted">Coming</span> : null}
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <Price item={item} />
                  {aboutText(item) ? <span className="text-[12px] text-muted">{aboutText(item)}</span> : null}
                </div>
                {item.launch ? <p className="mt-1 text-[12px] font-semibold text-accent">Launch: {item.launch}</p> : null}
                <p className="mt-2 flex-1 text-sm leading-6 text-ink-soft">{item.what}</p>
                <div className="mt-4">
                  <Action item={item} live={live} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section id="compare" className="mt-14 scroll-mt-24">
        <SectionTitle kicker="Against the world" title="What the same thing costs elsewhere" />
        <div className="overflow-x-auto">
          <table className="data-table mt-4">
            <thead>
              <tr>
                <th>Elsewhere</th>
                <th>Typically</th>
                <th>Afronomics</th>
              </tr>
            </thead>
            <tbody>
              {comparables.map((c) => (
                <tr key={c.product}>
                  <td className="text-sm">{c.product}</td>
                  <td className="text-sm text-ink-soft">{c.price}</td>
                  <td className="text-sm font-medium">{c.ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">Comparison prices are public list prices or typical quotes, approximate, and change; they are here so the shilling prices can be judged, not as a claim about any vendor.</p>
      </section>

      <section className="mt-14 grid gap-8 md:grid-cols-3">
        {[
          ["How payment works", "Checkout is Paystack: M-Pesa, Kenyan and Nigerian cards, bank transfer, and Visa or Mastercard from anywhere, converted at the card’s rate. You get a receipt by email that says exactly what to reply with, and the desk sets you up from that address. Monthly items renew until you say stop."],
          ["Invoices and procurement", "Any item can be invoiced in KES or USD, with a pro-forma, a supplier letter and KRA PIN on request. Annual invoices take two months off. Associations and groups get one invoice for all their members."],
          ["What never costs anything", "Reading, citing and downloading the data, the T-bill monitor and every auction page, the index, the free widgets and the open API. Sponsors never see, edit or order the data."],
        ].map(([t, b]) => (
          <div key={t}>
            <h3 className="font-serif text-xl">{t}</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{b}</p>
          </div>
        ))}
      </section>

      <section className="mt-14 max-w-2xl" id="enquiry">
        <SectionTitle kicker="Invoice" title="Ask for a quote or an invoice" />
        <div className="mt-4">
          <EnquiryForm interest="other" cta="Send" />
        </div>
      </section>
    </PageShell>
  );
}
