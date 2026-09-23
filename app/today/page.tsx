import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { ExampleDataBadge } from "@/components/ui/ExampleDataBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { cadence, habit } from "@/lib/cadence";
import { formatDate } from "@/lib/format";
import { getDeskLead } from "@/lib/relations";
import { site } from "@/lib/site";
import { regulatoryRows } from "@/lib/trackers";

export const metadata: Metadata = {
  title: "This morning’s file",
  description: "Eight minutes when a primary drops. Two minutes when the file is quiet.",
};

export default function TodayPage() {
  const { lead, supporting } = getDeskLead();
  const watch = regulatoryRows.slice(0, 3);
  const mustFile = lead?.urgency === "file";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Morning file"
        title="Open this. File it. Leave."
        lede={habit.promise}
      />
      {lead ? (
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
          File as of {formatDate(lead.date)} · Nairobi · not a live wire
        </p>
      ) : null}

      <section className="mt-8 border border-gold/40 bg-gold/10 px-5 py-5">
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
          Why open now
        </p>
        <p className="mt-3 text-[15px] leading-7 text-ink-soft">
          {mustFile
            ? "A brief on the file is marked File now — a primary-shaped event, not colour."
            : "No claim of a new official print overnight. Open to confirm the file is quiet, and to be ready for the next cadence."}
        </p>
        <p className="mt-3 text-sm leading-6 text-muted">{habit.whoPays}</p>
      </section>

      {lead ? (
        <section className="mt-12">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
            Lead
          </h2>
          <div className="mt-4">
            <ArticleCard article={lead} featured />
          </div>
        </section>
      ) : null}

      {supporting.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
            If you have eight minutes
          </h2>
          <div className="mt-6 space-y-10">
            {supporting.map((article) => (
              <ArticleCard key={`${article.category}-${article.slug}`} article={article} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12 border-t border-rule pt-10">
        <h2 className="font-serif text-2xl text-ink">When to come back</h2>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          Habit is cadence, not a homepage refresh. Confirm each date on the official page.
          We do not invent MPC or auction days.
        </p>
        <ul className="mt-6 space-y-5">
          {cadence.map((item) => (
            <li key={item.when} className="border-t border-rule pt-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-gold">
                {item.when}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{item.open}</p>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block font-mono text-[11px] uppercase tracking-[0.12em] text-forest hover:text-gold"
              >
                Confirm on {item.confirm} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 border-t border-rule pt-10">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
            Regulatory watch
          </h2>
          <ExampleDataBadge />
        </div>
        <ul className="mt-5 space-y-3 text-sm leading-6 text-ink-soft">
          {watch.map((row) => (
            <li key={`${row.authority}-${row.date}`}>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                {row.authority}
              </span>{" "}
              — {row.subject}
            </li>
          ))}
        </ul>
        <Link
          href="/trackers/regulatory"
          className="mt-4 inline-block font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-forest hover:text-gold"
        >
          Open tracker →
        </Link>
      </section>

      <section className="mt-12 border-t border-rule pt-10">
        <h2 className="font-serif text-2xl text-ink">Why a seat exists</h2>
        <p className="mt-3 text-sm leading-6 text-ink-soft">{habit.whoDoesNot}</p>
        <p className="mt-3 text-sm leading-6 text-ink-soft">
          Individual is for the memo: what to put in the pack after the teaser.
          KES 999/mo is cheaper than being the person who briefed the rate line
          and missed the operational paragraph.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href="/pricing"
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-forest hover:text-gold"
          >
            Why a desk pays →
          </Link>
          <a
            href={site.nseTapeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-forest"
          >
            Tape stays on NSE ↗
          </a>
        </div>
      </section>
    </div>
  );
}
