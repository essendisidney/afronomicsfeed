import { EvidenceTag, type Evidence } from "./EvidenceTag";

export type TimelineEvent = {
  /** ISO date (YYYY-MM-DD) of the event. */
  date: string;
  title: string;
  detail?: string;
  /** Every event carries its source (rebuild brief, section 5). */
  evidence: Evidence;
};

const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/**
 * The one timeline used by cases and watch items (rebuild brief, section 7): dated events in order, each with its
 * evidence tag. Events are sorted by date here, so callers cannot publish them out of order.
 */
export function Timeline({ events, label }: { events: readonly TimelineEvent[]; label: string }) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <ol aria-label={label} className="relative border-l border-rule pl-5">
      {sorted.map((e, i) => (
        <li key={`${e.date}-${i}`} className="relative pb-6 last:pb-0">
          <span aria-hidden="true" className="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-paper bg-forest" />
          <time dateTime={e.date} className="tabular block text-[12px] font-semibold uppercase tracking-[0.08em] text-muted">
            {dayFmt.format(new Date(`${e.date}T00:00:00Z`))}
          </time>
          <p className="mt-1 text-[15px] font-semibold leading-6 text-ink">{e.title}</p>
          {e.detail ? <p className="mt-1 text-[14px] leading-6 text-ink-soft">{e.detail}</p> : null}
          <EvidenceTag {...e.evidence} className="mt-2" />
        </li>
      ))}
    </ol>
  );
}
