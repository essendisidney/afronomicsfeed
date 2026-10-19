import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { JsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { ActionTile, Card } from "@/components/ui/Card";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Stat, StatGroup } from "@/components/ui/Stat";
import { renderTime } from "@/lib/data/fetcher";
import { fitDescription, fitTitle } from "@/lib/seo";
import { bondAuctionDatasetJsonLd } from "@/lib/seo/schema";
import { site } from "@/lib/site";
import { auctionTitle, bondAuctionPath, pct2, signedBps, tenorLabel, type AuctionLine, type BondAuction } from "./auction";
import { shortDate } from "@/lib/data/auction-week";
import { millions, shortName, todayIso } from "./stats";
import { MARKETS_CARD_ALT, shareImage } from "@/lib/share-image";

/**
 * The dated page of one bond auction. Every figure comes from the auction file; a change is shown only where the
 * same tenor was sold before and the earlier sale is unambiguous.
 */

const link = "font-medium text-forest underline underline-offset-2 hover:text-gold";

const list = (items: string[]) => (items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`);

function hostLabel(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

/** Amounts in millions as words: "UGX 600.4bn", "XOF 47.2bn", "MAD 2,250m". */
function money(currency: string, m: number | null) {
  if (m == null) return "—";
  return Math.abs(m) >= 1000
    ? `${currency} ${(m / 1000).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}bn`
    : `${currency} ${m.toLocaleString("en-US", { maximumFractionDigits: 1 })}m`;
}

/** The publisher's name for a line, where it names the bond: Kenya "FXD1/2019/020", Nigeria "16.79% FGN SEP 2036", Zambia's tender. */
function issueText(slug: string, issue: string | null) {
  if (!issue || slug === "waemu" || slug === "egypt") return null;
  return slug === "zambia" ? `Tender ${issue}` : issue;
}

/** A maturity as "9 Sep 2047"; a date the publisher printed malformed (CBK: "2047-23-09") is shown as printed. */
const maturityText = (iso: string) => (/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(iso) ? shortDate(iso) : iso);

/** Markets where "the same tenor" is the same bond line: Kenya (original tenor), Morocco (time left to maturity). */
const byBond = (slug: string) => slug === "kenya" || slug === "morocco";

function names(a: BondAuction) {
  const title = auctionTitle(a);
  const tenors = [...new Set(a.lines.map((l) => tenorLabel(l.tenor_years)))];
  const dateWord = a.settlement ? `settling on ${shortDate(a.date)}` : `on ${shortDate(a.date)}`;
  const lead = a.lead;
  const lineName = issueText(a.market.slug, lead.issue);
  const leadName = `${lead.label} bond${lineName && a.market.slug !== "zambia" ? ` ${lineName}` : ""}`;
  const moved =
    lead.bps != null && lead.prev
      ? ` That is ${signedBps(lead.bps)} bp from the previous ${byBond(a.market.slug) ? "sale of the same bond" : `${lead.label} sale`} on ${shortDate(lead.prev.date)}.`
      : "";
  const description = `${a.place} government bond auction results ${dateWord}: ${a.lines.length} ${a.lines.length === 1 ? "line" : "lines"} (${list(tenors)}). The ${leadName} priced at ${pct2(lead.rate)}.${moved} Source: ${a.market.publisher}.`;
  return { title, description, leadName };
}

export function bondAuctionMetadata(a: BondAuction): Metadata {
  const n = names(a);
  const url = `${site.url}${a.path}`;
  return {
    title: fitTitle(n.title),
    description: fitDescription(n.description),
    alternates: { canonical: url },
    openGraph: {
      title: n.title,
      description: fitDescription(n.description, 200),
      url,
      type: "article",
      images: shareImage("/markets", MARKETS_CARD_ALT),
    },
  };
}

function ChangeCell({ line }: { line: AuctionLine }) {
  if (line.bps == null || !line.prev) {
    return (
      <span
        className="text-muted"
        title={line.noPrev === "ambiguous" ? "More than one sale of this tenor on the previous date" : "No earlier sale of this tenor in the data"}
      >
        {line.noPrev === "ambiguous" ? "n/a" : "first"}
      </span>
    );
  }
  return <span className="font-mono text-ink">{signedBps(line.bps)}</span>;
}

export function BondAuctionView({
  auction: a,
  updatedAt,
  title,
  intro,
  extraColumns = [],
  after,
}: {
  auction: BondAuction;
  updatedAt: string | null;
  /** Kenya keeps its long-standing headline; every other market uses auctionTitle. */
  title?: string;
  intro?: React.ReactNode;
  extraColumns?: Column<AuctionLine>[];
  /** Anything that closes the page (Kenya: the newsletter band). */
  after?: React.ReactNode;
}) {
  const { market, issuer } = a;
  const n = names(a);
  const h1 = title ?? n.title;
  const ccy = market.currency;
  const today = todayIso(renderTime());
  const future = a.date > today;
  const isToday = a.date === today;
  const csv = market.slug === "kenya" ? "/api/data/kenya-bonds" : `/api/data/bonds/${market.slug}`;
  const api = `/api/v1/bonds/${market.slug}?from=${a.date}&to=${a.date}${issuer ? `&issue=${encodeURIComponent(issuer.name)}` : ""}`;
  const marketLabel = issuer ? issuer.name : shortName(market);

  const crumbs = [
    { href: "/", label: "Home" },
    { href: "/markets", label: "Markets" },
    ...(market.slug === "kenya"
      ? [{ href: "/markets/kenya-bonds", label: "Kenya bonds" }]
      : [
          { href: "/markets/bonds", label: "Bond auctions" },
          ...(issuer
            ? [
                { href: `/markets/bonds/${market.slug}`, label: "WAEMU" },
                { href: a.marketPath, label: issuer.name },
              ]
            : [{ href: a.marketPath, label: shortName(market) }]),
        ]),
    { label: a.date },
  ];

  const jsonLd = bondAuctionDatasetJsonLd(market, {
    path: a.path,
    date: a.date,
    name: h1,
    description: fitDescription(n.description, 300),
    place: a.place,
    sources: a.sources,
    marketPath: a.marketPath,
    issuer: issuer?.name ?? null,
  });

  const showOffered = a.lines.some((l) => l.offered_m != null) && market.slug !== "kenya";
  const showRange = a.lines.some((l) => l.min_rate != null && l.max_rate != null);
  const showCoupon = a.lines.some((l) => l.coupon != null);
  const showType = a.lines.some((l) => l.type);

  const columns: Column<AuctionLine>[] = [
    {
      key: "line",
      header: "Bond",
      cell: (l) => (
        <span className="block">
          <span className="text-ink">{l.label}</span>
          {issueText(market.slug, l.issue) ? (
            <span className="block font-mono text-[11px] font-normal text-ink-soft">{issueText(market.slug, l.issue)}</span>
          ) : null}
          {l.isin ? <span className="block font-mono text-[11px] font-normal text-muted">{l.isin}</span> : null}
          {l.maturity ? <span className="block text-[11px] font-normal text-muted">matures {maturityText(l.maturity)}</span> : null}
        </span>
      ),
    },
    ...(showType
      ? [
          {
            key: "type",
            header: "Sale",
            cell: (l: AuctionLine) => <span className="text-xs text-ink-soft">{l.type ?? "—"}</span>,
          },
        ]
      : []),
    ...(showCoupon
      ? [
          {
            key: "coupon",
            header: "Coupon",
            numeric: true,
            cell: (l: AuctionLine) => <span className="font-mono text-xs">{l.coupon == null ? "—" : `${l.coupon.toFixed(3)}%`}</span>,
          },
        ]
      : []),
    {
      key: "rate",
      header: "Rate",
      numeric: true,
      cell: (l) => <span className="font-mono text-sm text-ink">{l.rate.toFixed(3)}%</span>,
    },
    ...(showRange
      ? [
          {
            key: "range",
            header: "Bid range",
            numeric: true,
            cell: (l: AuctionLine) => (
              <span className="whitespace-nowrap font-mono text-xs">
                {l.min_rate != null && l.max_rate != null ? `${l.min_rate.toFixed(2)}–${l.max_rate.toFixed(2)}%` : "—"}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "prev",
      header: "Previous",
      numeric: true,
      cell: (l) =>
        l.prev ? (
          <Link
            href={bondAuctionPath(market.slug, l.prev.date, l.prev.issue) ?? a.marketPath}
            className="whitespace-nowrap font-mono text-xs text-ink-soft underline underline-offset-2 hover:text-forest"
          >
            {l.prev.rate.toFixed(3)}% <span className="font-sans text-[11px] text-muted">{l.prev.date}</span>
          </Link>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      key: "change",
      header: "Change, bp",
      numeric: true,
      cell: (l) => <ChangeCell line={l} />,
    },
    ...(showOffered
      ? [
          {
            key: "offered",
            header: `Offered, ${ccy}m`,
            numeric: true,
            cell: (l: AuctionLine) => <span className="font-mono text-xs">{millions(l.offered_m)}</span>,
          },
        ]
      : []),
    {
      key: "bids",
      header: `Bids, ${ccy}m`,
      numeric: true,
      cell: (l) => <span className="font-mono text-xs">{millions(l.received_m)}</span>,
    },
    {
      key: "accepted",
      header: `Accepted, ${ccy}m`,
      numeric: true,
      cell: (l) => <span className="font-mono text-xs">{millions(l.accepted_m)}</span>,
    },
    {
      key: "cover",
      header: "Bid cover",
      numeric: true,
      cell: (l) => <span className="font-mono text-xs">{l.bid_cover == null ? "—" : `${l.bid_cover.toFixed(2)}×`}</span>,
    },
    ...extraColumns,
    {
      key: "source",
      header: "Source",
      cell: (l) => (
        <a
          href={l.source || market.sourcePage}
          target="_blank"
          rel="noopener noreferrer"
          data-track="source_click"
          className="text-xs text-muted underline underline-offset-2 hover:text-forest"
        >
          {l.source ? "notice" : "publisher"}
        </a>
      ),
    },
  ];

  const settleNote = a.settlement
    ? future
      ? `The date is the settlement date: the result is published and the bonds settle on ${shortDate(a.date)}. The auction itself was held a few days earlier.`
      : isToday
        ? `The date is the settlement date: the bonds settle today, ${shortDate(a.date)}. The auction itself was held a few days earlier.`
        : `The date is the settlement date, when the bonds were paid for and issued (${shortDate(a.date)}), not the auction day, which came a few days earlier.`
    : null;

  const lead = a.lead;
  const leadChange = lead.bps != null && lead.prev ? `${signedBps(lead.bps)} bp` : "—";

  return (
    <PageShell
      crumbs={crumbs}
      kicker={`${issuer ? `${issuer.name} · WAEMU` : shortName(market)} government bonds · ${a.settlement ? "settlement" : "auction"} ${shortDate(a.date)} · ${ccy}`}
      title={h1}
      lede={
        <p>
          {a.lines.length === 1 ? "One bond line" : `${a.lines.length} bond lines`} from the{" "}
          <a
            href={market.sourcePage}
            target="_blank"
            rel="noopener noreferrer"
            data-track="source_click"
            className="underline underline-offset-2 hover:text-forest"
          >
            {market.publisher}
          </a>
          ’s own result{a.sources.length > 1 ? "s" : ""}. Rates are the {market.rateNote.replace(/; the issuing country is in the issue field$/, "")}.
          {settleNote ? ` ${settleNote}` : ""} <em>Information, not advice.</em>
        </p>
      }
      aside={
        <ActionTile href={csv} download kicker="Download" title="CSV of every auction">
          <span className="block">Latest 12 months free; full history with a key</span>
          <span className="block">Source: {market.publisher}</span>
        </ActionTile>
      }
    >
      <JsonLd data={jsonLd} />

      <StatGroup>
        <Stat
          label={`Headline: ${n.leadName}`}
          value={`${lead.rate.toFixed(2)}%`}
          detail={lead.accepted_m != null ? `Largest amount accepted at this ${a.settlement ? "settlement date" : "auction"}` : "Longest tenor sold"}
        />
        <Stat
          label={byBond(market.slug) ? "Change vs this bond’s previous sale" : `Change vs previous ${lead.label} sale`}
          value={leadChange}
          detail={
            lead.prev
              ? `${pct2(lead.prev.rate)} on ${shortDate(lead.prev.date)}`
              : lead.noPrev === "ambiguous"
                ? "Two sales of this tenor on the previous date"
                : "No earlier sale of this tenor in the data"
          }
        />
        <Stat
          label="Accepted"
          value={money(ccy, a.totals.accepted)}
          detail={a.totals.offered != null ? `Against ${money(ccy, a.totals.offered)} on offer` : "Amount on offer not published per bond"}
        />
        <Stat
          label="Bid cover"
          value={a.totals.cover != null ? `${a.totals.cover.toFixed(2)}×` : "—"}
          detail={a.totals.received != null ? `Bids of ${money(ccy, a.totals.received)} ÷ accepted` : "Bids not published"}
        />
      </StatGroup>

      {intro ? <div className="mt-10">{intro}</div> : null}

      <section className="mt-12">
        <SectionTitle
          kicker="Results"
          title={a.lines.length === 1 ? "The line sold" : `Every line, ${a.lines.length} in all`}
          note={`Amounts in ${ccy} millions. Change is in basis points (100 bp = 1 percentage point) from the previous sale of the same ${
            byBond(market.slug) ? "bond line" : "tenor"
          }${market.slug === "egypt" ? " and coupon type" : ""}${issuer ? ` by ${issuer.name}` : ""}, whenever it was. Bid cover is bids received divided by the amount accepted.`}
        />
        <div className="mt-3">
          <DataTable
            label={`${a.place} bond auction of ${a.date}, by line`}
            columns={columns}
            rows={a.lines}
            rowKey={(l, i) => `${l.isin ?? l.issue ?? ""}-${l.tenor_years ?? ""}-${i}`}
            mobile="cards"
          />
        </div>
        <div className="mt-4 text-[13px] leading-6 text-ink-soft [overflow-wrap:anywhere]">
          <p>
            <span className="font-semibold text-ink">Source notice{a.sources.length > 1 ? "s" : ""}:</span>{" "}
            {a.sources.length ? (
              a.sources.map((s, i) => (
                <span key={s}>
                  {i ? " · " : ""}
                  <a href={s} target="_blank" rel="noopener noreferrer" data-track="source_click" className={link}>
                    {a.sources.length > 1 ? `${hostLabel(s)} (${i + 1})` : hostLabel(s)}
                  </a>
                </span>
              ))
            ) : (
              <a href={market.sourcePage} target="_blank" rel="noopener noreferrer" data-track="source_click" className={link}>
                {market.publisher}
              </a>
            )}
            . Compiled by Afronomics
            {updatedAt ? `, data updated ${updatedAt.slice(0, 10)}` : ""}. <em>Information, not advice.</em>
          </p>
        </div>
      </section>

      <nav aria-label="Other auctions" className="mt-10 grid gap-3 border-t border-rule pt-5 text-[13px] sm:grid-cols-3">
        <div>
          {a.older ? (
            <Link href={bondAuctionPath(market.slug, a.older, issuer?.name) ?? a.marketPath} className={link}>
              ← Previous auction, {shortDate(a.older)}
            </Link>
          ) : (
            <span className="text-muted">No earlier auction in the data</span>
          )}
        </div>
        <div className="sm:text-center">
          <Link href={a.marketPath} className={link}>
            All {marketLabel} bond auctions
          </Link>
        </div>
        <div className="sm:text-right">
          {a.newer ? (
            <Link href={bondAuctionPath(market.slug, a.newer, issuer?.name) ?? a.marketPath} className={link}>
              Next auction, {shortDate(a.newer)} →
            </Link>
          ) : (
            <span className="text-muted">This is the newest auction</span>
          )}
        </div>
      </nav>

      <section className="mt-12">
        <SectionTitle kicker="Data" title="Take the data with you" />
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Card>
            <p className="font-serif text-xl text-ink">CSV</p>
            <p className="mt-1 text-sm leading-6 text-ink-soft">
              Every {issuer ? "WAEMU" : shortName(market)} bond auction we hold, one row per line. Latest 12 months free; full history with a key.
            </p>
            <a href={csv} download className={`mt-3 inline-block break-all font-mono text-[12px] ${link}`}>
              {csv}
            </a>
          </Card>
          <Card>
            <p className="font-serif text-xl text-ink">JSON API</p>
            <p className="mt-1 text-sm leading-6 text-ink-soft">This auction’s lines as JSON. Latest 12 months free; full history with a key.</p>
            <a href={api} className={`mt-3 inline-block break-all font-mono text-[12px] ${link}`}>
              {decodeURIComponent(api)}
            </a>
          </Card>
          <Card tone="emphasis">
            <p className="font-serif text-xl text-ink">For investment teams</p>
            <p className="mt-1 text-sm leading-6 text-ink-soft">A 30-day pilot: an API key with the full history of every market we cover, free.</p>
            <ButtonLink href="/data/frontier-local-debt#pilot" size="sm" className="mt-3" data-track="pricing_cta_click">
              Request a pilot
            </ButtonLink>
          </Card>
        </div>
      </section>

      <div className="[overflow-wrap:anywhere]">
        <CiteBlock
          title={`${a.place} government bond auction, ${a.settlement ? "settlement " : ""}${shortDate(a.date)}`}
          path={a.path}
          publisher={`the ${market.publisher}`}
          csv={csv}
        />
      </div>
      {after}
    </PageShell>
  );
}
