import {
  institutionalLadder,
  institutionalPriceText,
  localInstitutionPayment,
  localInstitutionPrices,
  localInstitutionRule,
  localPriceText,
} from "@/lib/billing/ratecard";
import { bondCoverageText, bondResultCount } from "@/lib/data/sovereign-bonds";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { DataTerms } from "@/components/billing/DataTerms";
import { InstitutionalBuy } from "@/components/billing/InstitutionalBuy";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";
import { paystackConfigured } from "@/lib/billing/paystack";
import { chargeLabel } from "@/lib/billing/plans";
import { InvoiceRequestForm } from "@/components/billing/InvoiceRequestForm";
import { PilotForm } from "@/components/billing/PilotForm";
import { indicatorDefs } from "@/lib/data/indicators";
import { loadBonds } from "@/lib/data/kenya-bonds";
import { loadTbills } from "@/lib/data/kenya-tbills";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";
import { fitDescription } from "@/lib/seo";
import { DataTable, TableScroll } from "@/components/ui/DataTable";

export const metadata: Metadata = {
  title: "Data licensing: African auctions, FX and news",
  description: fitDescription("License Afronomics datasets for your products and models: African government bond auctions, Treasury bill auctions in ten African markets, derived borrowing-cost measures, the African FX archive, the Wire headline archive and 22 series for 54 economies."),
  alternates: { canonical: `${site.url}/licensing` },
};

const year = (date?: string) => date?.slice(0, 4) ?? "—";

type Tier = { name: string; price: string; detail: string; buy?: "open" | "startup" | "analyst" | "team" | "enterprise" };

const tiers: Tier[] = [
  {
    name: "Open",
    buy: "open",
    price: "Free",
    detail: "The site, every table and chart, and the JSON API and CSV for the latest 12 months (up to 100 rows a call), for research, journalism, teaching and non-commercial apps, with the attribution line kept.",
  },
  {
    name: "Startup",
    buy: "startup",
    price: "KES 7,500/mo",
    detail: "Commercial use inside one startup product: a key with the full history, charts and figures shown to your own users with attribution, and an email or webhook on every new result. No redistribution: that is Enterprise only.",
  },
  ...institutionalLadder.map((tier) => ({
    name: tier.name,
    price: `${institutionalPriceText(tier)}/mo`,
    detail: `${tier.summary.charAt(0).toUpperCase()}${tier.summary.slice(1)}. ${tier.audience}`,
    buy: tier.id,
  })),
];

function TierAction({ tier }: { tier: Tier }) {
  if (tier.buy === "open")
    return (
      <Link href="/developers" className="block rounded-full border border-ink/20 px-4 py-3 text-center text-[13px] font-semibold text-ink hover:border-accent">
        Use the open API
      </Link>
    );
  if (tier.buy === "startup")
    return paystackConfigured() ? (
      <PaystackCheckout plan="licence_startup" label={`Buy · ${chargeLabel("licence_startup")}/mo`} variant="ghost" />
    ) : (
      <a href="#enquiry" className="block rounded-full border border-ink/20 px-4 py-3 text-center text-[13px] font-semibold text-ink hover:border-accent">
        Request an invoice
      </a>
    );
  if (tier.buy) return <InstitutionalBuy tier={tier.buy} name={tier.name} variant={tier.buy === "team" ? "primary" : "ghost"} />;
  return null;
}

