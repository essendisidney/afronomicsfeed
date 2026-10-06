import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { aboutText, priceText, rateItem } from "@/lib/billing/ratecard";
import { policyBoard } from "@/lib/data/policy-rates";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "For institutions — African rates data, committee packs and licences",
  description:
    "For SACCOs, pension funds, insurers, bank treasuries, fintechs, media and DFIs: every Treasury bill auction in ten African markets, policy rates and Kenya's curve, as a committee pack, an API, a licence or a widget. Priced in shillings, with free samples.",
  alternates: { canonical: `${site.url}/for-institutions` },
};

type Buyer = {
  id: string;
  who: string;
  job: string;
  products: string[]; // ids in lib/billing/ratecard.ts
  start: { href: string; label: string; external?: boolean };
};

// Grouped by the job each buyer has to do; products and prices come from the rate card, so this page never
// disagrees with /prices.
const buyers: Buyer[] = [
  {
    id: "committees",
    who: "SACCOs, pension funds and insurers",
    job: "Table the rates, the curve and where the money earns most at every investment committee, without an analyst losing a day to it.",
    products: ["pack", "pack_plus", "benchmarking", "bidding"],
    start: { href: "/pack/sample", label: "Open this month's sample pack", external: true },
  },
  {
    id: "treasuries",
    who: "Bank and corporate treasuries",
    job: "Know each auction result the moment it lands, read the curve before you price, and brief the desk before 07:30.",
    products: ["trial", "pro", "team", "training"],
    start: { href: "/pricing", label: "Try Pro for 14 days" },
  },
  {
    id: "builders",
    who: "Fintechs, apps and newsrooms",
    job: "Put live, sourced rates in your product or your story: savings apps, lending calculators, market pages and charts.",
    products: ["api", "licence_startup", "widget"],
    start: { href: "/developers", label: "Call the API now, no key" },
  },
  {
    id: "investors",
    who: "DFIs, funds abroad and researchers",
    job: "Follow African sovereign funding costs across ten markets with full history, change notifications and someone to ask.",
    products: ["licence_institution", "frontier", "research", "bulk"],
    start: { href: "/licensing", label: "See the licences" },
  },
];

const year = (d?: string) => (d ? d.slice(0, 4) : null);

