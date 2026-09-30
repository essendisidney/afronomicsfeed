import type { Metadata } from "next";
import Link from "next/link";
import { AlertButton } from "@/components/ui/AlertButton";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { tenorLabel } from "@/lib/data/kenya-tbills";
import { billMarkets, billTenors, latestBills, loadBillMarket } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Africa Treasury bill monitor — ten African markets’ auction rates side by side",
  description:
    "Latest 91-, 182- and 364-day Treasury bill auction rates for Egypt, Nigeria, Ghana, Kenya, Uganda, Tanzania, Zambia, Malawi, Mozambique and South Africa, compiled from each central bank’s own results, with full histories and free CSVs.",
  alternates: { canonical: `${site.url}/markets/tbills` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const regions = [
  { key: "North", label: "North Africa" },
  { key: "West", label: "West Africa" },
  { key: "East", label: "East Africa" },
  { key: "Southern", label: "Southern Africa" },
] as const;

/** A small 364-day trend line for one market, drawn on the same scale as its neighbours. */
function Trend({ points, min, max, label }: { points: { date: string; rate: number }[]; min: number; max: number; label: string }) {
  if (points.length < 2) return null;
  const w = 240;
  const h = 64;
  const t0 = Date.parse(points[0].date);
  const t1 = Date.parse(points.at(-1)!.date);
  const x = (d: string) => ((Date.parse(d) - t0) / Math.max(1, t1 - t0)) * (w - 8) + 4;
  const y = (v: number) => 4 + (1 - (v - min) / Math.max(0.5, max - min)) * (h - 8);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)},${y(p.rate).toFixed(1)}`).join(" ");
  const last = points.at(-1)!;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-3 block h-16 w-full overflow-visible text-forest" role="img" aria-label={label}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <circle cx={x(last.date)} cy={y(last.rate)} r={3} className="fill-accent" />
    </svg>
  );
}

export default function BillMonitorPage() {
  const markets = billMarkets.map((market) => {
    const { rows } = loadBillMarket(market.slug);
    return { market, rows, latest: latestBills(rows) };
  });
  const live = markets.filter((m) => m.rows.length > 0);

  // 364-day rate by market over the last three years, drawn as small multiples on one shared scale.
  const newest = live.map((m) => m.rows[0].date).sort().at(-1) ?? "2026-01-01";
  const since = `${Number(newest.slice(0, 4)) - 3}${newest.slice(4)}`;
  const trends = new Map(
    live.map((m) => [
      m.market.slug,
      m.rows
        .filter((r) => r.tenor === 364 && r.date >= since)
        .map((r) => ({ date: r.date, rate: r.rate }))
        .reverse(),
    ]),
  );
  const allRates = [...trends.values()].flat().map((p) => p.rate);
  const lo = Math.floor(Math.min(...allRates, 5));
  const hi = Math.ceil(Math.max(...allRates, 10));
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
          The latest government bill auctions in ten African markets, side by side, each compiled from the central bank’s own results. Histories run
          from 2000 in South Africa and 2002 in Egypt and Nigeria; the shortest, Zambia’s, starts in 2018. Every market’s full record is a free download.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <p className="text-[14px] font-semibold text-ink">Get the result the moment it lands</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">A notification on your phone or computer each time a market publishes a new auction.</p>
          <div className="mt-4">
            <AlertButton label="Alert me on every market" />
          </div>
        </div>
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
            {regions.flatMap((region) => {
              const group = markets.filter(({ market }) => market.region === region.key);
              if (!group.length) return [];
              return [
                <tr key={region.key}>
                  <th colSpan={billTenors.length + 4} className="bg-paper-2 pt-4 text-[13px] font-semibold text-ink">
                    {region.label}
                  </th>
                </tr>,
                ...group.map(({ market, rows, latest }) => {
                  const lead = latest.get(364) ?? latest.get(91);
                  return (
                    <tr key={market.slug}>
                      <td>
                        <Link href={market.href} className="font-medium hover:text-forest">
                          {market.country}
                        </Link>
                        <span className="ml-2 text-[11px] text-muted">{market.currency}</span>
                      </td>
                      {billTenors.map((tenor) => {
                        const item = latest.get(tenor);
                        return (
                          <td key={tenor} className="whitespace-nowrap text-right text-sm">
                            {item ? `${item.latest.rate.toFixed(2)}%` : "—"}
                            {item ? <span className="ml-1 text-[11px] text-muted">{bps(item.previous?.rate, item.latest.rate)}</span> : null}
                          </td>
                        );
                      })}
                      <td className="text-right text-xs">{lead ? bps(lead.previous?.rate, lead.latest.rate) : "—"}</td>
                      <td className="whitespace-nowrap text-xs">{rows[0] ? dateFmt.format(new Date(rows[0].date)) : "Compiling"}</td>
                      <td className="min-w-[14rem] text-xs text-ink-soft">{market.rateNote}</td>
                    </tr>
                  );
                }),
              ];
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        Change is against each tenor’s previous auction. Rate measures differ by central bank and are shown as published; compare levels with that in mind.
      </p>

      <section className="mt-14">
        <SectionTitle
          kicker="History"
          title="364-day bill rate by market, last three years"
          note={`Every panel uses the same scale, ${lo}% to ${hi}%, so the heights compare across markets. One point per auction.`}
        />
        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-5">
          {markets.map(({ market, rows, latest }) => {
            const item = latest.get(364);
            const points = trends.get(market.slug) ?? [];
            return (
              <Link key={market.slug} href={market.href} className="bg-surface px-4 py-4 hover:bg-paper-2">
                <p className="flex items-baseline justify-between gap-2">
                  <span className="text-[14px] font-semibold text-ink">{market.country}</span>
                  <span className="text-[11px] text-muted">{rows.length ? `since ${rows.at(-1)!.date.slice(0, 4)}` : "compiling"}</span>
                </p>
                <p className="mt-1 font-serif text-2xl text-ink">{item ? `${item.latest.rate.toFixed(2)}%` : "—"}</p>
                <Trend points={points} min={lo} max={hi} label={`${market.country} 364-day bill rate over three years`} />
              </Link>
            );
          })}
        </div>
      </section>

      <p className="mt-10 text-sm text-ink-soft">
        What these rates mean after inflation, how heavily each auction is bid, and when each market reports next:{" "}
        <Link href="/markets/borrowing-costs" className="font-medium text-forest underline underline-offset-2">
          African borrowing costs
        </Link>
        .
      </p>
      <CiteBlock title="Africa Treasury bill monitor" path="/markets/tbills" publisher="ten African central banks" />
      <NewsletterBand />
    </PageShell>
  );
}
