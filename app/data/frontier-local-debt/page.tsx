import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { loadBonds } from "@/lib/data/kenya-bonds";
import { billMarkets, loadBillMarket, type BillMarket } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "African local-currency government debt data for frontier-market investors",
  description:
    "Every primary T-bill auction result from ten African central banks, checked and published within hours, with full history back to 2000 in some markets. For investors in the African markets of JPMorgan's GBI-EM Edge frontier index. API, CSV and alerts; 30-day pilots for institutions.",
  alternates: { canonical: `${site.url}/data/frontier-local-debt` },
};

// JPMorgan GBI-EM Edge (frontier local-currency government bonds), African constituents as reported before its
// launch at the end of September 2026. JPMorgan's own index documents are the authority; these are press reports.
const EDGE: Partial<Record<BillMarket["slug"], string>> = {
  egypt: "8% (the country cap)",
  nigeria: "7.4%",
  kenya: "6.9%",
  uganda: "4.8%",
  zambia: "included",
  ghana: "included",
};
const EDGE_SOURCES = [
  { label: "Reuters via Kitco, 14 Sep 2026", href: "https://www.kitco.com/news/off-the-wire/2026-09-14/jpmorgan-launch-frontier-market-local-currency-debt-index-month-end" },
  { label: "CNBC Africa", href: "https://www.cnbcafrica.com/2026/jpmorgan-to-launch-long-awaited-frontier-local-currency-debt-index" },
  { label: "Enterprise (Egypt), 16 Sep 2026", href: "https://enterpriseam.com/egypt/2026/09/16/jpmorgans-new-frontier-index-gives-egypt-its-biggest-possible-weighting/" },
];

const monthYear = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
const longDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** The first institutional product: African local-currency sovereign auction data, with a pilot request. */
export default function FrontierLocalDebtPage() {
  const bonds = loadBonds().rows;
  const bondDates = bonds.map((b) => b.value_date).sort();
  const rows = billMarkets
    .map((m) => {
      const r = loadBillMarket(m.slug).rows;
      const dates = r.map((x) => x.date).sort();
      return { m, results: r.length, first: dates[0] ?? null, last: dates[dates.length - 1] ?? null, edge: EDGE[m.slug] ?? null };
    })
    .sort((a, b) => Number(Boolean(b.edge)) - Number(Boolean(a.edge)) || b.results - a.results);
  const total = rows.reduce((n, r) => n + r.results, 0) + bonds.length;

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/data", label: "Data" }, { label: "Frontier local debt" }]}
      kicker="For institutions · Frontier local debt"
      title="African local-currency government debt, auction by auction"
      lede={
        <p>
          JPMorgan’s new frontier local-currency bond index, GBI-EM Edge, gives African markets about 44.5% of its weight, as reported at launch. Investors
          tracking it need each African auction the day it happens. Afronomics reads every primary auction result from ten African central banks, checks it
          and publishes it within hours of the release: {total.toLocaleString("en-US")} auction results so far.
        </p>
      }
    >
      <section>
        <SectionTitle
          kicker="Coverage today"
          title="What we hold, market by market"
          note="Counted from our datasets on this page’s last build. Bills are primary T-bill auctions; bond auctions are Kenya only for now."
        />
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>GBI-EM Edge weight (reported)</th>
                <th className="text-right">Bill auction results</th>
                <th className="text-right">Since</th>
                <th className="text-right">Latest</th>
                <th>Bond auctions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.m.slug}>
                  <td>
                    <Link href={r.m.href} className="font-medium text-ink hover:text-forest">
                      {r.m.country}
                    </Link>
                    <span className="block text-[11px] text-muted">{r.m.publisher}</span>
                  </td>
                  <td>{r.edge ?? <span className="text-muted">not in the index</span>}</td>
                  <td className="text-right">{r.results.toLocaleString("en-US")}</td>
                  <td className="text-right">{r.first ? monthYear(r.first) : "—"}</td>
                  <td className="text-right">{r.last ? longDate(r.last) : "—"}</td>
                  <td className="text-[13px]">
                    {r.m.slug === "kenya" && bondDates.length ? (
                      <span>
                        {bonds.length} auctions since {monthYear(bondDates[0])}
                      </span>
                    ) : r.edge ? (
                      <span className="text-accent">in build</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <span className="font-medium text-ink">Senegal</span>
                  <span className="block text-[11px] text-muted">UMOA-Titres (WAEMU)</span>
                </td>
                <td>reported as included</td>
                <td className="text-right text-muted" colSpan={4}>
                  Not covered yet
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-muted">
          Index weights as reported before launch:{" "}
          {EDGE_SOURCES.map((s, i) => (
            <span key={s.href}>
              {i ? "; " : ""}
              <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {s.label}
              </a>
            </span>
          ))}
          . JPMorgan’s index documents are the authority on constituents and weights.
        </p>
      </section>

      <section className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="What a licence gives you" title="Built for a frontier debt desk" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>
              <strong className="text-ink">Every auction, within hours of the release:</strong> amounts offered, bid and accepted, and the rate, by tenor, read from each central
              bank’s own release, with the link to it.
            </li>
            <li>
              <strong className="text-ink">Checked before it is published:</strong> each result must pass range and consistency checks (against the release’s own
              totals where it gives them), and a public status page shows any market whose release is late or unread.{" "}
              <Link href="/status" className="underline underline-offset-2">
                Data status
              </Link>
            </li>
            <li>
              <strong className="text-ink">History in one format:</strong> the full record in the same columns for every market, by API or CSV (Excel on request).
            </li>
            <li>
              <strong className="text-ink">Alerts:</strong> a notification when a market’s result is in (email today; webhooks for licensed keys on request).
            </li>
            <li>
              <strong className="text-ink">Honest gaps:</strong> bond auctions outside Kenya and Senegal’s regional market are not covered yet. Pilot institutions
              decide which come first.
            </li>
          </ul>
          <p className="mt-4 text-sm text-ink-soft">
            Licence: from $1,500 a month (Data API) and from $5,000 a month for redistribution and custom delivery.{" "}
            <Link href="/data-api" className="font-semibold text-forest underline underline-offset-2">
              Terms and API
            </Link>
            .
          </p>
        </div>
        <div id="pilot" className="scroll-mt-24 rounded-2xl border-2 border-forest/30 bg-surface px-5 py-5">
          <p className="text-[17px] font-semibold text-ink">Request a 30-day pilot</p>
          <p className="mt-1 mb-4 text-[14px] text-ink-soft">
            For investment managers, banks, development finance institutions and research teams. A pilot gets an API key, the full history and alerts for 30
            days, free. Tell us the markets and fields you need.
          </p>
          <EnquiryForm interest="licensing" cta="Request a pilot" />
        </div>
      </section>

      <p className="mt-10 text-sm text-ink-soft">
        Sources: the central banks named above, each linked from its market page. Afronomics compiles and checks; the central bank is the source.{" "}
        <em>Information, not advice.</em>
      </p>
    </PageShell>
  );
}
