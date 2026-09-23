import type { Metadata } from "next";
import Link from "next/link";
import { ExampleDataBadge } from "@/components/ui/ExampleDataBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import { regulatoryRows } from "@/lib/trackers";

export const metadata: Metadata = {
  title: "Regulatory tracker",
  description: "Example-data stub of Kenya financial-regulation instruments.",
};

const authorities = ["CBK", "CMA", "SASRA", "IRA"] as const;

export default async function RegulatoryTrackerPage({
  searchParams,
}: {
  searchParams: Promise<{ authority?: string }>;
}) {
  const { authority: raw } = await searchParams;
  const authority = authorities.find((item) => item === raw);
  const rows = authority ? regulatoryRows.filter((row) => row.authority === authority) : regulatoryRows;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Trackers"
        title="Regulatory tracker"
        lede="Illustrative rows only. Confirm every instrument on the regulator’s own site before you file it."
      />
      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <ExampleDataBadge />
        <a href={site.cbkUrl} className="text-forest underline underline-offset-4" target="_blank" rel="noopener noreferrer">
          CBK
        </a>
        <a href={site.cmaUrl} className="text-forest underline underline-offset-4" target="_blank" rel="noopener noreferrer">
          CMA
        </a>
        <a href={site.sasraUrl} className="text-forest underline underline-offset-4" target="_blank" rel="noopener noreferrer">
          SASRA
        </a>
        <a href={site.iraUrl} className="text-forest underline underline-offset-4" target="_blank" rel="noopener noreferrer">
          IRA
        </a>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/trackers/regulatory"
          className={`px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] ${
            !authority ? "bg-forest text-paper" : "border border-rule text-ink-soft"
          }`}
        >
          All
        </Link>
        {authorities.map((item) => (
          <Link
            key={item}
            href={`/trackers/regulatory?authority=${item}`}
            className={`px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] ${
              authority === item ? "bg-forest text-paper" : "border border-rule text-ink-soft"
            }`}
          >
            {item}
          </Link>
        ))}
      </div>
      <div className="mt-10 overflow-x-auto">
        <table className="data-table min-w-[720px]">
          <thead>
            <tr>
              <th>Date</th>
              <th>Authority</th>
              <th>Instrument</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.authority}-${row.date}-${row.subject}`}>
                <td className="whitespace-nowrap font-mono text-xs">{formatDate(row.date)}</td>
                <td>
                  <Link href={`/institutions/${row.authority.toLowerCase()}`} className="text-forest hover:text-gold">
                    {row.authority}
                  </Link>
                </td>
                <td>{row.instrument}</td>
                <td>
                  {row.subject} <ExampleDataBadge className="ml-2 align-middle" />
                </td>
                <td>{row.status}</td>
                <td>
                  <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-4">
                    Primary
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
