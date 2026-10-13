import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutNotice } from "@/components/billing/CheckoutNotice";
import { InstitutionalBuy } from "@/components/billing/InstitutionalBuy";
import { InvoiceRequestForm } from "@/components/billing/InvoiceRequestForm";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";
import { PilotForm } from "@/components/billing/PilotForm";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { paystackConfigured } from "@/lib/billing/paystack";
import { chargeLabel } from "@/lib/billing/plans";
import {
  institutionalCurrencyNote,
  institutionalLinks,
  institutionalPilot,
  institutionalPriceText,
  institutionalLadder,
} from "@/lib/billing/ratecard";
import { pricing, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pricing — African government debt auction data for institutions, and reader plans",
  description:
    `African local-currency government bond and bill auction data for institutions: ${institutionalLadder
      .map((tier) => `${tier.name} ${institutionalPriceText(tier)}`)
      .join(", ")} a month, priced in US dollars and paid at checkout or by invoice, with a ${institutionalPilot.label}. Reader plans: everything free to read and cite; Pro from KES 1,500 a month by M-Pesa or card.`,
  alternates: { canonical: `${site.url}/pricing` },
};

const rows: Array<[string, boolean | string, boolean | string, boolean | string, boolean | string]> = [
  ["The Wire: headlines from African publishers", true, true, true, true],
  ["54 country files with 22 series and history", true, true, true, true],
  ["T-bill monitor for ten markets, auction pages and the Sovereign Bill Index", true, true, true, true],
  ["Data hub rankings and CSV downloads", true, true, true, true],
  ["The Afronomics Weekly newsletter", true, true, true, true],
  ["The Morning note, every weekday before 07:30 Nairobi", "On the site", "By email", "By email", "By email"],
  ["Treasury-bill auction alerts (push in ten markets, email for Kenya)", "Push", "Push and email", "Push and email", "Push and email"],
  ["Open data API: latest 12 months, no key, 5-minute cache, with attribution", true, true, true, true],
  ["Full briefs, weekly analysis and explainers", "Summaries", true, true, true],
  ["Seats", "1", "1", "5", "By agreement"],
  ["Priority requests for new datasets", false, false, true, true],
  ["Embedded widgets and white-label country files", false, false, false, true],
  ["Commissioned research", false, false, false, true],
];

/**
 * Reader-plan copy shown on this page. Names, prices and checkout come from lib/site.ts and lib/billing/plans.ts unchanged;
 * these plans are for individuals, so the copy promises the web tools and downloads, not licensed API or redistribution,
 * and points institutions to the ladder above.
 */
const readerCopy: Record<string, { label?: string; detail?: string }> = {
  [pricing.pro.name]: {
    detail: "About $12. Every brief and weekly analysis in full, the Morning note by email, Treasury-bill auction alerts, and the web tools and CSV downloads. One seat.",
  },
  [pricing.professional.name]: {
    detail: "About $49. Five Pro seats on one invoice and priority requests for new datasets.",
  },
  [pricing.enterprise.name]: {
    label: "Embeds and research",
    detail: "Embedded widgets, white-label country files and commissioned research. Licensed auction data is on the institutional ladder above.",
  },
};

const bondMarkets = "Nigeria, Egypt, Kenya, Uganda, Zambia, Morocco and the eight WAEMU markets";

