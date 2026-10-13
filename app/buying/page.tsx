import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { DataTerms } from "@/components/billing/DataTerms";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TableScroll } from "@/components/ui/DataTable";
import { KES_PER_USD, institutionalLadder, institutionalPilot, institutionalPriceText } from "@/lib/billing/ratecard";
import { site } from "@/lib/site";
import { fitDescription, fitTitle } from "@/lib/seo";

const title = "Buying Afronomics data for an institution";
const description =
  "For procurement and finance teams: how to trial, buy and pay for Afronomics data as an institution. Plans and prices, invoices in USD or KES, the licence in brief, vendor forms and security questionnaires.";

export const metadata: Metadata = {
  title: fitTitle(title),
  description: fitDescription(description),
  alternates: { canonical: `${site.url}/buying` },
  openGraph: { title, description, url: `${site.url}/buying` },
};

const steps: [string, React.ReactNode][] = [
  [
    "Trial",
    <>
      A free {institutionalPilot.days}-day pilot key for your team, sent to a work email address. No card, no contract.{" "}
      <Link href={institutionalPilot.href} className="underline underline-offset-2">
        Request a pilot
      </Link>
      .
    </>,
  ],
  [
    "Choose a plan",
    <>
      Analyst, Team and API, or Enterprise (below). Domestic African institutions that qualify pay a local price; the rule is on{" "}
      <Link href="/licensing" className="underline underline-offset-2">
        licensing
      </Link>
      .
    </>,
  ],
  [
    "Pay by card or by invoice",
    <>
      Card, M-Pesa or bank transfer at checkout through Paystack, or ask for an invoice and pay by bank transfer. Enterprise is always invoiced.
    </>,
  ],
  [
    "Access",
    <>
      After a card payment, the receipt and access arrive by email; a Team and API key is issued automatically and shown once. On an invoice, access starts
      when the agreed terms are confirmed.
    </>,
  ],
];

