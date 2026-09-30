import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { auctionCalendar, demand, realYields } from "@/lib/data/bill-measures";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "African government borrowing costs — real yields, auction demand and the auction calendar",
  description:
    "Three measures Afronomics builds from ten central banks’ Treasury bill auctions: what governments pay after inflation, how heavily their auctions are bid, and when each market auctions next.",
  alternates: { canonical: `${site.url}/markets/borrowing-costs` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const pct = (v: number | null, d = 2) => (v == null ? "—" : `${v.toFixed(d)}%`);
const signed = (v: number | null, d = 2) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(d)}`);

export default async function BorrowingCostsPage() {
  const [real, bids, calendar] = await Promise.all([realYields(), Promise.resolve(demand()), Promise.resolve(auctionCalendar())]);
  const realSorted = [...real].sort((a, b) => (b.real ?? -99) - (a.real ?? -99));
  const bidsSorted = [...bids].sort((a, b) => b.ratio - a.ratio);

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { href: "/markets/tbills", label: "T-bill monitor" }, { label: "Borrowing costs" }]}
      kicker="Afronomics measures"
      title="What African governments pay to borrow"
      lede={
        <p>
          Three measures built from the ten central-bank auction records on the{" "}
          <Link href="/markets/tbills" className="underline underline-offset-2">
            T-bill monitor
          </Link>
          : the return a lender keeps after inflation, how heavily each government’s auctions are bid, and when each market is next due to report.
          Each method is stated under its table.
        </p>
      }
    >
      <section>
        <SectionTitle title="Real yields on one-year bills" kicker="After inflation" />
        <div className="overflow-x-auto">
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th>Market</th>
                <th className="text-right">364-day rate</th>
                <th className="text-right">Inflation</th>
                <th className="text-right">Real yield</th>
                <th>Auction</th>
              </tr>
            </thead>
            <tbody>
              {realSorted.map((row) => (
                <tr key={row.market.slug}>
                  <td>
                    <Link href={row.market.href} className="font-medium hover:text-forest">
                      {row.market.country}
                    </Link>
                  </td>
                  <td className="text-right">{pct(row.nominal)}</td>
                  <td className="text-right">
                    {pct(row.inflation, 1)}
                    {row.inflationYear ? <span className="ml-1 text-[11px] text-muted">{row.inflationYear}</span> : null}
                  </td>
                  <td className={`text-right font-semibold ${row.real == null ? "" : row.real >= 0 ? "text-up" : "text-down"}`}>{signed(row.real)}</td>
                  <td className="whitespace-nowrap text-xs">{dateFmt.format(new Date(row.nominalDate))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-muted">
          Real yield is the 364-day bill rate at the latest auction less the latest annual consumer-price inflation published by the World Bank (year shown). Annual
          inflation lags the auction by up to a year, so read this as a guide to whether lenders are being paid above inflation, not a precise figure.
        </p>
        <SourceLine name="Central-bank auction results; World Bank Open Data" href="/markets/tbills" detail="computed by Afronomics" />
      </section>

      <section className="mt-14">
        <SectionTitle title="Demand at government auctions" kicker="Bids per unit offered" />
        <div className="overflow-x-auto">
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th>Market</th>
                <th className="text-right">Median, last 90 days</th>
                <th className="text-right">Previous 90 days</th>
                <th className="text-right">Auctions</th>
                <th>Measured against</th>
              </tr>
            </thead>
            <tbody>
              {bidsSorted.map((row) => (
                <tr key={row.market.slug}>
                  <td>
                    <Link href={row.market.href} className="font-medium hover:text-forest">
                      {row.market.country}
                    </Link>
                  </td>
                  <td className="text-right font-semibold">{row.ratio.toFixed(2)}×</td>
                  <td className="text-right">{row.previous == null ? "—" : `${row.previous.toFixed(2)}×`}</td>
                  <td className="text-right">{row.window.auctions}</td>
                  <td className="text-xs text-ink-soft">{row.basis === "offered" ? "amount offered" : "amount accepted"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-muted">
          For each auction, bids received across all tenors divided by the amount offered; the figure shown is the median auction in the 90 days to each
          market’s latest result, and in the 90 days before.
          Above 1× means investors bid for more than the government offered. Where a central bank does not publish the amount offered, bids are divided by the
          amount accepted. South Africa is not shown: the SARB series carries rates only.
        </p>
      </section>

      <section className="mt-14">
        <SectionTitle title="When each market reports next" kicker="Auction calendar" />
        <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-5">
          {calendar.map((item) => (
            <Link key={item.market.slug} href={item.market.href} className="bg-surface px-4 py-4 hover:bg-paper-2">
              <p className="text-[14px] font-semibold text-ink">{item.market.country}</p>
              <p className="mt-1 font-serif text-2xl text-ink">{dayFmt.format(new Date(item.expected))}</p>
              <p className="mt-1 text-[12px] text-muted">
                Every {item.cadenceDays === 7 ? "week" : item.cadenceDays === 14 ? "two weeks" : `${item.cadenceDays} days`} · last {dateFmt.format(new Date(item.last))}
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-muted">
          The expected date follows from the most common gap between each market’s last twelve results, using the date each central bank puts on its results
          (the issue date for most). Central banks publish official calendars and do move auctions around holidays; treat this as a guide.
        </p>
      </section>

      <CiteBlock title="Afronomics African borrowing-cost measures" path="/markets/borrowing-costs" />
      <NewsletterBand />
    </PageShell>
  );
}
