import type { Metadata } from "next";
import { ExampleDataBadge } from "@/components/ui/ExampleDataBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/format";
import { debtRows } from "@/lib/trackers";

export const metadata: Metadata = {
  title: "Debt & rates calendar",
  description: "Example-data stub of Kenya Treasury bill and bond auction weeks.",
};

export default function DebtTrackerPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Trackers"
        title="Debt & rates calendar"
        lede="Placeholder weeks only. Accepted yields and offered amounts exist solely in CBK result notices. This table is not an official calendar."
      />
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <ExampleDataBadge />
        <a
          href="https://www.centralbank.go.ke/bills-bonds/treasury-bills/"
          className="text-forest underline underline-offset-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          CBK Treasury bills
        </a>
        <a
          href="https://www.treasury.go.ke/"
          className="text-forest underline underline-offset-4"
          target="_blank"
          rel="noopener noreferrer"
        >
          National Treasury
        </a>
      </div>
      <div className="mt-10 overflow-x-auto">
        <table className="data-table min-w-[720px]">
          <thead>
            <tr>
              <th>Week of</th>
              <th>Instrument</th>
              <th>Event</th>
              <th>Where to confirm</th>
            </tr>
          </thead>
          <tbody>
            {debtRows.map((row) => (
              <tr key={`${row.weekOf}-${row.instrument}`}>
                <td className="whitespace-nowrap font-mono text-xs">{formatDate(row.weekOf)}</td>
                <td>
                  {row.instrument} <ExampleDataBadge className="ml-2 align-middle" />
                </td>
                <td>{row.event}</td>
                <td className="text-ink-soft">{row.sourceHint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
