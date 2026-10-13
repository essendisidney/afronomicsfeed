import type { BondRow } from "@/lib/data/sovereign-bonds";
import { fmtAmount, fmtCover, fmtDate, fmtRate, fmtTenor, type MarketSummary } from "./data";
import { NoticeLink } from "./MarketTable";

function ResultRows({ rows, dateLabel, currency, showIssue }: { rows: BondRow[]; dateLabel: string; currency: string; showIssue: boolean }) {
  return (
    <div className="mon-scroll overflow-x-auto">
      <table className="data-table mon-table mon-mini">
        <thead>
          <tr>
            <th>{dateLabel}</th>
            {showIssue ? <th>Bond</th> : null}
            <th className="text-right">Tenor</th>
            <th className="text-right">Rate</th>
            <th className="text-right">Bid cover</th>
            <th className="text-right">Accepted, {currency}m</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.date}-${r.isin ?? r.issue ?? ""}-${r.tenor_years ?? ""}-${i}`}>
              <td className="whitespace-nowrap">{fmtDate(r.date)}</td>
              {showIssue ? <td className="mon-bond max-w-[7.5rem] truncate text-[12px] text-ink-soft">{r.issue ?? r.isin ?? "—"}</td> : null}
              <td className="text-right">{fmtTenor(r.tenor_years)}</td>
              <td className="text-right font-semibold text-ink">{fmtRate(r.rate)}</td>
              <td className="text-right">{r.bid_cover == null ? "—" : fmtCover(r.bid_cover)}</td>
              <td className="text-right">{fmtAmount(r.accepted_m)}</td>
              <td className="whitespace-nowrap">
                <NoticeLink href={r.source} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The five newest results per market; WAEMU split by issuing treasury. */
export function MarketSections({ markets }: { markets: MarketSummary[] }) {
  return (
    <div className="mon-sections mt-4 xl:columns-2 xl:gap-8">
      {markets.map((m) => (
        <section key={m.market.slug} id={`m-${m.market.slug}`} className="mon-section min-w-0 mb-8 break-inside-avoid">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-ink/70 pb-1.5">
            <h3 className="font-serif text-xl text-ink">{m.label}</h3>
            <a href={m.market.sourcePage} target="_blank" rel="noopener noreferrer" className="text-[12px] text-muted underline underline-offset-2">
              {m.market.publisher}
            </a>
          </div>
          <p className="mt-1.5 text-[12px] leading-5 text-muted">
            Rate: {m.market.rateNote}.{" "}
            {m.market.dateKind === "settlement" ? "Dates are settlement dates: the auction itself is held a few days earlier." : "Dates are auction dates."}
          </p>
          {m.groups ? (
            m.groups.map((g) => (
              <div key={g.issuer} className="mt-3">
                <p className="text-[13px] font-semibold text-ink">
                  {g.issuer} <span className="font-normal text-muted">· {g.count12m} results in the last 12 months</span>
                </p>
                <ResultRows rows={g.rows} dateLabel={m.dateLabel} currency={m.market.currency} showIssue={false} />
              </div>
            ))
          ) : (
            <div className="mt-2">
              <ResultRows rows={m.recent} dateLabel={m.dateLabel} currency={m.market.currency} showIssue />
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
