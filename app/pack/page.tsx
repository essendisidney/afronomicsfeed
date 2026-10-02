import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { CheckoutNotice } from "@/components/billing/CheckoutNotice";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";
import { paystackConfigured } from "@/lib/billing/paystack";
import { chargeLabel } from "@/lib/billing/plans";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "The Investment Committee Pack — African rates, Kenya’s curve and the month ahead, ready to table",
  description:
    "A monthly, sourced pack for SACCO, insurer and pension investment committees: Treasury bill rates in ten African markets, Kenya’s government yield curve, where the shilling earns most after tax, currency moves and the auction calendar. Sample free.",
  alternates: { canonical: `${site.url}/pack` },
};

const contents = [
  { n: "1", t: "Treasury bill rates, ten African markets", d: "91-, 182- and 364-day rates with one-month and one-year changes, a 12-month line per market, real yields after inflation and auction demand." },
  { n: "2", t: "Kenya’s government yield curve", d: "Every bill and bond auction placed on one curve, and the bond auctions settled in the last 30 days with rates, coupons, take-up and bid-to-cover." },
  { n: "3", t: "Where the shilling earns most", d: "Bills, bonds, money market funds and bank averages on one scale, after withholding tax, with the Central Bank’s deposit and lending averages." },
  { n: "4", t: "Currencies and the month ahead", d: "Fourteen African currencies against the dollar over the month, and the expected date of each market’s next auction result." },
];

export default async function PackPage({ searchParams }: { searchParams: Promise<{ checkout?: string; reference?: string; trxref?: string }> }) {
  const query = await searchParams;
  const live = paystackConfigured();
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/licensing", label: "Licensing" }, { label: "Committee pack" }]}
      kicker="For investment committees"
      title="The pack your committee tables, ready on the first of the month"
      lede={
        <p>
          Someone on your team spends a day each month pulling rates, curves and currency moves into a document for the investment committee. This is that
          document, assembled from the published results the moment they land, with the source under every figure. Four pages, A4, your institution’s name on
          the cover.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <p className="text-[14px] font-semibold text-ink">See this month’s sample</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">The full pack with live figures. Open it, then print to PDF.</p>
          <a href="/pack/sample" target="_blank" rel="noopener" className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-paper hover:bg-forest">
            Open the sample pack
          </a>
        </div>
      }
    >
      <CheckoutNotice query={query} />
      <SectionTitle kicker="Inside" title="Four pages, every figure sourced" />
      <ol className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2">
        {contents.map((c) => (
          <li key={c.n} className="bg-surface px-5 py-5">
            <p className="text-[13px] font-semibold text-gold">Page {c.n}</p>
            <p className="mt-1 font-serif text-2xl text-ink">{c.t}</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{c.d}</p>
          </li>
        ))}
      </ol>

      <section className="mt-14">
        <SectionTitle kicker="Terms" title="Priced for institutions, not individuals" />
        <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-3">
          <div className="bg-surface px-5 py-6">
            <p className="text-[13px] font-semibold text-gold">Committee</p>
            <p className="mt-2 font-serif text-3xl text-ink">{chargeLabel("pack")}<span className="text-base text-muted"> /month</span></p>
            <p className="mt-3 text-sm leading-6 text-ink-soft">About $95. The pack on the first of each month, your institution named on the cover, by email as PDF. Share freely inside the institution.</p>
            {live ? <div className="mt-5"><PaystackCheckout plan="pack" label="Subscribe the committee" variant="primary" /></div> : null}
          </div>
          <div className="bg-surface px-5 py-6">
            <p className="text-[13px] font-semibold text-gold">Committee plus alerts</p>
            <p className="mt-2 font-serif text-3xl text-ink">{chargeLabel("pack_plus")}<span className="text-base text-muted"> /month</span></p>
            <p className="mt-3 text-sm leading-6 text-ink-soft">About $140. The pack, plus an email the day each Kenya auction result lands and the Morning note for five named people.</p>
            {live ? <div className="mt-5"><PaystackCheckout plan="pack_plus" label="Subscribe with alerts" variant="ghost" /></div> : null}
          </div>
          <div className="bg-surface px-5 py-6">
            <p className="text-[13px] font-semibold text-gold">Group</p>
            <p className="mt-2 font-serif text-3xl text-ink">Custom</p>
            <p className="mt-3 text-sm leading-6 text-ink-soft">Several institutions, a branded version, extra markets or series, or the pack delivered into your own systems through the{" "}
              <Link href="/developers" className="underline underline-offset-2">data API</Link>.</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted">Annual billing takes two months off. Pay by M-Pesa, card or bank transfer, or ask for an invoice in KES or USD. First pack within two working days.</p>
      </section>

      <section className="mt-14 max-w-2xl" id="enquiry">
        <SectionTitle kicker="Invoice instead" title="Prefer an invoice, or want the group version?" />
        <div className="mt-4">
          <EnquiryForm interest="pack" cta="Request the pack" />
        </div>
      </section>
    </PageShell>
  );
}
