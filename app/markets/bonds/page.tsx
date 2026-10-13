import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { bondFacts, issuersOf, longDate, shortName, tenorText, todayIso } from "@/components/bonds/stats";
import { renderTime } from "@/lib/data/fetcher";
import { bondMarkets, loadBondMarket } from "@/lib/data/sovereign-bonds";
import { dataCatalogJsonLd, frontierDebtDatasetJsonLd } from "@/lib/seo/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/lib/site";

export const revalidate = 3600;

const title = "African government bond auctions, market by market";
const description =
  "Every local-currency government bond auction result Afronomics holds, by market: Kenya, Nigeria, Egypt, Uganda, Zambia, Morocco and the eight WAEMU treasuries. Rates, bid cover and amounts from the publishers, with CSV and API.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${site.url}/markets/bonds` },
  openGraph: { title, description, url: `${site.url}/markets/bonds` },
};

export default function BondAuctionsIndex() {
  const today = todayIso(renderTime());
  const markets = bondMarkets
    .map((market) => {
      const { rows } = loadBondMarket(market.slug);
      return { market, facts: bondFacts(rows, today), issuers: market.slug === "waemu" ? issuersOf(rows) : [] };
    })
    .sort((a, b) => (b.facts?.results ?? 0) - (a.facts?.results ?? 0));
  const held = markets.filter((m) => m.facts);
  const total = held.reduce((n, m) => n + (m.facts?.results ?? 0), 0);

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { label: "Bond auctions" }]}
      kicker="Afronomics datasets · Government bonds"
      title="African government bond auctions"
      lede={
        <p>
          {total.toLocaleString("en-US")} local-currency bond auction results across {held.length} markets, each taken from the debt office or central
          bank that ran the auction and kept in one shape: rate, tenor, bid cover and amounts. <em>Information, not advice.</em>
        </p>
      }
      aside={
        <Link href="/data/frontier-local-debt#pilot" className="block rounded-2xl bg-ink px-5 py-5 text-paper hover:bg-forest">
          <p className="text-[13px] font-medium opacity-80">For desks and funds</p>
          <p className="mt-1 font-serif text-2xl">Request a 30-day pilot</p>
          <p className="text-[12px] opacity-80">Every market, delivered daily</p>
        </Link>
      }
    >
      <JsonLd
        data={[
          dataCatalogJsonLd(
            "African government bond auction results",
            "/markets/bonds",
            description,
            held.flatMap(({ market, issuers }) => [
              { name: `${shortName(market)} government bond auction results`, path: market.slug === "kenya" ? "/markets/kenya-bonds" : `/markets/bonds/${market.slug}` },
              ...issuers.map((i) => ({ name: `${i.name} government bond auction results`, path: `/markets/bonds/${market.slug}/${i.slug}` })),
            ]),
          ),
          frontierDebtDatasetJsonLd(),
        ]}
      />
      <SectionTitle kicker="Markets" title="Pick a market" note="Ordered by results held. Dates are the newest result in each dataset; some publishers date results by settlement." />
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {markets.map(({ market, facts, issuers }) => {
          const settlement = market.dateKind === "settlement";
          return (
            <li key={market.slug} className="flex flex-col rounded-2xl border border-rule bg-surface px-5 py-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-serif text-2xl text-ink">
                  {facts ? (
                    <Link href={`/markets/bonds/${market.slug}`} className="hover:text-forest">
                      {shortName(market)}
                    </Link>
                  ) : (
                    shortName(market)
                  )}
                </h2>
                <span className="font-mono text-[11px] text-muted">{market.currency}</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted">{market.publisher}</p>
              {facts ? (
                <>
                  <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <dt className="text-[12px] text-muted">Results held</dt>
                      <dd className="font-mono text-ink">{facts.results.toLocaleString("en-US")}</dd>
                    </div>
                    <div>
                      <dt className="text-[12px] text-muted">Since</dt>
                      <dd className="font-mono text-ink">{facts.first.slice(0, 4)}</dd>
                    </div>
                    <div>
                      <dt className="text-[12px] text-muted">{settlement ? "Newest settlement" : "Newest auction"}</dt>
                      <dd className="font-mono text-ink">
                        {longDate(facts.newest)}
                        {facts.newestIsFuture ? <span className="block text-[11px] text-muted">{settlement ? "settles" : "scheduled"}</span> : null}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[12px] text-muted">Longest tenor, latest</dt>
                      <dd className="font-mono text-ink">
                        {facts.longest ? `${facts.longest.rate.toFixed(2)}% · ${tenorText(facts.longest.tenor_years)}` : "—"}
                      </dd>
                    </div>
                  </dl>
                  {issuers.length ? (
                    <p className="mt-4 text-xs leading-6 text-ink-soft">
                      By issuer:{" "}
                      {issuers.map((i, k) => (
                        <span key={i.slug}>
                          {k ? " · " : ""}
                          <Link href={`/markets/bonds/${market.slug}/${i.slug}`} className="underline underline-offset-2 hover:text-forest">
                            {i.name}
                          </Link>
                        </span>
                      ))}
                    </p>
                  ) : null}
                  <Link
                    href={`/markets/bonds/${market.slug}`}
                    className="mt-auto self-start pt-5 text-[13px] font-medium text-forest hover:text-gold"
                  >
                    All {shortName(market)} results →
                  </Link>
                </>
              ) : (
                <p className="mt-4 text-sm text-muted">Results are being compiled and will appear here shortly.</p>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-8 max-w-3xl text-sm leading-6 text-ink-soft">
        Every market is also available as CSV at <span className="font-mono text-[13px]">/api/data/bonds/&#123;market&#125;</span> and as JSON through the{" "}
        <Link href="/developers" className="underline underline-offset-2 hover:text-forest">
          data API
        </Link>{" "}
        at <span className="font-mono text-[13px]">/api/v1/bonds/&#123;market&#125;</span>. Treasury bills are on the{" "}
        <Link href="/markets/tbills" className="underline underline-offset-2 hover:text-forest">
          Africa T-bill monitor
        </Link>
        .
      </p>
    </PageShell>
  );
}
