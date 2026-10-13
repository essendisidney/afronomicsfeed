import Link from "next/link";
import { bondAuctionPath } from "@/components/bonds/auction";
import { fmtBpsSigned, fmtCover, fmtMillions, fmtRate, shortDate, type Compared, type MarketWeek } from "@/lib/data/auction-week";

const KENYA_BONDS_CSV = "/api/data/kenya-bonds";
const link = "text-forest underline underline-offset-2 hover:text-gold";

const DATE_WORD: Record<Compared["dateKind"], string> = { auction: "auction", settlement: "settlement date", value: "value date" };

function hostLabel(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

/** One auction (one instrument, one date) inside a market card. */
function AuctionTable({ rows, currency, href }: { rows: Compared[]; currency: string; href: string | null }) {
  const first = rows[0];
  const sources = [...new Set(rows.map((r) => r.source).filter((s) => /^https?:\/\//.test(s)))];
  return (
    <div className="mt-4">
      <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-[12px] text-ink-soft">
        <span>
          <span className="font-semibold text-ink">{first.instrument === "bill" ? "Treasury bills" : "Treasury bonds"}</span> · {DATE_WORD[first.dateKind]}{" "}
          {href ? (
            <Link href={href} className={link}>
              {shortDate(first.date)}
            </Link>
          ) : (
            shortDate(first.date)
          )}
        </span>
        {sources.length ? (
          <span>
            {sources.map((s, i) => (
              <a key={s} href={s} target="_blank" rel="noopener noreferrer" className={`${link} ${i ? "ml-2" : ""}`}>
                {sources.length > 1 ? `Source ${i + 1}` : `Source: ${hostLabel(s)}`}
              </a>
            ))}
          </span>
        ) : null}
      </p>
      <table className="mt-1.5 w-full table-fixed text-[12px] sm:text-[13px]">
        <colgroup>
          <col className="w-[23%]" />
          <col className="w-[24%]" />
          <col className="w-[19%]" />
          <col className="w-[14%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead>
          <tr className="text-left align-bottom text-[11px] leading-4 text-muted">
            <th className="pb-1 font-normal">Tenor</th>
            <th className="pb-1 pl-2 text-right font-normal">Rate</th>
            <th className="pb-1 pl-2 text-right font-normal">Change, bp</th>
            <th className="pb-1 pl-2 text-right font-normal">Cover</th>
            <th className="pb-1 pl-2 text-right font-normal">Accepted, {currency}m</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.series}-${i}`} className="border-t border-rule align-top">
              <td className="py-1.5 pr-1 text-ink">
                {r.tenorLabel}
                {r.detail ? (
                  <span className="block break-words text-[11px] leading-4 text-muted">
                    {r.detail.split("/").map((part, j) => (
                      <span key={j}>
                        {j ? "/" : ""}
                        {j ? <wbr /> : null}
                        {part}
                      </span>
                    ))}
                  </span>
                ) : null}
              </td>
              <td className="py-1.5 pl-2 text-right font-mono text-ink">{fmtRate(r.rate)}</td>
              <td className="py-1.5 pl-2 text-right font-mono text-ink">
                {r.bps === null ? (
                  <span className="text-muted" title="No earlier sale of this tenor in the data">
                    new
                  </span>
                ) : (
                  <>
                    {fmtBpsSigned(r.bps)}
                    <span className="block font-sans text-[11px] leading-4 text-muted" title={`Previous sale ${shortDate(r.prev!.date)} at ${fmtRate(r.prev!.rate)}`}>
                      vs {shortDate(r.prev!.date).replace(/ \d{4}$/, (y) => (r.prev!.date.slice(0, 4) === r.date.slice(0, 4) ? "" : y))}
                    </span>
                  </>
                )}
              </td>
              <td className="py-1.5 pl-2 text-right font-mono text-ink-soft">{r.bidCover ? fmtCover(r.bidCover) : "—"}</td>
              <td className="py-1.5 pl-2 text-right font-mono text-ink-soft">{r.accepted === null ? "—" : fmtMillions(r.accepted)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** One market's week: each auction it held, every tenor's rate against its previous sale, and where to go next. */
export function MarketWeekCard({ market }: { market: MarketWeek }) {
  const { meta } = market;
  const auctions = new Map<string, Compared[]>();
  for (const r of market.results) {
    const k = `${r.instrument}|${r.date}`;
    auctions.set(k, [...(auctions.get(k) ?? []), r]);
  }
  const hasBond = market.results.some((r) => r.instrument === "bond");
  const hasBill = market.results.some((r) => r.instrument === "bill");
  const issueQuery = meta.group === "WAEMU" ? `?issue=${encodeURIComponent(meta.country.normalize("NFD").replace(/[̀-ͯ]/g, "").split(" ")[0])}` : "";
  const sold = [...new Set(market.results.map((r) => `${r.tenorLabel} ${r.instrument}`))];
  const notes =
    hasBill && hasBond ? [`bills, ${meta.rateNotes.bill}`, `bonds, ${meta.rateNotes.bond}`] : [hasBill ? meta.rateNotes.bill : meta.rateNotes.bond].filter(Boolean);
  const publishers = [...new Set([hasBill ? meta.publishers.bill : null, hasBond ? meta.publishers.bond : null].filter(Boolean))];
  return (
    <article id={`m-${meta.key}`} className="flex min-w-0 flex-col rounded-xl border border-rule bg-surface px-4 py-4 sm:px-5">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-xl text-ink">
          {meta.bondSlug ? (
            <Link href={`/markets/bonds/${meta.bondSlug}`} className="hover:text-forest">
              {meta.country}
            </Link>
          ) : meta.billHref ? (
            <Link href={meta.billHref} className="hover:text-forest">
              {meta.country}
            </Link>
          ) : (
            meta.country
          )}
          {meta.group ? <span className="ml-2 align-middle text-[12px] font-sans text-muted">{meta.group}</span> : null}
        </h3>
        <span className="shrink-0 text-[12px] text-muted">{meta.currency}</span>
      </header>
      <p className="mt-1 text-[13px] leading-5 text-ink-soft">
        Sold: {sold.join(", ")}.{" "}
        {market.accepted !== null ? (
          <>
            Accepted {meta.currency} {fmtMillions(market.accepted)}m
            {market.acceptedMissing ? ` (${market.acceptedMissing} without an amount)` : ""}.
          </>
        ) : (
          "No accepted amounts published."
        )}
      </p>
      {[...auctions.values()].map((rows) => (
        <AuctionTable
          key={`${rows[0].instrument}-${rows[0].date}`}
          rows={rows}
          currency={meta.currency}
          // A bond auction links its own dated page (WAEMU: the issuer's auction that day).
          href={rows[0].instrument === "bond" && meta.bondSlug ? bondAuctionPath(meta.bondSlug, rows[0].date, meta.group === "WAEMU" ? meta.country : null) : null}
        />
      ))}
      <p className="mt-3 text-[11px] leading-4 text-muted">
        Rate: {notes.join("; ")}. Change: against the previous sale of the same tenor{meta.key === "kenya" && hasBond ? " (for Kenya’s bonds, the same bond line)" : ""}. Cover: bids received ÷ accepted.
        Source: {publishers.join("; ")}.
      </p>
      <p className="mt-auto flex flex-wrap gap-x-3 gap-y-1 pt-3 text-[12px]">
        {meta.bondSlug ? (
          <Link href={`/markets/bonds/${meta.bondSlug}`} className={link}>
            {meta.group ? "WAEMU bonds" : `${meta.country} bonds`}
          </Link>
        ) : null}
        {meta.billHref ? (
          <Link href={meta.billHref} className={link}>
            {meta.country} bills
          </Link>
        ) : null}
        {hasBill && meta.billSlug ? (
          <>
            <a href={`/api/data/tbills/${meta.billSlug}`} className={link}>
              Bills CSV
            </a>
            <a href={`/api/v1/tbills/${meta.billSlug}`} className={link}>
              Bills API
            </a>
          </>
        ) : null}
        {hasBond && meta.bondSlug === "kenya" ? (
          <a href={KENYA_BONDS_CSV} className={link}>
            Bonds CSV
          </a>
        ) : null}
        {hasBond && meta.bondSlug ? (
          <a href={`/api/v1/bonds/${meta.bondSlug}${issueQuery}`} className={link}>
            Bonds API
          </a>
        ) : null}
        {(hasBill && meta.billSlug) || (hasBond && meta.bondSlug) ? <span className="text-muted">latest 12 months free; full history with a key</span> : null}
      </p>
    </article>
  );
}
