import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { DebtDataLinks } from "@/components/seo/DebtDataLinks";
import { JsonLd } from "@/components/seo/JsonLd";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { fitDescription, fitTitle } from "@/lib/seo";
import { bondDatasetJsonLd } from "@/lib/seo/schema";
import { renderTime } from "@/lib/data/fetcher";
import type { BondMarket, BondRow } from "@/lib/data/sovereign-bonds";
import { site } from "@/lib/site";
import { AuctionRateChart } from "./AuctionRateChart";
import { bondFacts, longDate, millions, shortName, tableOrder, tenorText, todayIso, type Issuer } from "./stats";

const TABLE_LIMIT = 100;

type Scope = { market: BondMarket; rows: BondRow[]; issuer?: Issuer | null };

function names({ market, rows, issuer }: Scope) {
  const place = issuer ? `${issuer.name} (WAEMU)` : shortName(market);
  const firstYear = rows.at(-1)?.date.slice(0, 4) ?? "";
  const path = `/markets/bonds/${market.slug}${issuer ? `/${issuer.slug}` : ""}`;
  const api = `/api/v1/bonds/${market.slug}${issuer ? `?issue=${encodeURIComponent(issuer.name)}` : ""}`;
  const csv = `/api/data/bonds/${market.slug}`;
  return {
    place,
    firstYear,
    path,
    api,
    csv,
    title: `${place} government bond auctions: results since ${firstYear}`,
    description: `${place} government bond auction results since ${firstYear}, from the ${market.publisher}: rate, tenor, bid cover and amounts by bond, with CSV and API.`,
  };
}

export function bondMetadata(scope: Scope): Metadata {
  const n = names(scope);
  return {
    title: fitTitle(n.title),
    description: fitDescription(n.description),
    alternates: { canonical: `${site.url}${n.path}` },
    openGraph: { title: n.title, description: fitDescription(n.description, 200), url: `${site.url}${n.path}` },
  };
}

