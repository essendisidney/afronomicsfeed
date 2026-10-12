import type { Metadata } from "next";
import Link from "next/link";
import { HeadlineStats } from "@/components/auctionweek/HeadlineStats";
import { MarketWeekCard } from "@/components/auctionweek/MarketWeekCard";
import { WeekSummary } from "@/components/auctionweek/WeekSummary";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { loadAuctionWeek, longDate, rangeLabel, shortDate } from "@/lib/data/auction-week";
import { site } from "@/lib/site";

export const revalidate = 3600;

const PATH = "/markets/auction-week";
/** Route handlers, not pages: plain links, so the browser downloads them instead of the client router. */
const API = { bills: "/api/v1/tbills", bonds: "/api/v1/bonds" };

export function generateMetadata(): Metadata {
  const week = loadAuctionWeek();
  const title = week ? `African government debt auctions this week (${shortDate(week.window.end)})` : "African government debt auctions this week";
  const description = week
    ? `${week.auctions} government bill and bond auctions in ${week.marketsActive} African markets, ${rangeLabel(week.window.start, week.window.end)}: rates by tenor and the change from each previous sale, bid cover and amounts accepted, from the publishers' own results.`
    : "Government bill and bond auction results from African central banks, week by week.";
  return {
    title,
    description,
    alternates: { canonical: `${site.url}${PATH}` },
    openGraph: { title, description, url: `${site.url}${PATH}`, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

const link = "font-medium text-forest underline underline-offset-2 hover:text-gold";

/** A weekly wrap of African government debt auctions, computed from the auction files on every build. */
export default function AuctionWeekPage() {
  const week = loadAuctionWeek();
  const crumbs = [{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { label: "Auction week" }];
  if (!week) {
    return (
      <PageShell crumbs={crumbs} kicker="Weekly wrap" title="This week in African government debt auctions">
        <p className="text-ink-soft">No auction results are loaded yet.</p>
      </PageShell>
    );
  }
  const settlementMarkets = week.markets.filter((m) => m.results.some((r) => r.dateKind === "settlement")).map((m) => m.meta.country);
  return (
    <PageShell
      crumbs={crumbs}
      kicker={`Weekly wrap · ${rangeLabel(week.window.start, week.window.end)}`}
      title="This week in African government debt auctions"
      lede={
        <p>
          Every Treasury bill and bond result we hold from African central banks and treasuries for the seven days to {longDate(week.window.end)}, the date of
          the newest result. Each rate is set against the same market’s previous sale of the same tenor.
        </p>
      }
    >
      <HeadlineStats week={week} />

      <div className="mt-8">
        <WeekSummary week={week} path={PATH} />
      </div>

      <section className="mt-12">
        <SectionTitle
          kicker={`${week.marketsActive} markets · ${week.auctions} auctions`}
          title="Market by market"
          note={`Rates in percent a year, as each publisher measures them. Change in basis points (bp; 100 bp = 1 percentage point) from the previous sale of the same tenor, whenever it was. Amounts in millions of local currency.`}
        />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {week.markets.map((m) => (
            <MarketWeekCard key={m.meta.key} market={m} />
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3" aria-label="More data">
        <div className="rounded-xl border border-rule bg-paper-2 px-4 py-4">
          <p className="text-[15px] font-semibold text-ink">Every result, as it lands</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">The monitor shows each market’s newest auction the day it is published.</p>
          <Link href="/data/frontier-local-debt/monitor" className={`mt-2 inline-block text-[13px] ${link}`}>
            Open the auction monitor
          </Link>
        </div>
        <div className="rounded-xl border border-rule bg-paper-2 px-4 py-4">
          <p className="text-[15px] font-semibold text-ink">CSV and API</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">Full histories in one format. Each card above links its own files.</p>
          <p className="mt-2 flex flex-wrap gap-x-3 text-[13px]">
            <a href={API.bills} className={link}>
              Bills API
            </a>
            <a href={API.bonds} className={link}>
              Bonds API
            </a>
            <Link href="/developers" className={link}>
              API guide
            </Link>
          </p>
        </div>
        <div className="rounded-xl border-2 border-forest/30 bg-surface px-4 py-4">
          <p className="text-[15px] font-semibold text-ink">For investment teams</p>
          <p className="mt-1 text-[13px] leading-5 text-ink-soft">A 30-day pilot: an API key, the full history and alerts, free.</p>
          <Link href="/data/frontier-local-debt#pilot" className={`mt-2 inline-block text-[13px] ${link}`}>
            Request a pilot
          </Link>
        </div>
      </section>

      <section className="mt-10 max-w-3xl text-[13px] leading-6 text-ink-soft">
        <h2 className="text-[15px] font-semibold text-ink">How this page is made</h2>
        <p className="mt-1">
          The week is the seven days ending on the newest result date in any market ({rangeLabel(week.window.start, week.window.end)}); the week before is{" "}
          {rangeLabel(week.previous.start, week.previous.end)}. Dates are as each publisher records them: Treasury bills by value date
          {settlementMarkets.length ? `, ${settlementMarkets.join(" and ")} bonds by settlement date,` : ""} and other bonds by auction date, so an auction held late in
          one week can appear in the next. An auction is one market’s sale of bills or of bonds on one date. Bid cover is bids received divided by the amount
          accepted. Amounts are added up within each currency and never converted. Kenya’s bond buybacks are left out; switches are shown and marked. WAEMU
          bonds are shown by issuing country.
        </p>
        <p className="mt-2">
          Source: the central banks and treasuries named on each card, linked to their notices. Afronomics compiles and checks; the publisher is the source.{" "}
          <em>Information, not advice.</em>
        </p>
      </section>
    </PageShell>
  );
}
