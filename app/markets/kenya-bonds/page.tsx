import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { YieldCurve } from "@/components/data/YieldCurve";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { auctionCurve, loadBonds, yearsToMaturity } from "@/lib/data/kenya-bonds";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kenya Treasury bond auction results and yield curve",
  description:
    "Every Central Bank of Kenya Treasury bond auction — fixed-coupon, infrastructure and savings bonds, re-openings, taps and switches — with yields, coupons, bids and amounts accepted, the auction yield curve and a free CSV.",
  alternates: { canonical: `${site.url}/markets/kenya-bonds` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const kes = (m: number | null | undefined) => (m == null ? "—" : `KES ${(m / 1000).toFixed(1)}bn`);
const pct = (v: number | null | undefined, d = 3) => (v == null ? "—" : `${v.toFixed(d)}%`);

export default function KenyaBondsPage() {
  const file = loadBonds();
  const curve = auctionCurve();
  const recent = file.rows.slice(0, 40);
  const first = file.rows.at(-1)?.value_date;
  const lastDate = file.rows[0]?.value_date;
  const year = lastDate?.slice(0, 4);
  const ytd = file.rows.filter((row) => row.value_date.startsWith(year ?? "----") && row.kind !== "switch" && row.kind !== "buyback");
  const ytdAccepted = ytd.reduce((total, row) => total + (row.accepted_kes_m ?? 0), 0);
  const ifbShare = ytdAccepted
    ? (ytd.filter((row) => row.type === "Infrastructure").reduce((t, r) => t + (r.accepted_kes_m ?? 0), 0) / ytdAccepted) * 100
    : null;
  const latestAuction = file.rows.filter((row) => row.value_date === lastDate);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Kenya Treasury bond auction results",
    description: "Every Central Bank of Kenya Treasury bond auction result: yields, coupons, bids and amounts accepted.",
    url: `${site.url}/markets/kenya-bonds`,
    temporalCoverage: first && lastDate ? `${first}/${lastDate}` : undefined,
    spatialCoverage: "Kenya",
    creator: { "@type": "Organization", name: site.name, url: site.url },
    isBasedOn: file.sourcePage,
    distribution: [{ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${site.url}/api/data/kenya-bonds` }],
  };

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { label: "Kenya bonds" }]}
      kicker="Afronomics dataset · Kenya"
      title="Kenya Treasury bond auctions"
      lede={
        <p>
          {file.rows.length.toLocaleString("en-US")} bond results from {file.notices.toLocaleString("en-US")} Central Bank of Kenya notices
          {first ? ` since ${dateFmt.format(new Date(first))}` : ""}: primary issues, re-openings, tap sales and switches, fixed-coupon and
          infrastructure bonds, in one table. See also the{" "}
          <Link href="/markets/kenya-tbills" className="underline underline-offset-2">
            Treasury bill auctions
          </Link>
          .
        </p>
      }
      aside={
        <a href="/api/data/kenya-bonds" download className="block bg-gold px-5 py-5 text-white hover:bg-gold-soft">
          <p className="font-medium text-[12px] text-white/80">Download</p>
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
          <section>
            <SectionTitle
              kicker="Yield curve"
              title="Kenya’s government yield curve, from auctions"
              note="T-bills from the latest weekly auction; each bond at the yield of its most recent auction in the past 12 months, placed at its remaining life. Hover a point for details."
            />
            <div className="mt-4">
              <YieldCurve points={curve} />
            </div>
            <SourceLine name="Central Bank of Kenya" href={file.sourcePage} detail="weighted average rate of accepted bids" />
          </section>

          <section className="mt-12 grid grid-cols-2 gap-px bg-rule lg:grid-cols-4">
            {[
              { label: "Latest auction", value: lastDate ? dateFmt.format(new Date(lastDate)) : "—" },
              { label: "Bonds in it", value: latestAuction.map((row) => row.issue).join(", ") || "—" },
              { label: `Accepted, ${year}`, value: kes(ytdAccepted) },
              { label: `Infrastructure bonds, ${year}`, value: ifbShare == null ? "—" : `${ifbShare.toFixed(0)}% of accepted` },
            ].map((stat) => (
              <div key={stat.label} className="bg-paper-2 px-4 py-4">
                <p className="font-medium text-[12px] text-muted">{stat.label}</p>
                <p className="mt-1 font-serif text-xl text-ink">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className="mt-14">
            <SectionTitle kicker="Table" title="The last 40 bond results" note="Click an issue for the CBK notice. Offered is the auction total across all bonds in that auction." />
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Value date</th>
                    <th>Issue</th>
                    <th>Type</th>
                    <th className="text-right">Years left</th>
                    <th className="text-right">Yield</th>
                    <th className="text-right">Coupon</th>
                    <th className="text-right">Bids</th>
                    <th className="text-right">Accepted</th>
                    <th className="text-right">Bid-to-cover</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((row) => (
                    <tr key={`${row.value_date}-${row.issue}-${row.kind}`}>
                      <td className="font-mono text-xs">
                        <Link href={`/markets/kenya-bonds/${row.value_date}`} className="hover:text-forest">
                          {row.value_date}
                        </Link>
                      </td>
                      <td>
                        <a href={row.source} target="_blank" rel="noopener noreferrer" className="font-mono text-xs hover:text-forest">
                          {row.issue}
                        </a>
                        {row.kind !== "primary" ? <span className="ml-2 text-[10px] uppercase text-muted">{row.kind}</span> : null}
                      </td>
                      <td className="text-xs text-ink-soft">{row.type}</td>
                      <td className="text-right font-mono text-xs">{yearsToMaturity(row).toFixed(1)}</td>
                      <td className="text-right font-mono text-xs">{pct(row.weighted_avg_rate)}</td>
                      <td className="text-right font-mono text-xs">{pct(row.coupon)}</td>
                      <td className="text-right font-mono text-xs">{kes(row.received_kes_m)}</td>
                      <td className="text-right font-mono text-xs">{kes(row.accepted_kes_m)}</td>
                      <td className="text-right font-mono text-xs">{row.bid_to_cover?.toFixed(2) ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <SourceLine
              name="Central Bank of Kenya, Treasury bond result notices"
              href={file.sourcePage}
              detail={`extracted by Afronomics${file.updatedAt ? ` · updated ${file.updatedAt.slice(0, 10)}` : ""}`}
            />
          </section>
        </>
      )}
      <NewsletterBand lede="Kenya’s bond and bill auctions, plus 53 other economies, in one Monday email." />
    </PageShell>
  );
}