export default function BuyingPage() {
  const mail = (subject: string) => `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}`;
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/for-institutions", label: "For institutions" }, { label: "Buying for an institution" }]}
      kicker="Procurement"
      title="Buying for an institution"
      lede={
        <p>
          For the analyst who wants the data and the finance, procurement or compliance colleague who has to approve it: how to trial, buy and pay, what the
          licence allows, and what we can send for your vendor file.
        </p>
      }
      aside={
        <Card tone="emphasis">
          <p className="text-[14px] font-semibold text-ink">Ask for a quote or an invoice</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">Tell us the plan, the number of users, your billing entity and any PO number. The desk replies within one working day.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/pricing#invoice" size="sm">
              Request an invoice
            </ButtonLink>
            <ButtonLink href={mail("Procurement")} variant="secondary" size="sm">
              Email the desk
            </ButtonLink>
          </div>
        </Card>
      }
    >
      <section>
        <SectionTitle kicker="How it works" title="From trial to invoice in four steps" />
        <ol className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2 lg:grid-cols-4">
          {steps.map(([t, d], i) => (
            <li key={t} className="bg-surface px-5 py-5">
              <p className="text-[12px] font-semibold text-gold">Step {i + 1}</p>
              <h3 className="mt-1 font-serif text-xl text-ink">{t}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14" id="plans">
        <SectionTitle kicker="Plans" title="What institutions buy" note="Monthly list prices in US dollars, from the rate card. The full comparison is on the pricing page." />
        <TableScroll label="Institutional plans" className="mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th className="text-right">Per month</th>
                <th>Includes</th>
                <th>How to buy</th>
              </tr>
            </thead>
            <tbody>
              {institutionalLadder.map((t) => (
                <tr key={t.id}>
                  <th scope="row" className="text-sm font-medium text-ink">
                    {t.name}
                  </th>
                  <td className="whitespace-nowrap text-right text-sm tabular-nums">{institutionalPriceText(t)}</td>
                  <td className="min-w-[14rem] text-sm text-ink-soft">{t.includes.join(" · ")}</td>
                  <td className="text-sm text-ink-soft">{t.id === "enterprise" ? "Invoice and agreement" : "Checkout or invoice"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
        <p className="mt-2 text-xs text-muted">
          <Link href="/pricing#institutions" className="underline underline-offset-2">
            Pricing
          </Link>{" "}
          · <Link href="/prices" className="underline underline-offset-2">price guide</Link> (reader plans, committee pack, sponsorship) ·{" "}
          <Link href="/licensing" className="underline underline-offset-2">local prices for domestic institutions</Link>
        </p>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2" id="payment">
        <div>
          <SectionTitle kicker="Payment" title="Currencies and methods" />
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
            <li>Institutional plans are priced in US dollars. Invoices can be issued in US dollars or Kenyan shillings.</li>
            <li>
              Card checkout runs through Paystack and accepts Visa and Mastercard from anywhere, M-Pesa and bank transfer. Where checkout collects in Kenyan
              shillings, the dollar price is converted at KES {KES_PER_USD} to the dollar, shown before you pay; your card issuer converts to your currency.
            </li>
            <li>Paying by invoice: bank transfer against the invoice. Tell us your PO number and billing address when you ask.</li>
            <li>A card payment is a single charge for one period unless a renewing plan is shown at checkout. Nothing renews without telling you.</li>
            <li>Card details go to Paystack only; Afronomics never sees them.</li>
          </ul>
        </div>
        <div>
          <SectionTitle kicker="Vendor onboarding" title="Forms, documents and questionnaires" />
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
            <li>
              Send your supplier-onboarding pack (vendor form, tax forms, bank-detail form) to{" "}
              <a href={mail("Vendor onboarding")} className="underline underline-offset-2">
                {site.contactEmail}
              </a>{" "}
              and we complete and return it. A pro-forma invoice is available before you raise a PO.
            </li>
            <li>
              Data-security or vendor-risk questionnaires: we answer them. What we can say today, including what is not yet in place, is on{" "}
              <Link href="/trust" className="underline underline-offset-2">
                trust and data security
              </Link>
              .
            </li>
            <li>
              Personal data (user names and emails for keys and seats) is handled under Kenya&rsquo;s Data Protection Act, 2019:{" "}
              <Link href="/legal/privacy" className="underline underline-offset-2">
                privacy notice
              </Link>
              .
            </li>
            <li>
              The contracting party is the publisher named in the{" "}
              <Link href="/imprint" className="underline underline-offset-2">
                publisher notice
              </Link>
              . Terms are governed by the laws of Kenya (
              <Link href="/legal/terms" className="underline underline-offset-2">
                terms of use
              </Link>
              ).
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-14" id="licence">
        <SectionTitle kicker="Licence in brief" title="What is free, what needs a key, what is Enterprise" />
        <DataTerms />
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-2" id="service">
        <div>
          <SectionTitle kicker="Service" title="Support and service levels" />
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
            <li>One desk inbox, read every working day in Nairobi; replies within one working day.</li>
            <li>Team and API includes a named contact and usage reporting for your key.</li>
            <li>
              Data freshness and publication delay are public on the{" "}
              <Link href="/status" className="underline underline-offset-2">
                data status page
              </Link>
              , so you can check delivery before you buy.
            </li>
            <li>A written service agreement (SLA) comes with Enterprise. Other plans have no uptime commitment today.</li>
          </ul>
        </div>
        <div>
          <SectionTitle kicker="Before you approve" title="Read these" />
          <ul className="mt-4 space-y-2 text-sm leading-6">
            <li>
              <Link href="/about" className="font-medium text-forest underline underline-offset-2">
                About Afronomics
              </Link>{" "}
              <span className="text-ink-soft">: who publishes it and how it is funded</span>
            </li>
            <li>
              <Link href="/editorial-standards" className="font-medium text-forest underline underline-offset-2">
                Editorial standards
              </Link>{" "}
              <span className="text-ink-soft">: independence, sourcing, corrections and AI use</span>
            </li>
            <li>
              <Link href="/trust" className="font-medium text-forest underline underline-offset-2">
                Trust and data security
              </Link>{" "}
              <span className="text-ink-soft">: where each dataset comes from and how it is secured</span>
            </li>
            <li>
              <Link href="/method" className="font-medium text-forest underline underline-offset-2">
                Sources and method
              </Link>
              {" · "}
              <Link href="/reference" className="font-medium text-forest underline underline-offset-2">
                The reference
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
