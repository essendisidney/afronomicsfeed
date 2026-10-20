import type { Metadata } from "next";
import Link from "next/link";
import { BarChart } from "@/components/charts/BarChart";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { loadWaemuDemand, WAEMU_COUNTRIES } from "@/lib/data/waemu-demand";
import { MAX_COVER } from "@/lib/waemu-demand-core";
import { MARKETS_CARD_ALT, shareImage } from "@/lib/share-image";
import { site } from "@/lib/site";
import { fitDescription } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "WAEMU auction demand: bid cover by government",
  description: fitDescription(
    "Bid cover at every UMOA-Titres auction for Benin, Burkina Faso, Côte d’Ivoire, Mali, Niger, Senegal and Togo: bids divided by the amount sought, the median of the last eight auctions, and each government's one-year bill yield.",
  ),
  alternates: { canonical: `${site.url}/markets/waemu-demand` },
  openGraph: { images: shareImage("/markets", MARKETS_CARD_ALT) },
};

const WINDOW = 8;
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const fmtDate = (iso: string) => dateFmt.format(new Date(`${iso}T12:00:00Z`));
const cover = (v: number | null) => (v == null ? "—" : `${v.toFixed(2)}×`);
const bn = (m: number) => (m / 1000).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const name = (slug: string) => WAEMU_COUNTRIES[slug] ?? slug;

export default function WaemuDemandPage() {
  const { countries, updated } = loadWaemuDemand();
  const chart = countries.map((c) => ({ label: name(c.country), value: Math.round(c.median * 100) / 100 }));

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { href: "/markets/bonds/waemu", label: "WAEMU bonds" }, { label: "Auction demand" }]}
      kicker="Afronomics tracker"
      title="How heavily West African governments' auctions are bid"
      lede={
        <p>
          The eight WAEMU governments borrow in CFA francs at auctions run by UMOA-Titres. Bid cover, the bids received divided by the amount a treasury
          sought, shows how keen lenders are: above 1× means more was bid than asked. Here is each government&apos;s latest result and the median of its
          last {WINDOW} auctions, from every result UMOA-Titres has published. {countries.length} of the eight have results on file; Guinea-Bissau&apos;s
          are not yet read.
        </p>
      }
    >
      <section>
        <SectionTitle title={`Median bid cover, last ${WINDOW} auctions`} kicker="Bids ÷ amount sought" />
        {chart.length ? (
          <div className="mt-4">
            <BarChart
              data={chart}
              unit="Bid cover, times the amount sought"
              reference={{ value: 1, label: "1× = bids equal the amount sought" }}
              format={(v) => `${v.toFixed(2)}×`}
              label={`Median bid cover over the last ${WINDOW} auctions: ${chart.map((d) => `${d.label} ${d.value.toFixed(2)}×`).join("; ")}`}
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">No results on file yet.</p>
        )}
        <SourceLine name="UMOA-Titres, auction results" href="https://www.umoatitres.org/fr/emissions/" detail={updated ? `read ${fmtDate(updated.slice(0, 10))}, computed by Afronomics` : "computed by Afronomics"} />
      </section>

      <section className="mt-14">
        <SectionTitle title="Government by government" kicker="Latest auction and trend" />
        <div className="overflow-x-auto">
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th>Government</th>
                <th>Latest auction</th>
                <th className="text-right">Bid cover</th>
                <th className="text-right">Median, last {WINDOW}</th>
                <th className="text-right">Previous {WINDOW}</th>
                <th className="text-right">One-year bill</th>
              </tr>
            </thead>
            <tbody>
              {countries.map((c) => (
                <tr key={c.country}>
                  <td className="font-medium">{name(c.country)}</td>
                  <td className="whitespace-nowrap text-xs">
                    <a href={c.latest.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-forest">
                      {fmtDate(c.latest.date)}
                    </a>
                  </td>
                  <td className="text-right">{cover(c.latest.cover)}</td>
                  <td className="text-right font-semibold">{cover(c.median)}</td>
                  <td className="text-right">{cover(c.previous)}</td>
                  <td className="text-right">
                    {c.oneYear ? `${c.oneYear.rate.toFixed(2)}%` : "—"}
                    {c.oneYear && c.oneYear.date !== c.latest.date ? <span className="ml-1 text-[11px] text-muted">{fmtDate(c.oneYear.date)}</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-muted">
          One auction is one UMOA-Titres issue: a treasury&apos;s bills and bonds sold together on one day. UMOA-Titres prints the amount sought once for the
          whole issue, so bid cover is the bids on all its lines divided by that amount. Bought-back lines (printed with negative amounts) and pure buyback or
          exchange operations are left out, as is any result above {MAX_COVER}× (a figure misread from the page). The one-year bill is the weighted average
          yield of the issue&apos;s 12-month bill, dated where it comes from an earlier auction. Niger&apos;s recent results print total bids exactly equal to
          the amount sought, so its cover reads 1.00×.
        </p>
      </section>

      <section className="mt-14">
        <SectionTitle title={`Each government's last ${WINDOW} auctions`} kicker="The results behind the medians" />
        <div className="mt-4 space-y-3">
          {countries.map((c) => (
            <details key={c.country} className="rounded-2xl border border-rule bg-surface px-4 py-3">
              <summary className="cursor-pointer text-[15px] font-semibold text-ink">
                {name(c.country)} <span className="ml-2 text-[13px] font-normal text-muted">median {cover(c.median)}</span>
              </summary>
              <div className="overflow-x-auto">
                <table className="data-table mt-3">
                  <thead>
                    <tr>
                      <th>Auction</th>
                      <th className="text-right">Sought (XOF bn)</th>
                      <th className="text-right">Bids (XOF bn)</th>
                      <th className="text-right">Accepted (XOF bn)</th>
                      <th className="text-right">Bid cover</th>
                      <th className="text-right">One-year bill</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.recent.map((a) => (
                      <tr key={`${a.date}-${a.source}`}>
                        <td className="whitespace-nowrap text-xs">
                          <a href={a.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-forest">
                            {fmtDate(a.date)}
                          </a>
                        </td>
                        <td className="text-right">{bn(a.sought)}</td>
                        <td className="text-right">{bn(a.bids)}</td>
                        <td className="text-right">{bn(a.accepted)}</td>
                        <td className="text-right font-semibold">{cover(a.cover)}</td>
                        <td className="text-right">{a.oneYear == null ? "—" : `${a.oneYear.toFixed(2)}%`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-[14px] leading-6 text-ink-soft">
          For the rates on each bond, see the{" "}
          <Link href="/markets/bonds/waemu" className="underline underline-offset-2">
            WAEMU bonds page
          </Link>
          ; for what one-year money costs each government, the{" "}
          <Link href="/brief/senegal-pays-twice-burkina-one-year-bill" className="underline underline-offset-2">
            Senegal and Burkina Faso comparison
          </Link>
          . Information, not advice.
        </p>
      </section>

      <CiteBlock title="Afronomics WAEMU auction demand tracker" path="/markets/waemu-demand" />
      <NewsletterBand />
    </PageShell>
  );
}