export function BondMarketView({ market, rows, updatedAt, issuer = null, issuers = [] }: Scope & { updatedAt: string | null; issuers?: Issuer[] }) {
  const n = names({ market, rows, issuer });
  const today = todayIso(renderTime());
  const facts = bondFacts(rows, today);
  const settlement = market.dateKind === "settlement";
  const dateWord = settlement ? "settlement date" : "auction date";
  const table = tableOrder(rows).slice(0, TABLE_LIMIT);
  const showOffered = rows.some((r) => r.offered_m != null);
  const showCover = rows.some((r) => r.bid_cover != null);
  const ccy = market.currency;

  // One Dataset builder for every bond page (lib/seo/schema.ts), so the license, catalog and variables never drift.
  const dates = rows.map((r) => r.date).sort();
  const jsonLd = bondDatasetJsonLd(market, n.path, issuer ? { name: issuer.name, first: dates[0] ?? null, last: dates.at(-1) ?? null } : undefined);

  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/markets", label: "Markets" },
    { href: "/markets/bonds", label: "Bond auctions" },
    ...(issuer ? [{ href: `/markets/bonds/${market.slug}`, label: "WAEMU" }, { label: issuer.name }] : [{ label: shortName(market) }]),
  ];

  return (
    <PageShell
      crumbs={crumbs}
      kicker={`Afronomics dataset · ${issuer ? `${issuer.name} · WAEMU` : shortName(market)} · ${ccy}`}
      title={n.title}
      lede={
        <p>
          {rows.length.toLocaleString("en-US")} bond auction results from the{" "}
          <a href={market.sourcePage} target="_blank" rel="noopener noreferrer" data-track="source_click" className="underline underline-offset-2 hover:text-forest">
            {market.publisher}
          </a>
          ’s own publications, in one table. Rates are the {market.rateNote.replace(/; the issuing country is in the issue field$/, "")}. <em>Information, not advice.</em>
        </p>
      }
      aside={
        <a href={n.csv} download className="block rounded-2xl bg-ink px-5 py-5 text-paper hover:bg-forest">
          <p className="text-[13px] font-medium opacity-80">Download</p>
          <p className="mt-1 font-serif text-2xl">Full history as CSV</p>
          <p className="text-[12px] opacity-80">
            {market.slug === "waemu" ? "All eight WAEMU issuers" : `${market.country}`} · source: {market.publisher}
          </p>
        </a>
      }
    >
      <JsonLd data={jsonLd} />
      {market.slug === "kenya" ? (
        <p className="mb-6 text-sm text-ink-soft">
          The fuller Kenya page, with the auction yield curve, infrastructure-bond share and a page for every auction, is{" "}
          <Link href="/markets/kenya-bonds" className="font-medium text-forest underline underline-offset-2 hover:text-gold">
            Kenya Treasury bond auction results
          </Link>
          .
        </p>
      ) : null}

      {issuers.length ? <IssuerNav market={market} active={issuer} issuers={issuers} /> : null}

      {facts ? (
        <section aria-label="Key facts" className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule lg:grid-cols-5 [&>*:first-child]:col-span-2 lg:[&>*:first-child]:col-span-1">
          <Fact
            label={settlement ? "Newest settlement date" : "Newest auction"}
            value={longDate(facts.newest)}
            note={
              facts.newestIsFuture
                ? settlement
                  ? "Result published; the bonds settle on this date"
                  : "Scheduled; not yet held"
                : settlement
                  ? "Date the bonds settled, not the auction day"
                  : `Updated ${updatedAt ? longDate(updatedAt.slice(0, 10)) : "from the source"}`
            }
          />
          <Fact
            label="Results held"
            value={facts.results.toLocaleString("en-US")}
            note={`On ${facts.auctionDays.toLocaleString("en-US")} ${dateWord}s since ${longDate(facts.first)}`}
          />
          <Fact
            label="Longest tenor, newest date"
            value={facts.longest ? `${facts.longest.rate.toFixed(2)}%` : "—"}
            note={
              facts.longest
                ? `${tenorText(facts.longest.tenor_years)}${facts.longest.issue ? ` · ${facts.longest.issue}` : facts.longest.isin ? ` · ${facts.longest.isin}` : ""}`
                : undefined
            }
          />
          <Fact
            label="12-month range"
            value={facts.range ? `${facts.range.min.toFixed(2)}–${facts.range.max.toFixed(2)}%` : "—"}
            note={`All tenors, ${longDate(facts.windowFrom)} to ${longDate(facts.newest)}`}
          />
          <Fact
            label="Median bid cover, 12 months"
            value={facts.medianCover != null ? `${facts.medianCover.toFixed(2)}×` : "—"}
            note={facts.medianCover != null ? `Bids ÷ accepted, ${facts.coverCount.toLocaleString("en-US")} results` : "Not published by the source"}
          />
        </section>
      ) : null}
      <SourceLine
        name={market.publisher}
        href={market.sourcePage}
        detail={`compiled by Afronomics${updatedAt ? ` · updated ${updatedAt.slice(0, 10)}` : ""} · amounts in ${ccy} millions`}
      />

      <section className="mt-14">
        <SectionTitle
          kicker="History"
          title={`Auction rates since ${n.firstYear}, by tenor`}
          note={`Each dot is one bond at one ${settlement ? "auction (plotted at settlement)" : "auction"}; lines are the monthly median for each tenor bucket.`}
        />
        <div className="mt-4">
          <AuctionRateChart rows={rows} label={`${n.place} government bond auction rates over time, by tenor bucket`} />
        </div>
      </section>

      <section className="mt-14">
        <SectionTitle
          kicker="Table"
          title={rows.length > TABLE_LIMIT ? `The latest ${TABLE_LIMIT} results` : `All ${rows.length} results`}
          note={`Newest first. Amounts in ${ccy} millions; bid cover is bids received divided by the amount accepted.${
            rows.length > TABLE_LIMIT ? ` The other ${(rows.length - TABLE_LIMIT).toLocaleString("en-US")} are in the CSV.` : ""
          }`}
        />
        <div className="mt-2 overflow-x-auto">
          <table className="data-table min-w-[44rem]">
            <thead>
              <tr>
                <th>{settlement ? "Settlement" : "Auction"}</th>
                <th>{market.slug === "waemu" ? "Issuer" : "Issue / ISIN"}</th>
                <th className="text-right">Tenor</th>
                <th className="text-right">Rate</th>
                {showCover ? <th className="text-right">Cover</th> : null}
                {showOffered ? <th className="text-right">Offered</th> : null}
                <th className="text-right">Bids</th>
                <th className="text-right">Accepted</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r, i) => (
                <tr key={`${r.date}-${r.isin ?? r.issue ?? ""}-${r.tenor_years ?? ""}-${i}`}>
                  <td className="whitespace-nowrap font-mono text-xs">{r.date}</td>
                  <td className="text-xs">
                    {r.issue ? <span className="text-ink">{r.issue}</span> : null}
                    {r.isin ? <span className={`block font-mono text-[11px] ${r.issue ? "text-muted" : "text-ink"}`}>{r.isin}</span> : null}
                    {!r.issue && !r.isin ? <span className="text-muted">—</span> : null}
                  </td>
                  <td className="whitespace-nowrap text-right font-mono text-xs">{tenorText(r.tenor_years)}</td>
                  <td className="whitespace-nowrap text-right font-mono text-xs text-ink">{r.rate.toFixed(3)}%</td>
                  {showCover ? <td className="text-right font-mono text-xs">{r.bid_cover == null ? "—" : `${r.bid_cover.toFixed(2)}×`}</td> : null}
                  {showOffered ? <td className="text-right font-mono text-xs">{millions(r.offered_m)}</td> : null}
                  <td className="text-right font-mono text-xs">{millions(r.received_m)}</td>
                  <td className="text-right font-mono text-xs">{millions(r.accepted_m)}</td>
                  <td className="text-xs">
                    <a
                      href={r.source || market.sourcePage}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track="source_click"
                      className="text-muted underline underline-offset-2 hover:text-forest"
                    >
                      {r.source ? "notice" : "publisher"}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > TABLE_LIMIT ? (
          <p className="mt-3 text-sm text-ink-soft">
            Showing {TABLE_LIMIT} of {rows.length.toLocaleString("en-US")}.{" "}
            <a href={n.csv} download className="font-medium text-forest underline underline-offset-2 hover:text-gold">
              Download the full CSV
            </a>{" "}
            or query the{" "}
            <a href={n.api} className="font-medium text-forest underline underline-offset-2 hover:text-gold">
              JSON API
            </a>
            .
          </p>
        ) : null}
      </section>

      <section className="mt-14">
        <SectionTitle kicker="Downloads" title="Take the data with you" />
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <DownloadCard href={n.csv} download title="CSV" body={`Every ${shortName(market)} result we hold, one row per bond, free.`} cta={n.csv} />
          <DownloadCard href={n.api} title="JSON API" body="Filter by ISIN, issue and date range; up to 5,000 rows a call." cta={decodeURIComponent(n.api)} />
          <DownloadCard
            href="/data/frontier-local-debt#pilot"
            title="Request a 30-day pilot"
            body="Daily delivery across every African market we cover, for a desk or a fund."
            cta="Frontier local debt →"
            strong
          />
        </div>
      </section>

      {/* Long citation URLs must wrap on phones. */}
      <div className="[overflow-wrap:anywhere]">
        <CiteBlock title={`${n.place} government bond auction results`} path={n.path} publisher={`the ${market.publisher}`} csv={n.csv} />
      </div>
      <DebtDataLinks country={issuer ? issuer.name : market.country} current={n.path} />
    </PageShell>
  );
}