const institutionalFaq: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "What data is included?",
    a: (
      <>
        Primary auction results for African local-currency government debt: bond auctions for {bondMarkets}, and Treasury bill auctions in ten
        markets. For each auction, the amounts offered, bid and accepted, and the rate, by tenor. Secondary-market prices are not included; those come
        from dealers and exchanges. The{" "}
        <Link href={institutionalLinks.product} className="underline underline-offset-2">
          product page
        </Link>{" "}
        lists coverage and gaps market by market.
      </>
    ),
  },
  {
    q: "How fresh is it?",
    a: (
      <>
        Results are published within hours of each central bank’s release, with history back to 2000 in some markets. The public{" "}
        <Link href="/status" className="underline underline-offset-2">
          data status
        </Link>{" "}
        page shows any market whose release is late or not yet read.
      </>
    ),
  },
  {
    q: "Where do the numbers come from, and how are errors fixed?",
    a: (
      <>
        Every result is read from the central bank’s own release and carries the link to it. Afronomics compiles and checks; the central bank is the
        source. Each result must pass range and consistency checks before it is published, and fixes are recorded on the public{" "}
        <Link href="/corrections" className="underline underline-offset-2">
          corrections log
        </Link>
        .
      </>
    ),
  },
  {
    q: "Can we redistribute the data?",
    a: (
      <>
        Redistribution is part of Enterprise. Analyst and Team and API are for your own use. Quoting individual figures with attribution is free on
        every plan. Terms are on the{" "}
        <Link href={institutionalLinks.apiDocs} className="underline underline-offset-2">
          data API page
        </Link>
        .
      </>
    ),
  },
  {
    q: "How does invoicing work?",
    a: (
      <>
        Institutional licences are priced per month in US dollars. Analyst and Team and API can be bought on this page through Paystack (card, and
        M-Pesa or bank transfer when charged in shillings), or{" "}
        <a href="#invoice" className="underline underline-offset-2">
          invoiced
        </a>{" "}
        and paid by bank transfer. Enterprise is always invoiced. The reader plans further down are separate and priced in Kenyan shillings.
      </>
    ),
  },
  {
    q: "How does the pilot work?",
    a: (
      <>
        Fill in the{" "}
        <a href="#pilot" className="underline underline-offset-2">
          pilot form
        </a>
        : five questions, no payment details. Work email addresses get an API key with the full history for {institutionalPilot.days} days, free; the
        desk follows up before it ends.
      </>
    ),
  },
];

