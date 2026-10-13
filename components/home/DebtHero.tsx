import Link from "next/link";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { bondSnapshot, loadBondMarket, type BondMarket, type BondSnapshot } from "@/lib/data/sovereign-bonds";

// Index weight order (largest African GBI-EM Edge constituents first), WAEMU last as a group.
const ORDER: BondMarket["slug"][] = ["egypt", "nigeria", "kenya", "uganda", "morocco", "zambia", "waemu"];

const longDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const tenor = (y: number | null) => (y === null ? null : y < 1 ? `${Math.round(y * 12)}-month` : `${Number.isInteger(y) ? y : y.toFixed(1)}-year`);
const count = (n: number) => n.toLocaleString("en-US");

type Row = {
  snap: BondSnapshot;
  label: string;
  dateLabel: string;
  tenor: string | null;
  issuer: string | null;
  rate: number;
  lines: number;
};

/** Everything the hero says about coverage, counted from the auction files at build time. */
function coverage() {
  const snaps = ORDER.map((slug) => bondSnapshot(slug, 24, 1000)).filter((s): s is BondSnapshot => s !== null);

  const rows: Row[] = snaps.map((snap) => {
    // bondSnapshot sorts the newest auction by tenor, shortest first; the longest line is the last one.
    const longest = snap.latest[snap.latest.length - 1];
    const settlement = snap.market.dateKind === "settlement";
    return {
      snap,
      label: snap.market.slug === "waemu" ? "WAEMU" : snap.market.country,
      dateLabel: `${settlement ? "Settlement" : "Auction"} ${longDate(snap.latestDate)}`,
      tenor: tenor(longest.tenor_years),
      issuer: snap.market.slug === "waemu" ? longest.issue : null,
      rate: longest.rate,
      lines: snap.latest.length,
    };
  });

  // WAEMU is one file but eight issuing treasuries; count the ones that actually appear in it.
  const markets = snaps.reduce((n, s) => {
    if (s.market.slug !== "waemu") return n + 1;
    return n + new Set(loadBondMarket("waemu").rows.map((r) => r.issue).filter(Boolean)).size;
  }, 0);
  const bondResults = snaps.reduce((n, s) => n + s.results, 0);
  const bills = billMarkets.map((m) => loadBillMarket(m.slug).rows.length).filter((n) => n > 0);
  const billResults = bills.reduce((n, v) => n + v, 0);
  const firstYear = snaps.length ? Math.min(...snaps.map((s) => Number(s.since.slice(0, 4)))) : null;
  // Settlement dates can lie a few days ahead of the auction, so the "newest auction" is taken from auction-dated markets only.
  const auctionDated = snaps.filter((s) => s.market.dateKind !== "settlement").map((s) => s.latestDate).sort();
  const newest = auctionDated.at(-1) ?? null;

  const settled = rows.filter((r) => r.snap.market.dateKind === "settlement").map((r) => r.label);

  return { rows, settled, markets, bondResults, billResults, billMarketCount: bills.length, firstYear, newest };
}

