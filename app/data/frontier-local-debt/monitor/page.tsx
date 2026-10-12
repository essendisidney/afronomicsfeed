import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { BillContext } from "@/components/monitor/BillContext";
import { buildMonitor, fmtDate } from "@/components/monitor/data";
import { MarketSections } from "@/components/monitor/MarketSections";
import { MarketTable } from "@/components/monitor/MarketTable";
import { PrintButton } from "@/components/monitor/PrintButton";
import { PrintStyles } from "@/components/monitor/PrintStyles";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "African Local-Currency Debt Monitor: government bond auctions, market by market",
  description:
    "The newest government bond auction results in Kenya, Nigeria, Egypt, Zambia, Uganda and the WAEMU markets: rates, tenors, bid cover and amounts accepted, each read from the issuer's own notice and linked to it, with Treasury-bill context.",
  alternates: { canonical: `${site.url}/data/frontier-local-debt/monitor` },
};

/** The monitor: a public page that also prints as the two-page A4 sample pack sent to institutions. */
export default function DebtMonitorPage() {
  const data = buildMonitor();
  const { markets, bills, asOf, today } = data;
  const publishers = markets.map((m) => m.market);
  const billOnly = bills.map((b) => b.market).filter((b) => !publishers.some((p) => p.publisher.startsWith(b.publisher)));

  return (
    <div className="mon-page">
      <PrintStyles />
      <PageShell
        crumbs={[
          { href: "/", label: "Home" },
          { href: "/data", label: "Data" },
          { href: "/data/frontier-local-debt", label: "Frontier local debt" },
          { label: "Monitor" },
        ]}
        kicker="Afronomics · Frontier local debt"
        title="African Local-Currency Debt Monitor"
        lede={
          <p>
            Government bond auction results in {markets.length} African markets, read from each issuer’s own notice; every row links to it. Figures are
            computed from those results and nothing else. <em>Information, not advice.</em>
          </p>
        }
        aside={
          <div className="border-l-2 border-gold pl-4 text-[13px] leading-6 text-ink-soft">
            {asOf ? (
              <p>
                <span className="font-semibold text-ink">As of {fmtDate(asOf.date)}</span>
                <span className="block text-[12px] text-muted">
                  newest result date across markets ({asOf.market}, {asOf.dateLabel})
                </span>
              </p>
            ) : (
              <p className="text-muted">No results on file.</p>
            )}
            <p className="mt-1 text-[12px] text-muted">Compiled {fmtDate(today)} · afronomicsfeed.com/data/frontier-local-debt/monitor</p>
            <div className="mt-3">
              <PrintButton />
            </div>
          </div>
        }
      >
        <div className="flex flex-col [&>*]:min-w-0">
        <section className="mon-block order-1">
          <SectionTitle
            kicker="Market by market"
            title="The newest bond auction in each market"
            note="Rate: the bond with the longest tenor in each market’s newest auction, as the publisher measures it. Change: that rate minus the mean rate of the same tenor (and, for Egypt, the same bond type; for WAEMU, the same issuer) in results 75 to 105 days before. Bid cover: median across all results in the last 90 days and in the 12 months before that. — means not computable from the data."
          />
          <MarketTable markets={markets} />
        </section>

        <section className="mon-block mon-page-break order-2 mt-12 print:order-4">
          <SectionTitle
            kicker="Latest results"
            title="The five newest results in each market"
            note="Amounts accepted in millions of local currency. For WAEMU, the three treasuries with the most bond results in the last 12 months."
          />
          <MarketSections markets={markets} />
        </section>

        <section className="mon-block order-3 mt-12 print:order-2">
          <SectionTitle
            kicker="The short end"
            title="Treasury bills: the newest longest-tenor rate"
            note="The 364-day bill where the market auctions one, otherwise its longest bill. Dates are value (issue) dates."
          />
          <BillContext bills={bills} />
        </section>

        <footer className="mon-block mon-foot order-4 mt-12 grid print:order-3 print:grid-cols-2 gap-8 border-t border-rule pt-6 text-[14px] leading-6 text-ink-soft lg:grid-cols-2">
          <div>
            <p className="font-semibold text-ink">Get the data</p>
            <ul className="mt-2 space-y-1">
              <li>
                CSV, full history per market: <code className="font-mono text-[13px] break-all text-ink">{site.url.replace("https://", "")}/api/data/bonds/{"{market}"}</code>
              </li>
              <li>
                JSON API: <code className="font-mono text-[13px] break-all text-ink">{site.url.replace("https://", "")}/api/v1/bonds/{"{market}"}</code>
              </li>
              <li>
                Markets: {markets.map((m) => m.market.slug).join(", ")}.
              </li>
              <li>
                A free 30-day pilot (API key, full history, alerts):{" "}
                <Link href="/data/frontier-local-debt#pilot" className="font-semibold break-all text-forest underline underline-offset-2">
                  {site.url.replace("https://", "")}/data/frontier-local-debt#pilot
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-ink">Sources</p>
            <p className="mt-2">
              Bonds:{" "}
              {publishers.map((p, i) => (
                <span key={p.slug}>
                  {i ? "; " : ""}
                  <a href={p.sourcePage} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                    {p.publisher}
                  </a>
                </span>
              ))}
              .
            </p>
            <p className="mt-1">
              Bills: the same publishers where they also run bill auctions
              {billOnly.length ? (
                <>
                  , and{" "}
                  {billOnly.map((b, i) => (
                    <span key={b.slug}>
                      {i ? "; " : ""}
                      <a href={b.sourcePage} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                        {b.publisher}
                      </a>
                    </span>
                  ))}
                </>
              ) : null}
              .
            </p>
            <p className="mt-2">
              Afronomics compiles and checks; the issuer is the source. Information, not advice: no forecasts, no recommendations.
            </p>
          </div>
        </footer>
        </div>
      </PageShell>
    </div>
  );
}
