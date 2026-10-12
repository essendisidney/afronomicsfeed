import Link from "next/link";
import { formatFx, pairHref, type loadFxQuote } from "@/lib/data/fx";
import { billMarkets, latestBills, loadBillMarket } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";

const boardDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

type Fx = Awaited<ReturnType<typeof loadFxQuote>>;

/** The free side of the site, right under the institutional hero: rate tools for savers and borrowers, and the latest 364-day bills. */
export function EveryoneIntro({ fx, stats }: { fx: Fx; stats: { k: string; v: number }[] }) {
  const board = billMarkets
    .flatMap((market) => {
      const item = latestBills(loadBillMarket(market.slug).rows).get(364);
      if (!item) return [];
      const bps = item.previous ? Math.round((item.latest.rate - item.previous.rate) * 100) : null;
      return [{ market, rate: item.latest.rate, bps, date: item.latest.date }];
    })
    // the six markets that auctioned most recently
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);
  const boardFx = fx ? (["KES", "NGN", "ZAR", "GHS", "EGP"] as const).flatMap((code) => (fx.rates[code] == null ? [] : [{ code, rate: fx.rates[code] }])) : [];

  return (
    <section aria-labelledby="everyone" className="border-b border-rule bg-paper-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:py-16">
        <div className="min-w-0 lg:col-span-6">
          <p className="text-[13px] font-semibold text-gold">{site.tagline} · free to read</p>
          <h2 id="everyone" className="mt-3 font-serif text-[2rem] leading-[1.05] tracking-[-0.015em] text-ink sm:text-5xl">
            What money costs in Africa, from the source, for everyone.
          </h2>
          <p className="mt-5 max-w-xl text-[16px] leading-7 text-ink-soft">{site.promise}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            {[
              { href: "/rates/kenya/check", label: "Is my rate fair?" },
              { href: "/rates/kenya", label: "Today’s rates" },
              { href: "/rates/what-readers-paid", label: "What did others pay?" },
            ].map((action, i) => (
              <Link
                key={action.href}
                href={action.href}
                className={
                  i === 0
                    ? "rounded-full bg-forest px-5 py-2.5 text-[15px] font-semibold text-paper hover:bg-gold"
                    : "rounded-full border border-rule bg-surface px-5 py-2.5 text-[15px] font-medium text-ink hover:border-gold hover:text-gold"
                }
              >
                {action.label}
              </Link>
            ))}
          </div>
          <p className="mt-4 text-[14px] text-muted">
            Or start from where you are:{" "}
            {[
              { href: "#saving", label: "saving" },
              { href: "#borrowing", label: "borrowing" },
              { href: "#business", label: "running a business" },
              { href: "#institutions", label: "an institution" },
            ].map((door, i, all) => (
              <span key={door.href}>
                <a href={door.href} className="text-ink underline underline-offset-4 hover:text-gold">
                  {door.label}
                </a>
                {i < all.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
          {stats.length ? (
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4 sm:gap-8">
              {stats.map((item) => (
                <div key={item.k} className="flex flex-col-reverse">
                  <dt className="text-[13px] text-muted">{item.k}</dt>
                  <dd className="af-board-figure text-3xl text-ink">{String(item.v)}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>

        {board.length ? (
          <div className="min-w-0 lg:col-span-6">
            <div className="rounded-3xl border border-rule bg-surface p-2">
              <div className="flex items-baseline justify-between gap-3 px-3 pb-2 pt-3 sm:px-4">
                <h3 className="text-[15px] font-semibold text-ink">Latest 364-day bill auctions</h3>
                <Link href="/markets/tbills" className="shrink-0 text-[13px] text-muted hover:text-forest">
                  All markets →
                </Link>
              </div>
              <table className="w-full text-left">
                <thead className="sr-only">
                  <tr>
                    <th>Market</th>
                    <th>Rate</th>
                    <th>Change since previous auction</th>
                    <th>Auction</th>
                  </tr>
                </thead>
                <tbody>
                  {board.map((row) => (
                    <tr key={row.market.slug} className="border-t border-rule first:border-t-0">
                      <td className="py-2.5 pl-3 sm:pl-4">
                        <Link href={row.market.href} className="flex items-center gap-3 hover:text-forest">
                          <span className="grid h-7 w-9 place-items-center rounded-md bg-paper-2 text-[11px] font-semibold tracking-wide text-ink-soft">
                            {row.market.iso}
                          </span>
                          <span className="text-[15px] font-medium text-ink">{row.market.country}</span>
                        </Link>
                      </td>
                      <td className="af-board-figure py-2.5 text-right text-[22px] text-ink">{row.rate.toFixed(2)}%</td>
                      <td
                        className={`py-2.5 pl-3 text-right text-[13px] font-medium tabular-nums ${
                          row.bps == null || row.bps === 0 ? "text-muted" : row.bps > 0 ? "text-down" : "text-up"
                        }`}
                      >
                        {row.bps == null ? "" : row.bps === 0 ? "unch." : `${row.bps > 0 ? "+" : "−"}${Math.abs(row.bps)} bp`}
                      </td>
                      <td className="py-2.5 pl-3 pr-3 text-right text-[13px] text-muted sm:pr-4">{boardDate.format(new Date(row.date))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {boardFx.length ? (
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {boardFx.map((item) => (
                    <Link key={item.code} href={pairHref(item.code)} className="min-w-0 rounded-2xl bg-paper-2 px-1 py-2.5 text-center hover:bg-paper-3 sm:px-3">
                      <span className="block text-[11px] text-muted">USD/{item.code}</span>
                      <span className="af-board-figure mt-0.5 block text-[15px] text-ink sm:text-lg">{formatFx(item.rate)}</span>
                    </Link>
                  ))}
                </div>
              ) : null}
              <p className="px-3 pb-2 pt-3 text-[12px] leading-5 text-muted sm:px-4">
                Central-bank auction results, compiled by Afronomics; dates are value dates. Dollar rates are the daily mid-market reference.
                Information, not advice.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
