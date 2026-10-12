import { fmtDate, fmtRate, type BillSummary } from "./data";
import { NoticeLink } from "./MarketTable";

/** The short end: the newest result at the longest bill tenor each market auctions. */
export function BillContext({ bills }: { bills: BillSummary[] }) {
  return (
    <div className="mon-scroll mt-4 overflow-x-auto">
      <table className="data-table mon-table">
        <thead>
          <tr>
            <th>Market</th>
            <th className="text-right">Tenor</th>
            <th className="text-right">Rate</th>
            <th>Value (issue) date</th>
            <th>Rate measured as</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {bills.map(({ market, row }) => (
            <tr key={market.slug}>
              <td className="font-medium text-ink">{market.country}</td>
              <td className="text-right">{row.tenor} days</td>
              <td className="text-right font-semibold text-ink">{fmtRate(row.rate)}</td>
              <td className="whitespace-nowrap">{fmtDate(row.date)}</td>
              <td className="text-[12px] text-ink-soft">{market.rateNote}</td>
              <td className="whitespace-nowrap">
                <NoticeLink href={row.source || market.sourcePage} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
