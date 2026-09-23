import type { Metadata } from "next";
import Link from "next/link";
import { ExampleDataBadge } from "@/components/ui/ExampleDataBadge";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = {
  title: "Trackers",
  description: "Structured Kenya regulation, bank-filing, and debt calendar stubs — example data only.",
};

const trackers = [
  {
    href: "/trackers/regulatory",
    title: "Regulatory tracker",
    body: "CBK, CMA, SASRA, and IRA instruments — date, type, subject, status.",
  },
  {
    href: "/trackers/banks",
    title: "Bank forensic index",
    body: "Listed-bank filing index. Ratios stay empty until copied from a cited statement.",
  },
  {
    href: "/trackers/debt",
    title: "Debt & rates calendar",
    body: "Auction-week scaffolding. Official notices live on the CBK bills-and-bonds pages.",
  },
];

export default function TrackersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Trackers"
        title="Structured files for a desk, not a feed"
        lede="These tables are product stubs. Every row is illustrative and marked EXAMPLE DATA. They are not a live regulatory docket and not a substitute for official calendars."
      />
      <div className="mt-6">
        <ExampleDataBadge />
      </div>
      <ul className="mt-10 space-y-4">
        {trackers.map((tracker) => (
          <li key={tracker.href}>
            <Link href={tracker.href} className="block border border-rule px-5 py-5 hover:border-gold">
              <h2 className="font-serif text-2xl text-ink">{tracker.title}</h2>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{tracker.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
