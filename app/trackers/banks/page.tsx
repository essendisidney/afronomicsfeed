import type { Metadata } from "next";
import { ExampleDataBadge } from "@/components/ui/ExampleDataBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import { bankRows } from "@/lib/trackers";

export const metadata: Metadata = {
  title: "Bank forensic index",
  description: "Example-data stub index of listed-bank filings.",
};

export default function BankTrackerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Trackers"
        title="Bank forensic index"
        lede="A filing index, not a league table. No ratios are presented as real prints. Use NSE announcements and issuer statements."
      />
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <ExampleDataBadge />
        <a href={site.nseTapeUrl} className="text-forest underline underline-offset-4" target="_blank" rel="noopener noreferrer">
          NSE announcements
        </a>
        <a href="https://www.centralbank.go.ke/bank-supervision/" className="text-forest underline underline-offset-4" target="_blank" rel="noopener noreferrer">
          CBK Bank Supervision
        </a>
      </div>
      <div className="mt-10 overflow-x-auto">
        <table className="data-table min-w-[720px]">
          <thead>
            <tr>
              <th>Issuer</th>
              <th>Ticker</th>
              <th>Filing</th>
              <th>Period end</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {bankRows.map((row) => (
              <tr key={row.ticker}>
                <td>
                  {row.issuer} <ExampleDataBadge className="ml-2 align-middle" />
                </td>
                <td className="font-mono text-xs">{row.ticker}</td>
                <td>{row.filing}</td>
                <td className="whitespace-nowrap font-mono text-xs">{formatDate(row.periodEnd)}</td>
                <td className="text-ink-soft">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
