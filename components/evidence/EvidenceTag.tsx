/**
 * The evidence tag (rebuild brief, section 7): the small label beside a figure that names its source and the date
 * the figure is as of. Tapping it opens the source. Every figure on Today, the hubs and the Desk pages carries one;
 * a figure without a source and a date is not shown.
 */

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** "9 Oct 2026" from an ISO date or date-time; the input unchanged if it is not a date. */
export function asOfLabel(asOf: string) {
  const d = new Date(asOf.length === 10 ? `${asOf}T00:00:00Z` : asOf);
  return Number.isNaN(d.getTime()) ? asOf : dateFmt.format(d);
}

export type Evidence = { source: string; href: string; asOf: string };

export function EvidenceTag({ source, href, asOf, className = "" }: Evidence & { className?: string }) {
  const date = asOfLabel(asOf);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-track="source_click"
      aria-label={`Source: ${source}, as of ${date} (opens the source)`}
      className={`evidence-tag inline-flex min-h-6 max-w-full items-center gap-1 rounded-md border border-rule bg-surface px-1.5 align-middle text-[11px] leading-none text-muted no-underline hover:border-forest hover:text-ink ${className}`}
    >
      <svg aria-hidden="true" viewBox="0 0 12 12" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M3 1.5h4l2 2v7H3z" />
        <path d="M4.5 6h3M4.5 8h3" />
      </svg>
      <span className="truncate">{source}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={asOf} className="tabular shrink-0">
        {date}
      </time>
    </a>
  );
}