export default function LicensingPage() {
  const bills = loadTbills();
  const bonds = loadBonds();
  const markets = billMarkets.map((m) => ({ m, rows: loadBillMarket(m.slug).rows })).filter((x) => x.rows.length);
  const results = markets.reduce((n, x) => n + x.rows.length, 0);
  const datasets = [
    {
      name: "African government bond auctions",
      href: "/data/frontier-local-debt",
      coverage: `${bondCoverageText()} · ${bondResultCount().toLocaleString("en-US")} results`,
      detail: "Amounts offered, bid and accepted, the rate, bid-to-cover and the ISIN where published, each row linked to the issuer's own notice. API and CSV.",
    },
    {
      name: "African Treasury bill auctions",
      href: "/markets/tbills",
      coverage: `${markets.length} markets · ${results.toLocaleString("en-US")} results`,
      detail: `${markets.map((x) => `${x.m.country} from ${year(x.rows.at(-1)?.date)}`).join(", ")}. Rates and, where published, amounts offered, bid and accepted, each row linked to its source.`,
    },
    {
      name: "Borrowing-cost measures",
      href: "/markets/borrowing-costs",
      coverage: "Updated with every auction",
      detail: "Real yields on one-year bills, bids-to-offer demand by market, and the expected date of each market's next result.",
    },
    {
      name: "Kenya Treasury bill auctions",
      href: "/markets/kenya-tbills",
      coverage: `${year(bills.rows.at(-1)?.value_date)}–present · ${bills.rows.length.toLocaleString("en-US")} results`,
      detail: "Rates, amounts offered, bids received, accepted, competitive and non-competitive, price per 100 — by tenor, every auction.",
    },
    {
      name: "Kenya Treasury bond auctions",
      href: "/markets/kenya-bonds",
      coverage: bonds.rows.length ? `${year(bonds.rows.at(-1)?.value_date)}–present · ${bonds.rows.length.toLocaleString("en-US")} results` : "Building",
      detail: "Every primary issue, re-opening, tap and switch: rates, coupons, maturities, bids and acceptances, with the auction yield curve.",
    },
    {
      name: "African FX reference archive",
      href: "/markets",
      coverage: "Daily from 30 Sep 2026 · 45 currencies",
      detail: "The daily US-dollar mid-market reference for 45 African currencies, archived at the same hour each day. Read from a third-party rates feed whose terms do not allow redistribution, so it is for reference inside your own work only.",
    },
    {
      name: "The Wire archive",
      href: "/news",
      coverage: "Daily from 30 Sep 2026",
      detail: "Every headline carried from African business publishers, tagged by country and desk, with the link to the original. Headlines and excerpts remain their publishers’ copyright: the licence covers our tags, dates and links, not the publishers’ text.",
    },
    {
      name: "54-economy panel",
      href: "/data",
      coverage: `2010–present · ${indicatorDefs.length} series`,
      detail: "Growth, prices, debt, reserves, capital flows, trade, connectivity and energy for all 54 economies, normalised from World Bank Open Data.",
    },
  ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/data", label: "Data" }, { label: "Licensing" }]}
      kicker="Data licensing"
      title="Africa’s market data, clean and sourced"
      lede={
        <p>
          Datasets compiled from primary publications — central-bank notices, official registers, publisher feeds — checked, structured and kept
          current. Every row carries the link to the document it came from. Developers can start on the free{" "}
          <Link href="/developers" className="underline underline-offset-2">
            JSON API
          </Link>{" "}
          today.
        </p>
      }
    >
      <SectionTitle kicker="Datasets" title="What you can license" />
      <DataTable
        label="Datasets you can license"
        className="mt-2"
        mobile="cards"
        rows={[...datasets]}
        rowKey={(item) => item.name}
        columns={[
          {
            key: "name",
            header: "Dataset",
            className: "sm:whitespace-nowrap",
            cell: (item) => (
              <Link href={item.href} className="font-medium hover:text-forest">
                {item.name}
              </Link>
            ),
          },
          { key: "coverage", header: "Coverage", className: "text-[12px] sm:whitespace-nowrap", cell: (item) => item.coverage },
          { key: "detail", header: "Contents", className: "text-sm text-ink-soft", cell: (item) => item.detail },
        ]}
      />

      <section className="mt-14" id="terms">
        <SectionTitle kicker="Terms" title="What is free, what needs a key, what is Enterprise" />
        <DataTerms />
      </section>

      <section className="mt-14">
        <SectionTitle kicker="Licences" title="Licences" note="Buy at checkout, or ask for an invoice in USD or KES. Not sure yet? Start a free 30-day pilot on the frontier local-debt page." />
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {tiers.map((tier) => (
            <div key={tier.name} className="flex flex-col bg-surface px-5 py-6">
              <p className="text-[12px] font-semibold text-gold">{tier.name}</p>
              <p className="mt-2 font-serif text-3xl text-ink">{tier.price}</p>
              <p className="mt-3 flex-1 text-sm leading-6 text-ink-soft">{tier.detail}</p>
              <div className="mt-5">
                <TierAction tier={tier} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="local" className="mt-14">
        <SectionTitle
          kicker="Local institutions in Africa"
          title="Local prices for domestic institutions"
          note="Analyst and Team and API, a month, for institutions that meet the rule below. Enterprise and redistribution stay in US dollars, from $5,000 a month, everywhere."
        />
        <TableScroll label="Local-institution prices by country" className="mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Country</th>
                <th className="text-right">Analyst</th>
                <th className="text-right">Team and API</th>
                <th className="text-right">Share of the USD list</th>
                <th className="text-right">About, in USD</th>
              </tr>
            </thead>
            <tbody>
              {localInstitutionPrices.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-ink">{p.country}</td>
                  <td className="text-right whitespace-nowrap">{localPriceText(p, "analyst")}</td>
                  <td className="text-right whitespace-nowrap">{localPriceText(p, "team")}</td>
                  <td className="text-right">{p.band}%</td>
                  <td className="text-right whitespace-nowrap text-ink-soft">
                    ${p.usd.analyst} · ${p.usd.team}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-serif text-xl text-ink">Who qualifies</h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm leading-6 text-ink-soft">
              {localInstitutionRule.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          </div>
          <div>
            <h3 className="font-serif text-xl text-ink">How to pay</h3>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{localInstitutionPayment}</p>
            {paystackConfigured() ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <PaystackCheckout
                  plan="analyst_ke"
                  label={`Kenya: Analyst · ${chargeLabel("analyst_ke")}/mo`}
                  variant="ghost"
                  note="M-Pesa, card or bank transfer. One month. By paying you confirm your institution meets the rule."
                />
                <PaystackCheckout
                  plan="data_team_ke"
                  label={`Kenya: Team and API · ${chargeLabel("data_team_ke")}/mo`}
                  variant="primary"
                  note="M-Pesa, card or bank transfer. One month. By paying you confirm your institution meets the rule."
                />
              </div>
            ) : null}
          </div>
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div id="local-pilot" className="rounded-2xl border-2 border-forest/30 bg-surface px-5 py-5">
            <p className="text-[17px] font-semibold text-ink">Start a free 30-day pilot</p>
            <p className="mt-1 mb-4 text-sm leading-6 text-ink-soft">An API key with the full history, free for 30 days, then the local price for your country.</p>
            <PilotForm siteUrl={site.url} localPricing />
          </div>
          <div id="local-invoice" className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[17px] font-semibold text-ink">Request an invoice at the local price</p>
            <p className="mt-1 mb-4 text-sm leading-6 text-ink-soft">Invoiced to your local entity. The desk replies within one working day.</p>
            <InvoiceRequestForm plan="team" localPricing />
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionTitle kicker="Try it" title="Free samples" />
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link className="text-forest underline" href="/developers">
                Latest rates, ten markets (free JSON API)
              </Link>
            </li>
            <li>
              <a className="text-forest underline" href="/api/data/kenya-tbills" download>
                Kenya T-bill auctions (CSV: latest 12 months free; full history with a key)
              </a>
            </li>
            <li>
              <a className="text-forest underline" href="/api/data/kenya-bonds" download>
                Kenya Treasury bond auctions (CSV: latest 12 months free; full history with a key)
              </a>
            </li>
            <li>
              <a className="text-forest underline" href="/api/data/gdp" download>
                GDP, 54 economies (CSV)
              </a>
            </li>
            <li>
              <Link className="text-forest underline" href="/widgets">
                Embeddable widgets
              </Link>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-7" id="enquiry">
          <SectionTitle kicker="Licence" title="Request a licence or a trial feed" />
          <div className="mt-4">
            <EnquiryForm interest="licensing" cta="Request licence" />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
