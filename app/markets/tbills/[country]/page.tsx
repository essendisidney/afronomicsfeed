import type { Metadata } from "next";
import Link from "next/link";
import { AlertButton } from "@/components/ui/AlertButton";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { notFound, redirect } from "next/navigation";
import { LineChart } from "@/components/data/LineChart";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { tenorColor, tenorLabel } from "@/lib/data/kenya-tbills";
import { billHistory, billMarkets, billTenors, billWeeks, getBillMarket, latestBills, loadBillMarket } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";

export const revalidate = 3600;

export function generateStaticParams() {
  return billMarkets.filter((m) => m.slug !== "kenya").map((m) => ({ country: m.slug }));
}

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const market = getBillMarket(country);
  if (!market) return { title: "Not found" };
  return {
    title: `${market.country} Treasury bill auction results — every auction, rates and history`,
    description: `Every ${market.publisher} Treasury bill auction in one table: 91-, 182- and 364-day rates, bids and amounts accepted, with a free CSV.`,
    alternates: { canonical: `${site.url}/markets/tbills/${market.slug}` },
  };
}

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function BillMarketPage({ params }: Props) {
  const { country } = await params;
  const market = getBillMarket(country);
  if (!market) notFound();
  if (market.slug === "kenya") redirect("/markets/kenya-tbills");
  const { rows, updatedAt, notes } = loadBillMarket(market.slug);
  const latest = latestBills(rows);
  const weeks = billWeeks(rows, 52);
  const since = rows[0] ? `${Number(rows[0].date.slice(0, 4)) - 5}${rows[0].date.slice(4)}` : undefined;
  const history = billHistory(rows, since);
  const first = rows.at(-1)?.date;
  const money = (m: number | null | undefined) => (m == null ? "—" : `${market.currency} ${m >= 1000 ? `${(m / 1000).toFixed(1)}bn` : `${m.toFixed(0)}m`}`);
  const bps = (from?: number, to?: number) => {
    if (from == null || to == null) return "—";
    const d = Math.round((to - from) * 100);
    return `${d > 0 ? "+" : d < 0 ? "−" : "±"}${Math.abs(d)} bps`;
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${market.country} Treasury bill auction results`,
    description: `Every ${market.publisher} Treasury bill auction: rates, bids and amounts accepted, by tenor.`,
    url: `${site.url}/markets/tbills/${market.slug}`,
    temporalCoverage: first && rows[0] ? `${first}/${rows[0].date}` : undefined,
    spatialCoverage: market.country,
    creator: { "@type": "Organization", name: site.name, url: site.url },
    isBasedOn: market.sourcePage,
    distribution: [{ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${site.url}/api/data/tbills/${market.slug}` }],
  };

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { href: "/markets/tbills", label: "T-bill monitor" }, { label: market.country }]}
      kicker={`Afronomics dataset · ${market.country}`}
      title={`${market.country} Treasury bill auctions`}
      lede={
        <p>
          {rows.length.toLocaleString("en-US")} tenor results{first ? ` since ${dateFmt.format(new Date(first))}` : ""}, from the {market.publisher}’s own
          publications, in one table. Compare every market on the{" "}
          <Link href="/markets/tbills" className="underline underline-offset-2">
            Africa T-bill monitor
          </Link>
          .
        </p>
      }
      aside={
        rows.length ? (
          <a href={`/api/data/tbills/${market.slug}`} download className="block rounded-2xl bg-ink px-5 py-5 text-paper hover:bg-forest">
            <p className="text-[13px] font-medium opacity-80">Download</p>
            <p className="mt-1 font-serif text-2xl">Full history as CSV</p>
            <p className="text-[12px] opacity-80">Source: {market.publisher}</p>
          </a>
        ) : null
      }
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {rows.length === 0 ? (
        <p className="text-sm text-muted">This dataset is being compiled and will appear here shortly.</p>
      ) : (
        <>
          <section className="grid gap-px bg-rule sm:grid-cols-3">
            {billTenors.map((tenor) => {
              const item = latest.get(tenor);
              if (!item) return <div key={tenor} className="bg-paper-2 px-5 py-5 text-sm text-muted">No {tenorLabel[tenor]} result</div>;
              return (
                <div key={tenor} className="bg-paper-2 px-5 py-5">
                  <p className="flex items-center gap-2 font-medium text-[12px] text-muted">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: tenorColor[tenor] }} />
                    {tenorLabel[tenor]} · {dateFmt.format(new Date(item.latest.date))}
                  </p>
                  <p className="mt-2 font-serif text-4xl tracking-[-0.02em] text-ink">{item.latest.rate.toFixed(3)}%</p>
                  <p className="mt-1 text-xs text-ink-soft">{bps(item.previous?.rate, item.latest.rate)} vs previous auction</p>
                  <dl className="mt-4 grid grid-cols-2 gap-y-1 text-xs">
                    <dt className="text-muted">Bids</dt>
                    <dd className="text-right font-mono">{money(item.latest.received)}</dd>
                    <dt className="text-muted">Accepted</dt>
                    <dd className="text-right font-mono">{money(item.latest.accepted)}</dd>
                  </dl>
                </div>
              );
            })}
          </section>
          <SourceLine name={market.publisher} href={market.sourcePage} detail={market.rateNote} />
          {notes ? <p className="mt-2 max-w-3xl text-xs leading-5 text-muted">{notes}</p> : null}
          <div className="mt-6">
            <AlertButton market={market.slug} label={`Alert me on ${market.country} results`} />
          </div>

          <section className="mt-14">
            <SectionTitle kicker="History" title={`${market.rateLabel}, last five years`} note="One point per auction. Hover or tap for the exact figures." />
            <div className="mt-4">
              <LineChart
                rows={history}
                series={billTenors.map((tenor) => ({ key: String(tenor), label: tenorLabel[tenor], color: tenorColor[tenor] }))}
                label={`${market.country} Treasury bill rates by tenor over time`}
              />
            </div>
          </section>

          <section className="mt-14">
            <SectionTitle kicker="Table" title="The last 52 auctions" note={`Rates are the ${market.rateNote}.`} />
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Value date</th>
                    {billTenors.map((tenor) => (
                      <th key={tenor} className="text-right">
                        {tenorLabel[tenor]}
                      </th>
                    ))}
                    <th className="text-right">Bids</th>
                    <th className="text-right">Accepted</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week) => (
                    <tr key={week.date}>
                      <td className="whitespace-nowrap">
                        <Link href={`/markets/tbills/${market.slug}/${week.date}`} className="text-xs font-medium hover:text-forest">
                          {week.date}
                        </Link>
                        {week.source && week.source !== market.sourcePage ? (
                          <a href={week.source} target="_blank" rel="noopener noreferrer" className="ml-2 text-[11px] text-muted hover:text-forest">
                            notice
                          </a>
                        ) : null}
                      </td>
                      {billTenors.map((tenor) => {
                        const row = week.rows.find((item) => item.tenor === tenor);
                        return (
                          <td key={tenor} className="text-right font-mono text-xs">
                            {row ? `${row.rate.toFixed(3)}%` : "—"}
                          </td>
                        );
                      })}
                      <td className="text-right font-mono text-xs">{money(week.received)}</td>
                      <td className="text-right font-mono text-xs">{money(week.accepted)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SourceLine name={market.publisher} href={market.sourcePage} detail={`compiled by Afronomics${updatedAt ? ` · updated ${updatedAt.slice(0, 10)}` : ""}`} />
          </section>
        </>
      )}
      {rows.length ? (
        <CiteBlock title={`${market.country} Treasury bill auction results`} path={`/markets/tbills/${market.slug}`} publisher={`the ${market.publisher}`} csv={`/api/data/tbills/${market.slug}`} />
      ) : null}
      <NewsletterBand />
    </PageShell>
  );
}
