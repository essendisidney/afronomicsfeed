import type { Metadata } from "next";
import Link from "next/link";
import { LineChart } from "@/components/data/LineChart";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { tenorLabel } from "@/lib/data/kenya-tbills";
import { billMarkets, billTenors, latestBills, loadBillMarket } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Africa Treasury bill monitor — Kenya, Nigeria, Ghana, Uganda and Tanzania auction rates side by side",
  description:
    "Latest 91-, 182- and 364-day Treasury bill auction rates across African markets, compiled from each central bank’s own results, with full histories and free CSVs.",
  alternates: { canonical: `${site.url}/markets/tbills` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const colors = ["var(--series-1)", "var(--series-2)", "var(--series-3)", "var(--series-4)", "var(--series-5)"];

export default function BillMonitorPage() {
  const markets = billMarkets.map((market) => {
    const { rows } = loadBillMarket(market.slug);
    return { market, rows, latest: latestBills(rows) };
  });
  const live = markets.filter((m) => m.rows.length > 0);

  // 364-day rate by market over the last three years, one line per market.
  const newest = live.map((m) => m.rows[0].date).sort().at(-1) ?? "2026-01-01";
  const since = `${Number(newest.slice(0, 4)) - 3}${newest.slice(4)}`;
  const byDate = new Map<string, Record<string, number | null>>();
  for (const { market, rows } of live) {
    for (const row of rows) {
      if (row.tenor !== 364 || row.date < since) continue;
      const entry = byDate.get(row.date) ?? Object.fromEntries(live.map((m) => [m.market.slug, null]));
      entry[market.slug] = row.rate;
      byDate.set(row.date, entry);
    }
  }
  const history = [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, values]) => ({ date, values }));
  const bps = (from?: number, to?: number) => {
    if (from == null || to == null) return "";
    const d = Math.round((to - from) * 100);
    return `${d > 0 ? "+" : d < 0 ? "−" : "±"}${Math.abs(d)}`;
  };

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { label: "T-bill monitor" }]}
      kicker="Afronomics dataset · Africa"
      title="Africa Treasury bill monitor"
      lede={
        <p>
          The latest government bill auctions across African markets, side by side, each compiled from the central bank’s own results. More markets
          are being added. Histories run from 2002 (Nigeria), 2011 (Kenya), 2012 (Tanzania), 2017 (Uganda, where the Bank of Uganda’s archive has gaps) and 2018 (Ghana).
        </p>
      }
    >
      <div className="overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Market</th>
              {billTenors.map((tenor) => (
                <th key={tenor} className="text-right">
                  {tenorLabel[tenor]}
                </th>
              ))}
              <th className="text-right">Change (bps)</th>
              <th>Latest auction</th>
              <th>Rate measure</th>
            </tr>
          </thead>
          <tbody>
            {markets.map(({ market, rows, latest }) => {
              const lead = latest.get(364) ?? latest.get(91);
              return (
                <tr key={market.slug}>
                  <td>
                    <Link href={market.href} className="font-medium hover:text-forest">
                      {market.country}
                    </Link>
                    <span className="ml-2 font-mono text-[10px] text-muted">{market.currency}</span>
                  </td>
                  {billTenors.map((tenor) => {
                    const item = latest.get(tenor);
                    return (
                      <td key={tenor} className="text-right font-mono text-sm">
                        {item ? `${item.latest.rate.toFixed(2)}%` : "—"}
                        {item ? <span className="ml-1 text-[10px] text-muted">{bps(item.previous?.rate, item.latest.rate)}</span> : null}
                      </td>
                    );
                  })}
                  <td className="text-right font-mono text-xs">{lead ? bps(lead.previous?.rate, lead.latest.rate) : "—"}</td>
                  <td className="font-mono text-xs">{rows[0] ? dateFmt.format(new Date(rows[0].date)) : "Compiling"}</td>
                  <td className="text-xs text-ink-soft">{market.rateNote}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        Change is against each tenor’s previous auction. Rate measures differ by central bank and are shown as published; compare levels with that in mind.
      </p>

      {history.length > 4 ? (
        <section className="mt-14">
          <SectionTitle kicker="History" title="364-day bill rate by market, last three years" note="One point per auction. Hover or tap for exact figures." />
          <div className="mt-4">
            <LineChart
              rows={history}
              series={live.map((m, i) => ({ key: m.market.slug, label: m.market.country, color: colors.at(i % colors.length) ?? colors[0] }))}
              label="364-day Treasury bill rates across African markets"
            />
          </div>
        </section>
      ) : null}

      <section className="mt-14 grid gap-px bg-rule sm:grid-cols-3 lg:grid-cols-5">
        {markets.map(({ market, rows }) => (
          <Link key={market.slug} href={market.href} className="bg-paper-2 px-5 py-5 hover:bg-paper-3">
            <p className="font-medium text-[12px] text-muted">{market.publisher}</p>
            <p className="mt-2 font-serif text-2xl text-ink">{market.country} auctions →</p>
            <p className="mt-1 text-xs text-ink-soft">
              {rows.length ? `${rows.length.toLocaleString("en-US")} results since ${rows.at(-1)!.date.slice(0, 4)}` : "Being compiled"}
            </p>
          </Link>
        ))}
      </section>
      <NewsletterBand />
    </PageShell>
  );
}