function Fact({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="bg-paper-2 px-4 py-4 sm:px-5 sm:py-5">
      <p className="text-[12px] font-medium text-muted">{label}</p>
      <p className="mt-2 font-serif text-2xl tracking-[-0.02em] text-ink sm:text-3xl">{value}</p>
      {note ? <p className="mt-1 text-xs leading-5 text-ink-soft">{note}</p> : null}
    </div>
  );
}

function DownloadCard({ href, title, body, cta, download, strong }: { href: string; title: string; body: string; cta: string; download?: boolean; strong?: boolean }) {
  const cls = strong
    ? "block rounded-2xl border-2 border-forest/30 bg-surface px-5 py-5 hover:border-gold"
    : "block rounded-2xl border border-rule bg-surface px-5 py-5 hover:border-gold";
  const inner = (
    <>
      <p className="font-serif text-xl text-ink">{title}</p>
      <p className="mt-1 text-sm leading-6 text-ink-soft">{body}</p>
      <p className="mt-3 break-all font-mono text-[11px] text-forest">{cta}</p>
    </>
  );
  if (href.startsWith("/api/")) {
    return (
      <a href={href} download={download || undefined} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} data-track={href.includes("#pilot") ? "pricing_cta_click" : undefined}>
      {inner}
    </Link>
  );
}

function IssuerNav({ market, active, issuers }: { market: BondMarket; active: Issuer | null; issuers: Issuer[] }) {
  const chip = "rounded-full border px-3 py-1 text-[13px] font-medium";
  const on = `${chip} border-forest bg-forest text-paper`;
  const off = `${chip} border-rule text-ink-soft hover:border-gold`;
  return (
    <nav aria-label="Filter by issuing country" className="mb-6 flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs text-muted">Issuer:</span>
      <Link href={`/markets/bonds/${market.slug}`} className={active ? off : on} aria-current={active ? undefined : "page"}>
        All WAEMU
      </Link>
      {issuers.map((i) => {
        const current = active?.slug === i.slug;
        return (
          <Link key={i.slug} href={`/markets/bonds/${market.slug}/${i.slug}`} className={current ? on : off} aria-current={current ? "page" : undefined}>
            {i.name} <span className={`font-mono text-[11px] ${current ? "opacity-80" : "text-muted"}`}>{i.results}</span>
          </Link>
        );
      })}
    </nav>
  );
}
