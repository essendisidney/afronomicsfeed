import { fmtBps, fmtCover, fmtDate, fmtRate, fmtTenor, type MarketSummary } from "./data";

const dash = <span className="text-muted">—</span>;

export function NoticeLink({ href, label = "Notice" }: { href: string; label?: string }) {
  if (!href) return dash;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-2 hover:text-gold">
      {label}
      <span className="mon-arrow" aria-hidden="true">
        {" "}
        ↗
      </span>
    </a>
  );
}

/** One row per bond market: the newest auction and what moved since three months and a year earlier. */
export function MarketTable({ markets }: { markets: MarketSummary[] }) {
  return (
    <div className="mon-scroll mt-4 overflow-x-auto">
      <table className="data-table mon-table">
        <thead>
          <tr>
            <th>Market</th>
            <th>Newest result</th>
            <th className="text-right">Results, 90 days</th>
            <th>Longest tenor in newest auction</th>
            <th className="text-right">Rate</th>
            <th className="text-right">vs 3 months earlier</th>
            <th className="text-right">Median bid cover, 90 days</th>
            <th className="text-right">Median bid cover, prior 12 months</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {markets.map((m) => (
            <tr key={m.market.slug}>
              <td>
                <a href={`#m-${m.market.slug}`} className="font-medium text-ink hover:text-forest">
                  {m.label}
                </a>
                <span className="block text-[11px] text-muted">{m.market.currency}</span>
              </td>
              <td className="whitespace-nowrap">
                {fmtDate(m.latestDate)}
                <span className="block text-[11px] text-muted">{m.latestIsFuture ? "settles (future date)" : m.dateLabel.toLowerCase()}</span>
              </td>
              <td className="text-right">{m.results90}</td>
              <td>
                {fmtTenor(m.headline.tenor_years)}
                {m.headline.issue ? <span className="block max-w-[11rem] truncate text-[11px] text-muted">{m.headline.issue}</span> : null}
              </td>
              <td className="text-right font-semibold text-ink">{fmtRate(m.headline.rate)}</td>
              <td className="text-right whitespace-nowrap">
                {m.change ? (
                  <>
                    {fmtBps(m.change.bps)} bp
                    <span className="block text-[11px] text-muted">
                      vs mean of {m.change.n} result{m.change.n === 1 ? "" : "s"}
                    </span>
                  </>
                ) : (
                  dash
                )}
              </td>
              <td className="text-right">
                {m.cover90 ? (
                  <>
                    {fmtCover(m.cover90.median)}
                    <span className="block text-[11px] text-muted">n = {m.cover90.n}</span>
                  </>
                ) : (
                  dash
                )}
              </td>
              <td className="text-right">
                {m.cover12m ? (
                  <>
                    {fmtCover(m.cover12m.median)}
                    <span className="block text-[11px] text-muted">n = {m.cover12m.n}</span>
                  </>
                ) : (
                  dash
                )}
              </td>
              <td className="whitespace-nowrap">
                <NoticeLink href={m.headline.source || m.market.sourcePage} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