/** The top of the homepage, for institutional buyers: the promise, live proof from the data, and the latest bond auction per market. */
export function DebtHero() {
  const { rows, settled, markets, bondResults, billResults, billMarketCount, firstYear, newest } = coverage();

  const proof = [
    markets > 0 ? { v: count(markets), k: "markets with bond auction data" } : null,
    bondResults > 0 ? { v: count(bondResults), k: firstYear ? `bond auction results, from ${firstYear}` : "bond auction results" } : null,
    billResults > 0 ? { v: count(billResults), k: `Treasury-bill results in ${billMarketCount} markets` } : null,
    newest ? { v: longDate(newest), k: "newest auction on file" } : null,
  ].filter((x): x is { v: string; k: string } => x !== null);

  return (
    <section aria-labelledby="debt-hero" className="on-night bg-night text-night-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pb-14 pt-10 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:pb-20 lg:pt-16">
        <div className="min-w-0 lg:col-span-7 lg:pt-2">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-accent">For frontier and EM debt investors</p>
          <h1 id="debt-hero" className="mt-4 font-serif text-[2.4rem] leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-[4.1rem]">
            African government debt auctions, read from the issuer, within hours.
          </h1>
          <p className="mt-6 max-w-2xl text-[17px] leading-7 text-night-soft">
            Primary bond and Treasury-bill results in local currency, checked and published as each central bank or debt office reports them.
            Every figure carries a link to the notice it came from. By JPMorgan’s reported launch weights, Africa is about 44.5% of the new GBI-EM
            Edge frontier index; this is the auction record underneath it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/data/frontier-local-debt#pilot"
              className="rounded-full bg-accent px-5 py-3 text-[15px] font-semibold text-night hover:bg-gold-soft"
            >
              Request a 30-day pilot
            </Link>
            <Link
              href="/data-api"
              className="rounded-full border border-night-line px-5 py-3 text-[15px] font-medium text-night-ink hover:border-night-soft/50 hover:bg-night-2"
            >
              See the API
            </Link>
          </div>

          {proof.length ? (
            <dl className="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-night-line pt-6 sm:grid-cols-4">
              {proof.map((item) => (
                <div key={item.k} className="flex min-w-0 flex-col">
                  <dt className="order-2 mt-1 text-[13px] leading-5 text-night-muted">{item.k}</dt>
                  <dd className="af-board-figure order-1 text-[1.75rem] leading-none text-night-ink sm:text-[2rem]">{item.v}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <p className="mt-6 text-[12px] leading-5 text-night-muted">
            Counted from our auction files when this page was built. Information, not advice.
          </p>
        </div>

        {rows.length ? (
          <div className="min-w-0 lg:col-span-5">
            <div className="rounded-3xl border border-night-line bg-night-2 p-2 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
              <div className="flex items-baseline justify-between gap-3 px-3 pb-3 pt-3 sm:px-4">
                <h2 className="text-[15px] font-semibold">Latest bond auction, each market</h2>
                <Link href="/markets/bonds" className="shrink-0 text-[13px] text-night-muted hover:text-night-ink">
                  All bond auctions →
                </Link>
              </div>
              <ul className="space-y-1">
                {rows.map((row, i) => (
                  <li key={row.snap.market.slug} className="af-board-row" style={{ "--i": i } as React.CSSProperties}>
                    <Link
                      // Each row goes to that market's own bond page, so the homepage passes weight to every one of them.
                      href={row.snap.market.slug === "kenya" ? "/markets/kenya-bonds" : `/markets/bonds/${row.snap.market.slug}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-night px-3 py-3 hover:bg-night/60 sm:px-4"
                    >
                      <span className="min-w-0">
                        <span className="flex items-baseline gap-2">
                          <span className="truncate text-[15px] font-medium">{row.label}</span>
                          <span className="shrink-0 text-[11px] font-semibold tracking-wide text-night-muted">{row.snap.market.currency}</span>
                        </span>
                        <span className="mt-0.5 block text-[12px] text-night-muted">{row.dateLabel}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="af-board-figure block text-[24px] leading-none sm:text-[28px]">{row.rate.toFixed(2)}%</span>
                        <span className="mt-1 block text-[12px] text-night-soft">
                          {[row.issuer, row.tenor].filter(Boolean).join(" · ") || "longest line"}
                          {row.lines > 1 ? <span className="text-night-muted"> · longest of {row.lines}</span> : null}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="px-3 pb-2 pt-3 text-[12px] leading-5 text-night-muted sm:px-4">
                Longest tenor in each market’s newest auction. Rates as each issuer reports them (weighted average, cut-off or marginal).
                {settled.length ? ` ${settled.join(" and ")} ${settled.length > 1 ? "are" : "is"} dated by settlement, not auction day.` : ""} Information, not
                advice.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