export default function ForInstitutionsPage() {
  const markets = billMarkets.map((m) => {
    const rows = loadBillMarket(m.slug).rows;
    const dates = rows.map((r) => r.date).sort();
    return { country: m.country, count: rows.length, from: year(dates[0]), last: dates.at(-1) ?? null };
  });
  const results = markets.reduce((n, m) => n + m.count, 0);
  const oldest = markets.map((m) => m.from).filter(Boolean).sort()[0];
  const policy = policyBoard().rows.length;

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "For institutions" }]}
      kicker="For institutions"
      title="The price of money in Africa, ready for your committee, desk or product"
      lede={
        <p>
          Afronomics reads every Treasury bill auction in ten African markets, central-bank policy rates and Kenya&rsquo;s bond curve from the publishers&rsquo;
          own documents, the moment they land. Institutions take it as a monthly committee pack, an API, a licence or a widget, priced in shillings for the
          people who use it most. Reading and citing stays free for everyone.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <p className="text-[14px] font-semibold text-ink">Talk to the desk</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">A 20-minute walkthrough on your own market, or an invoice in KES or USD. Reply within one business day.</p>
          <a href="#enquiry" className="mt-4 inline-block rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-paper hover:bg-forest">
            Book a walkthrough
          </a>
        </div>
      }
    >
      <section className="grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule grid-cols-2 lg:grid-cols-4">
        {[
          { v: String(billMarkets.length), k: "markets' Treasury bill auctions" },
          { v: results.toLocaleString("en-US"), k: "auction results in one history" },
          { v: oldest ?? "—", k: "earliest year on record" },
          { v: String(policy), k: "central-bank policy rates read daily" },
        ].map((s) => (
          <div key={s.k} className="bg-surface px-4 py-4">
            <p className="font-serif text-3xl text-ink">{s.v}</p>
            <p className="mt-1 text-[12px] text-muted">{s.k}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <SectionTitle kicker="By what you need to do" title="Four ways institutions use Afronomics" />
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {buyers.map((b) => (
            <article key={b.id} id={b.id} className="flex flex-col rounded-2xl border border-rule bg-surface px-5 py-6">
              <h3 className="font-serif text-2xl text-ink">{b.who}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{b.job}</p>
              <ul className="mt-4 flex-1 divide-y divide-rule border-y border-rule">
                {b.products
                  .map((id) => rateItem(id))
                  .filter((i) => i !== null)
                  .map((i) => (
                    <li key={i.id} className="flex items-baseline justify-between gap-4 py-2.5">
                      <span className="text-sm text-ink">
                        {i.href ? (
                          <Link href={i.href} className="hover:text-forest">
                            {i.name}
                          </Link>
                        ) : (
                          i.name
                        )}
                      </span>
                      <span className="shrink-0 text-right text-[13px] text-ink-soft">
                        <strong className="text-ink">{priceText(i)}</strong>
                        {i.unit ? ` ${i.unit}` : ""}
                        {aboutText(i) ? <span className="block text-[11px] text-muted">{aboutText(i)}</span> : null}
                      </span>
                    </li>
                  ))}
              </ul>
              <div className="mt-5">
                {b.start.external ? (
                  <a href={b.start.href} target="_blank" rel="noopener" className="inline-block rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-paper hover:bg-forest">
                    {b.start.label}
                  </a>
                ) : (
                  <Link href={b.start.href} className="inline-block rounded-full bg-ink px-4 py-2 text-[14px] font-semibold text-paper hover:bg-forest">
                    {b.start.label}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Every product and price is on the{" "}
          <Link href="/prices" className="underline underline-offset-2">
            price guide
          </Link>
          . Annual billing takes two months off. M-Pesa, card, bank transfer or invoice.
        </p>
      </section>

      <section className="mt-14">
        <SectionTitle kicker="Before finance gets involved" title="Try it today, free or nearly" />
        <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-3">
          <div className="bg-surface px-5 py-5">
            <p className="text-[13px] font-semibold text-gold">See the pack</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">This month&rsquo;s committee pack with live figures, for Kenya or any of the ten markets. Open it and print to PDF.</p>
            <a href="/pack/sample" target="_blank" rel="noopener" className="mt-3 inline-block text-[14px] font-semibold text-forest underline underline-offset-2">
              Open the sample
            </a>
          </div>
          <div className="bg-surface px-5 py-5">
            <p className="text-[13px] font-semibold text-gold">Call the API</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">No key and no sign-up. The latest results for every market, as JSON:</p>
            <code className="mt-2 block overflow-x-auto rounded-lg bg-paper-2 px-3 py-2 text-[12px]">curl {site.url}/api/v1/tbills</code>
          </div>
          <div className="bg-surface px-5 py-5">
            <p className="text-[13px] font-semibold text-gold">Try Pro for 14 days</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              {rateItem("trial") ? `${priceText(rateItem("trial")!)} by M-Pesa: ` : ""}the Morning by email, auction alerts and every brief in full.
            </p>
            <Link href="/pricing" className="mt-3 inline-block text-[14px] font-semibold text-forest underline underline-offset-2">
              Start the trial
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <SectionTitle kicker="Why you can table it" title="How the numbers stand up" />
        <ul className="mt-4 grid gap-6 md:grid-cols-2">
          {[
            ["Read from the source", "Every figure is read from the central bank's, treasury's or debt office's own notice, and links back to it."],
            ["Nothing overwritten", "History is appended, never silently changed: every result keeps its date and the notice it came from."],
            ["Corrections in public", "Any error we make is corrected and listed on the corrections page with the date."],
            ["Method on the record", "How each dataset is read, checked and dated is written down for anyone to audit."],
          ].map(([t, d]) => (
            <li key={t}>
              <h3 className="font-serif text-xl text-ink">{t}</h3>
              <p className="mt-1 text-sm leading-6 text-ink-soft">{d}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/method" className="underline underline-offset-2">
            Sources and method
          </Link>
          {" · "}
          <Link href="/corrections" className="underline underline-offset-2">
            Corrections
          </Link>
          {" · "}
          <Link href="/markets/tbills" className="underline underline-offset-2">
            The ten-market monitor
          </Link>
        </p>
      </section>

      <section className="mt-14">
        <SectionTitle kicker="Coverage" title="Auction history by market" />
        <div className="mt-2 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Market</th>
                <th className="text-right">Results</th>
                <th className="text-right">From</th>
                <th className="text-right">Latest</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((m) => (
                <tr key={m.country}>
                  <td className="text-sm">{m.country}</td>
                  <td className="text-right text-sm">{m.count.toLocaleString("en-US")}</td>
                  <td className="text-right text-sm">{m.from ?? "—"}</td>
                  <td className="text-right text-sm">{m.last ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14 max-w-2xl" id="enquiry">
        <SectionTitle kicker="Talk to the desk" title="Book a walkthrough or ask for an invoice" />
        <div className="mt-4">
          <EnquiryForm interest="pack" cta="Send" />
        </div>
      </section>
    </PageShell>
  );
}
