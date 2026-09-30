import type { Metadata } from "next";
import Link from "next/link";
import { LineChart } from "@/components/data/LineChart";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { auctionWeeks, latestByTenor, loadTbills, rateHistory, tenorColor, tenorLabel, tenors } from "@/lib/data/kenya-tbills";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kenya Treasury bill auction results — every CBK auction, rates and subscription",
  description:
    "Every Central Bank of Kenya Treasury bill auction in one table: 91-, 182- and 364-day weighted average rates, amounts offered, bids received, subscription and amounts accepted, with a free CSV.",
  alternates: { canonical: `${site.url}/markets/kenya-tbills` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const kes = (m: number | null | undefined) => (m == null ? "—" : `KES ${(m / 1000).toFixed(1)}bn`);
const pct = (v: number | null | undefined, d = 2) => (v == null ? "—" : `${v.toFixed(d)}%`);
const bps = (from?: number, to?: number) => {
  if (from == null || to == null) return null;
  const delta = Math.round((to - from) * 100);
  return `${delta > 0 ? "+" : delta < 0 ? "−" : "±"}${Math.abs(delta)} bps`;
};

export default function KenyaTbillsPage() {
  const file = loadTbills();
  const latest = latestByTenor(file.rows);
  const weeks = auctionWeeks(file.rows, 52);
  const history = rateHistory(file.rows);
  const first = file.rows.at(-1)?.value_date;
  const lastDate = file.rows[0]?.value_date;
  const year = lastDate?.slice(0, 4);
  const ytd = file.rows.filter((row) => row.value_date.startsWith(year ?? "----"));
  const ytdAccepted = ytd.reduce((total, row) => total + (row.accepted_kes_m ?? 0), 0);
  const ytdOffered = ytd.reduce((total, row) => total + (row.offered_kes_m ?? 0), 0);
  const ytdReceived = ytd.reduce((total, row) => total + (row.received_kes_m ?? 0), 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Kenya Treasury bill auction results",
    description: "Every Central Bank of Kenya Treasury bill auction: rates, amounts offered, received and accepted, by tenor.",
    url: `${site.url}/markets/kenya-tbills`,
    temporalCoverage: first && lastDate ? `${first}/${lastDate}` : undefined,
    spatialCoverage: "Kenya",
    creator: { "@type": "Organization", name: site.name, url: site.url },
    isBasedOn: file.sourcePage,
    distribution: [{ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${site.url}/api/data/kenya-tbills` }],
  };

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { label: "Kenya T-bills" }]}
      kicker="Afronomics dataset · Kenya"
      title="Kenya Treasury bill auctions"
      lede={
        <p>
          Every result the Central Bank of Kenya has published{first ? ` since ${dateFmt.format(new Date(first))}` : ""} —{" "}
          {file.rows.length.toLocaleString("en-US")} tenor results from {file.notices.toLocaleString("en-US")} notices — read from the
          CBK’s PDFs into one table. The CBK publishes each week as a separate document; this is the only place they sit together. See also{" "}
          <Link href="/markets/kenya-bonds" className="underline underline-offset-2">
            bond auctions and the yield curve
          </Link>
          .
        </p>
      }
      aside={
        <a href="/api/data/kenya-tbills" download className="block bg-gold px-5 py-5 text-white hover:bg-gold-soft">
          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-white/80">Download</p>
          <p className="mt-1 font-serif text-2xl">Full history · CSV</p>
          <p className="text-[11px] text-white/80">Every row links to its CBK notice</p>
        </a>
      }
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {file.rows.length === 0 ? (
        <p className="text-sm text-muted">The dataset is being compiled.</p>
      ) : (
        <>
          <section className="grid gap-px bg-rule sm:grid-cols-3">
            {tenors.map((tenor) => {
              const item = latest.get(tenor);
              if (!item) return <div key={tenor} className="bg-paper-2 px-5 py-5 text-sm text-muted">No {tenorLabel[tenor]} result</div>;
              const { latest: row, previous } = item;
              return (
                <div key={tenor} className="bg-paper-2 px-5 py-5">
                  <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ background: tenorColor[tenor] }} />
                    {tenorLabel[tenor]} · {dateFmt.format(new Date(row.value_date))}
                  </p>
                  <p className="mt-2 font-serif text-4xl tracking-[-0.02em] text-ink">{pct(row.weighted_avg_rate, 3)}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {bps(previous?.weighted_avg_rate, row.weighted_avg_rate) ?? "—"} vs previous auction
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-y-1 text-xs">
                    <dt className="text-muted">Offered</dt>
                    <dd className="text-right font-mono">{kes(row.offered_kes_m)}</dd>
                    <dt className="text-muted">Bids</dt>
                    <dd className="text-right font-mono">{kes(row.received_kes_m)}</dd>
                    <dt className="text-muted">Subscription</dt>
                    <dd className="text-right font-mono">{pct(row.subscription_pct, 0)}</dd>
                    <dt className="text-muted">Accepted</dt>
                    <dd className="text-right font-mono">{kes(row.accepted_kes_m)}</dd>
                  </dl>
                </div>
              );
            })}
          </section>
          <SourceLine name="Central Bank of Kenya" href={file.sourcePage} detail="weighted average rate of accepted bids" />

          <section className="mt-14">
            <SectionTitle
              kicker="History"
              title="Weighted average rate of accepted bids"
              note="One point per auction. Hover or tap for the exact figures."
            />
            <div className="mt-4">
              <LineChart
                rows={history}
                series={tenors.map((tenor) => ({ key: String(tenor), label: tenorLabel[tenor], color: tenorColor[tenor] }))}
                label="Kenya Treasury bill weighted average rates by tenor over time"
              />
            </div>
          </section>

          {year ? (
            <section className="mt-12 grid grid-cols-2 gap-px bg-rule lg:grid-cols-4">
              {[
                { label: `Offered, ${year}`, value: kes(ytdOffered) },
                { label: `Bids, ${year}`, value: kes(ytdReceived) },
                { label: `Accepted, ${year}`, value: kes(ytdAccepted) },
                { label: `Subscription, ${year}`, value: ytdOffered ? pct((ytdReceived / ytdOffered) * 100, 0) : "—" },
              ].map((stat) => (
                <div key={stat.label} className="bg-paper-2 px-4 py-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{stat.label}</p>
                  <p className="mt-1 font-serif text-2xl text-ink">{stat.value}</p>
                </div>
              ))}
            </section>
          ) : null}

          <section className="mt-14">
            <SectionTitle kicker="Table" title="The last 52 auctions" note="Rates are the weighted average of accepted bids. Click a date for the CBK notice." />
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Value date</th>
                    {tenors.map((tenor) => (
                      <th key={tenor} className="text-right">
                        {tenorLabel[tenor]}
                      </th>
                    ))}
                    <th className="text-right">Offered</th>
                    <th className="text-right">Bids</th>
                    <th className="text-right">Subscription</th>
                    <th className="text-right">Accepted</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week) => (
                    <tr key={week.date}>
                      <td>
                        <a href={week.source} target="_blank" rel="noopener noreferrer" className="font-mono text-xs hover:text-forest">
                          {week.date}
                        </a>
                      </td>
                      {tenors.map((tenor) => {
                        const row = week.rows.find((item) => item.tenor === tenor);
                        return (
                          <td key={tenor} className="text-right font-mono text-xs">
                            {row ? pct(row.weighted_avg_rate, 3) : "—"}
                          </td>
                        );
                      })}
                      <td className="text-right font-mono text-xs">{kes(week.offered)}</td>
                      <td className="text-right font-mono text-xs">{kes(week.received)}</td>
                      <td className="text-right font-mono text-xs">{week.subscription == null ? "—" : pct(week.subscription, 0)}</td>
                      <td className="text-right font-mono text-xs">{kes(week.accepted)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SourceLine
              name="Central Bank of Kenya, Treasury bill result notices"
              href={file.sourcePage}
              detail={`extracted by Afronomics${file.updatedAt ? ` · updated ${file.updatedAt.slice(0, 10)}` : ""}`}
            />
          </section>

          <section className="mt-14 max-w-2xl text-sm leading-6 text-ink-soft">
            <h2 className="font-serif text-xl text-ink">How this table is built</h2>
            <p className="mt-2">
              Each week the CBK posts a PDF notice. Afronomics reads every notice on the CBK Treasury bills page, extracts the auction table for
              each tenor and keeps the link to the notice on every row. Notices older than the current layout are read with the same rules;
              any that could not be read are left out rather than guessed. Spot an error? See{" "}
              <Link href="/corrections" className="underline underline-offset-2">
                corrections
              </Link>
              .
            </p>
          </section>
        </>
      )}

      <NewsletterBand lede="Kenya’s auction results, plus 53 other economies, in one Monday email." />
    </PageShell>
  );
}
