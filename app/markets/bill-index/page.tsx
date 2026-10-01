import type { Metadata } from "next";
import Link from "next/link";
import { LineChart } from "@/components/data/LineChart";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { billIndexLatest, indexName, indexShort } from "@/lib/data/bill-index";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `${indexName} (${indexShort}) — what African governments pay to borrow, in one number`,
  description:
    "Published every Monday: the average one-year Treasury bill rate across ten African markets, from each central bank’s own auction results, with weekly, monthly and yearly changes and every market’s contribution.",
  alternates: { canonical: `${site.url}/markets/bill-index` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const shortFmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
const bps = (v: number | null) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : "±"}${Math.abs(v)} bps`);

export default function BillIndexPage() {
  const idx = billIndexLatest(364);
  const idx91 = billIndexLatest(91);
  if (!idx) return null;
  const rows = idx.series.map((p) => ({ date: p.date, values: { asbi: p.value, asbi91: idx91?.series.find((q) => q.date === p.date)?.value ?? null } }));
  const quote = `The Afronomics African Sovereign Bill Index stood at ${idx.latest.value.toFixed(2)}% on ${dateFmt.format(new Date(idx.latest.date))}, ${idx.bpsWeek == null ? "" : `${idx.bpsWeek === 0 ? "unchanged" : `${idx.bpsWeek > 0 ? "up" : "down"} ${Math.abs(idx.bpsWeek)} basis points`} on the week and `}${idx.bpsYear == null ? "" : `${idx.bpsYear > 0 ? "up" : "down"} ${Math.abs(idx.bpsYear)} basis points on a year earlier`}.`;

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { label: indexShort }]}
      kicker={`${indexName} · week of ${dateFmt.format(new Date(idx.latest.date))}`}
      title="What African governments pay to borrow, in one number"
      lede={
        <p>
          The {indexShort} is the average one-year Treasury bill rate across the ten African markets on the{" "}
          <Link href="/markets/tbills" className="underline underline-offset-2">
            T-bill monitor
          </Link>
          , computed every Monday from each central bank’s own auction results. It has run from {shortFmt.format(new Date(idx.series[0].date))}; its high was{" "}
          {idx.high.value.toFixed(2)}% in {shortFmt.format(new Date(idx.high.date))} and its low {idx.low.value.toFixed(2)}% in {shortFmt.format(new Date(idx.low.date))}.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <p className="text-[13px] font-medium text-muted">{indexShort}, 364-day</p>
          <p className="mt-1 font-serif text-5xl text-ink">{idx.latest.value.toFixed(2)}%</p>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-[12px]">
            {[
              ["Week", idx.bpsWeek],
              ["Month", idx.bpsMonth],
              ["Year", idx.bpsYear],
            ].map(([k, v]) => (
              <div key={k as string}>
                <dt className="text-muted">{k}</dt>
                <dd className={`font-semibold ${v == null || v === 0 ? "text-ink" : (v as number) > 0 ? "text-down" : "text-up"}`}>{bps(v as number | null)}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[11px] text-muted">{idx.latest.markets} of 10 markets in this week’s reading</p>
        </div>
      }
    >
      <section>
        <SectionTitle kicker="History" title={`${indexShort} since ${shortFmt.format(new Date(idx.series[0].date))}`} note="Weekly readings. The 91-day version uses the same method on three-month bills." />
        <div className="mt-4">
          <LineChart
            rows={rows}
            series={[
              { key: "asbi", label: `${indexShort} 364-day`, color: "var(--series-1)" },
              { key: "asbi91", label: `${indexShort} 91-day`, color: "var(--series-2)" },
            ]}
            label="Afronomics African Sovereign Bill Index over time"
          />
        </div>
      </section>

      <section className="mt-14">
        <SectionTitle kicker="This week" title="Every market’s contribution" href="/markets/tbills" hrefLabel="T-bill monitor" />
        <div className="overflow-x-auto">
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th>Market</th>
                <th className="text-right">364-day rate</th>
                <th className="text-right">Week</th>
                <th className="text-right">Month</th>
                <th className="text-right">vs index</th>
                <th>Auction</th>
              </tr>
            </thead>
            <tbody>
              {idx.contributions.map((c) => (
                <tr key={c.market.slug}>
                  <td>
                    <Link href={c.market.href} className="font-medium hover:text-forest">
                      {c.market.country}
                    </Link>
                  </td>
                  <td className="text-right">{c.rate.toFixed(2)}%</td>
                  <td className="text-right text-xs">{c.weekAgo == null ? "—" : bps(Math.round((c.rate - c.weekAgo) * 100))}</td>
                  <td className="text-right text-xs">{c.monthAgo == null ? "—" : bps(Math.round((c.rate - c.monthAgo) * 100))}</td>
                  <td className={`text-right text-xs ${c.rate >= idx.latest.value ? "text-down" : "text-up"}`}>{bps(Math.round((c.rate - idx.latest.value) * 100))}</td>
                  <td className="text-xs">
                    <Link href={`${c.market.slug === "kenya" ? "/markets/kenya-tbills" : `/markets/tbills/${c.market.slug}`}/${c.date}`} className="hover:text-forest">
                      {c.date}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-14 max-w-3xl">
        <SectionTitle kicker="Method" title="How the index is built" />
        <div className="article-body mt-4">
          <p>
            Each Monday, for every market on the T-bill monitor, take the rate at the most recent 364-day Treasury bill auction, counting a result for up to
            120 days after its auction. The index is the simple average of those rates, published to three decimals. A week needs at least six markets to
            print. Rate measures are as each central bank publishes them (weighted average, stop rate, cut-off yield), compared without adjustment.
          </p>
          <p>
            Equal weighting makes the index a measure of the typical African market rather than of its largest borrowers; weighting by debt outstanding would
            make it a reading of Egypt and Nigeria. The per-market table above lets anyone re-weight it. The 91-day version follows the same method on
            three-month bills. The index is revised when a central bank restates a result; revisions are rare and noted on the market’s page.
          </p>
          <p>
            Quote it as: “{quote}”
          </p>
        </div>
      </section>

      <CiteBlock title={`${indexName} (${indexShort})`} path="/markets/bill-index" publisher="ten African central banks’ auction results" />
      <NewsletterBand title="The Afronomics Weekly" lede="The index and the week’s auctions, every Monday. Free." />
    </PageShell>
  );
}