function cell(value: boolean | string) {
  if (value === true) return <span className="text-up">✓</span>;
  if (value === false) return <span className="text-muted">—</span>;
  return <span className="text-xs text-ink-soft">{value}</span>;
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; reference?: string; trxref?: string; plan?: string }>;
}) {
  const query = await searchParams;
  const live = paystackConfigured();
  const tiers = [pricing.free, pricing.pro, pricing.professional, pricing.enterprise];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Pricing" }]}
      kicker="Pricing"
      title="Auction data for institutions. Open data for everyone."
      lede={
        <>
          <p>
            Institutions license African local-currency government debt auction data, priced in US dollars and bought here at checkout or by invoice,
            with a {institutionalPilot.label}. Every number,
            headline and country file on Afronomics stays free to read and cite, and reader plans add depth from KES 1,500 a month,
            about $12, paid by M-Pesa, card or bank transfer.
          </p>
          <nav aria-label="On this page" className="mt-5 flex flex-wrap gap-2 text-[13px] font-medium">
            {[
              ["#institutions", "Institutional data"],
              ["#pilot", "Free 30-day pilot"],
              ["#institutional-faq", "Institutional FAQ"],
              ["#readers", "Reader plans"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="rounded-full border border-rule px-3 py-1 text-forest hover:border-gold hover:text-gold">
                {label}
              </a>
            ))}
          </nav>
        </>
      }
    >
      <CheckoutNotice query={query} />

      <section id="institutions" className="scroll-mt-24">
        <SectionTitle
          kicker="For institutions"
          title="African government debt auction data"
          note={`Bond auctions for ${bondMarkets}; Treasury bill auctions in ten markets. Read from each central bank’s own release.`}
          href={institutionalLinks.product}
          hrefLabel="About the data →"
        />

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {institutionalLadder.map((tier) => {
            const api = tier.id === "team";
            return (
              <article
                key={tier.id}
                className={`flex flex-col rounded-2xl border bg-surface px-5 py-6 ${api ? "border-forest/50 ring-1 ring-forest/20" : "border-rule"}`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-[13px] font-semibold text-gold">{tier.name}</h3>
                  {api ? <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-semibold text-forest">Includes the API</span> : null}
                </div>
                <p className="mt-3 font-serif text-4xl text-ink">
                  {institutionalPriceText(tier)}
                  <span className="text-base text-muted"> /month</span>
                </p>
                <p className="mt-3 text-sm leading-6 text-ink-soft">{tier.audience}</p>
                <ul className="mt-4 flex-1 space-y-2 border-t border-rule pt-4 text-sm text-ink">
                  {tier.includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="text-up">
                        ✓
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 space-y-2">
                  <InstitutionalBuy tier={tier.id} name={tier.name} variant={api ? "primary" : "ghost"} />
                  {tier.id === "enterprise" ? (
                    <p className="text-center text-[11px] text-muted">Priced by scope. The desk replies within one working day.</p>
                  ) : (
                    <a href="#pilot" className="block text-center text-[13px] font-semibold text-forest underline underline-offset-2">
                      or start a free {institutionalPilot.days}-day pilot
                    </a>
                  )}
                  {tier.id === "enterprise" ? null : (
                    <Link href="/licensing#local" className="block text-center text-[12px] text-muted underline underline-offset-2 hover:text-forest">
                      Local institution in Africa? See local prices
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div id="pilot" className="scroll-mt-24 rounded-2xl border-2 border-forest/30 bg-surface px-5 py-5">
            <p className="text-[17px] font-semibold text-ink">Start a {institutionalPilot.label}</p>
            <p className="mt-1 mb-4 text-sm leading-6 text-ink-soft">
              For investment managers, banks, development finance institutions and research teams: an API key with the full history, free for{" "}
              {institutionalPilot.days} days. No payment details.{" "}
              <Link href={institutionalLinks.apiDocs} className="underline underline-offset-2">
                API docs and terms
              </Link>
              .
            </p>
            <PilotForm siteUrl={site.url} />
          </div>
          <div id="invoice" className="scroll-mt-24 rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[17px] font-semibold text-ink">Request an invoice</p>
            <p className="mt-1 mb-4 text-sm leading-6 text-ink-soft">
              For Enterprise, or for any plan your finance team pays by bank transfer. {institutionalCurrencyNote}
            </p>
            <InvoiceRequestForm plan={query.plan} />
          </div>
        </div>
      </section>

      <section id="institutional-faq" className="mt-14 scroll-mt-24">
        <SectionTitle kicker="Questions from institutions" title="Before you request a pilot" />
        <div className="mt-2 grid gap-x-10 md:grid-cols-2">
          {institutionalFaq.map(({ q, a }) => (
            <details key={q} className="group border-b border-rule py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
                {q}
                <span aria-hidden className="mt-0.5 shrink-0 text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section id="readers" className="mt-16 scroll-mt-24">
        <SectionTitle
          kicker="For readers"
          title="Reader plans"
          note="For individual readers and small teams. Everything on the site is free to read and cite; paid plans add the Morning note, alerts, full analysis and seats."
        />

        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier) => {
            const highlight = tier.name === pricing.pro.name;
            return (
              <div key={tier.name} className={`flex flex-col px-5 py-6 ${highlight ? "bg-night on-night" : "bg-surface"}`}>
                <p className={`text-[12px] font-semibold ${highlight ? "text-accent" : "text-gold"}`}>{readerCopy[tier.name]?.label ?? tier.name}</p>
                <p className={`mt-3 font-serif text-4xl ${highlight ? "text-night-ink" : "text-ink"}`}>
                  {tier.name === pricing.pro.name ? chargeLabel("pro") : tier.name === pricing.professional.name ? chargeLabel("professional") : tier.price}
                  <span className={`text-base ${highlight ? "text-night-soft" : "text-muted"}`}>{tier.period}</span>
                </p>
                <p className={`mt-3 flex-1 text-sm leading-6 ${highlight ? "text-night-soft" : "text-ink-soft"}`}>{readerCopy[tier.name]?.detail ?? tier.detail}</p>
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
                      {readerCopy[tier.name]?.label ?? tier.name}
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
              "A Bloomberg terminal costs more each month than most African analysts earn. Afronomics is built by software from public central-bank results, so the price can be set for the people who use it most: analysts, treasurers, fund managers and journalists on the continent. Institutions that license the data for their own systems use the ladder above, in US dollars.",
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
      </section>
    </PageShell>
  );
}
