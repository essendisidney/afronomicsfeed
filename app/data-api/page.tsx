import { bondCoverageText, bondResultCount, publishedBondMarkets } from "@/lib/data/sovereign-bonds";
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
  title: "Afronomics Data — African government bond and bill auctions as an API",
  description:
    "African local-currency government bond and Treasury bill auction results, read from each issuer the day they publish, with the source for every figure: an API and CSV with full history. Analyst $250 a month, Team and API $1,500, Enterprise from $5,000.",
  alternates: { canonical: `${site.url}/data-api` },
};

const PLANS = ["licence_institution", "data_api", "enterprise"] as const;

export default function DataApiPage() {
  const markets = billMarkets.map((m) => loadBillMarket(m.slug).rows);
  const results = markets.reduce((n, rows) => n + rows.length, 0);
  const since = markets.flatMap((rows) => (rows.length ? [rows[rows.length - 1].date] : [])).sort()[0];
  const policies = policyBoard().rows.length;
  const startup = rateItem("licence_startup");
  const bondMarketsLive = publishedBondMarkets();
  const bondResults = bondResultCount();

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/for-institutions", label: "For institutions" }, { label: "Data API" }]}
      kicker="Afronomics Data"
      title="African government debt auctions, as one clean feed"
      lede={
        <p>
          Local-currency government bond auctions in {bondCoverageText()}, and every Treasury bill auction in {billMarkets.length} markets, read from each
          issuer the day it publishes, with the source document for every figure: {(bondResults + results).toLocaleString("en-US")} auction results, {policies}{" "}
          policy rates, Eurobond yields and the Afronomics Sovereign Bill Index, through one API and CSV.
        </p>
      }
    >
      <p className="mb-6 rounded-xl border-l-4 border-forest bg-forest/5 px-4 py-3 text-[14px] text-ink-soft">
        Investing in the African markets of JPMorgan’s GBI-EM Edge?{" "}
        <Link href="/data/frontier-local-debt" className="font-semibold text-forest underline underline-offset-2">
          See the latest auction in each market and request a 30-day free pilot
        </Link>
        .
      </p>
      <section className="grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-3">
        {[
          { v: String(bondMarketsLive.length === 0 ? 0 : bondMarketsLive.length + (bondMarketsLive.some((m) => m.slug === "waemu") ? 7 : 0)), k: `bond markets (${bondResults.toLocaleString("en-US")} results)` },
          { v: String(billMarkets.length), k: `T-bill markets (${results.toLocaleString("en-US")} results${since ? ` since ${since.slice(0, 4)}` : ""})` },
          { v: "Daily", k: "read from the source, checked for freshness after every run" },
        ].map((s) => (
          <div key={s.k} className="bg-surface px-4 py-4">
            <p className="font-serif text-3xl text-ink">{s.v}</p>
            <p className="mt-1 text-[12px] text-muted">{s.k}</p>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <SectionTitle kicker="Plans" title="Priced in dollars for funds and institutions" note="Invoiced in USD or KES. Kenyan and African desks: the shilling prices on /prices still apply." />
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {PLANS.map((id) => {
            const p = rateItem(id)!;
            return (
              <div key={id} className="flex flex-col rounded-2xl border border-rule bg-surface px-5 py-5">
                <p className="text-[13px] font-semibold text-accent">{p.name}</p>
                <p className="mt-2 font-serif text-3xl text-ink">
                  {priceText(p)}
                  <span className="ml-1 text-sm text-muted">{p.unit}</span>
                </p>
                <p className="text-[12px] text-muted">{aboutText(p)}{p.currency === "KES" ? ", invoiced in dollars on request" : ""}</p>
                <p className="mt-3 flex-1 text-[14px] leading-6 text-ink-soft">{p.what}</p>
              </div>
            );
          })}
        </div>
        {startup ? (
          <p className="mt-3 text-[13px] text-ink-soft">
            Building one product? The {startup.name} is {priceText(startup)} {startup.unit} ({aboutText(startup)}).{" "}
            <Link href="/licensing" className="underline underline-offset-2">
              All licences
            </Link>
            .
          </p>
        ) : null}
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div className="min-w-0">
          <SectionTitle kicker="How it works" title="Open to try, keyed to build on" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>
              <strong className="text-ink">Try it now, no key:</strong> the{" "}
              <Link href="/developers" className="underline underline-offset-2">
                open API
              </Link>{" "}
              serves the same datasets with a five-minute cache, free with attribution.
            </li>
            <li>
              <strong className="text-ink">Licensed customers get a key:</strong> send it as <code className="font-mono text-[13px]">Authorization: Bearer afk_…</code>.
              Keyed calls are served fresh, never from the shared cache, and counted per key so you get usage reports.
            </li>
            <li>
              <strong className="text-ink">Every figure has its source:</strong> each auction result links to the central bank’s own notice, and corrections are
              logged publicly.
            </li>
            <li>
              <strong className="text-ink">Also as files:</strong> CSV for every dataset; Excel, Google Sheets and SFTP delivery on the enterprise plan.
            </li>
          </ul>
        </div>
        <div className="min-w-0">
          <SectionTitle kicker="Example" title="Nigeria’s last ten 364-day auctions" />
          <pre className="mt-4 max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-ink px-4 py-4 text-[12px] leading-5 text-paper">
            {`curl -H "Authorization: Bearer afk_YOUR_KEY" \\
  "${site.url}/api/v1/tbills/nigeria?tenor=364&limit=10"`}
          </pre>
          <p className="mt-3 text-[13px] text-ink-soft">Government bond auctions ({bondCoverageText()}), by market and ISIN:</p>
          <pre className="mt-2 max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-ink px-4 py-4 text-[12px] leading-5 text-paper">
            {`curl "${site.url}/api/v1/bonds/egypt?from=2026-01-01"`}
          </pre>
          <p className="mt-2 text-[12px] text-muted">Leave out the header to call the open API.</p>
        </div>
      </section>

      <section className="mt-12 max-w-2xl">
        <SectionTitle kicker="Start" title="Ask for a 30-day free pilot or an invoice" note="Tell us your firm and what you are building. Reply within one business day." />
        <div className="mt-4">
          <EnquiryForm interest="licensing" cta="Request a 30-day pilot" />
        </div>
      </section>

      <p className="mt-10 text-sm text-ink-soft">
        Data compiled from central-bank publications. <em>Information, not advice.</em>
      </p>
    </PageShell>
  );
}
