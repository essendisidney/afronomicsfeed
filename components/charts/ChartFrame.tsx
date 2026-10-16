import type { ReactNode } from "react";
import { EvidenceTag, type Evidence } from "@/components/evidence/EvidenceTag";
import { ChartShare } from "@/components/share/PageShare";

/** A stable anchor for a chart, from its title, so a shared link lands on it. */
const chartId = (title: string) => `chart-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)}`;

/**
 * The house chart frame (docs/rebuild/phase-7-plan.md; RECEIPTS.md "Charts and graphics"): a title that states the
 * finding, the unit, the chart, then its source and as-of date. Every chart on the site sits in one.
 */
export function ChartFrame({ title, unit, evidence, children, note }: { title: string; unit: string; evidence: Evidence | null; children: ReactNode; note?: string }) {
  return (
    <figure id={chartId(title)} className="chart-frame scroll-mt-28 rounded-2xl border border-rule bg-surface px-4 py-4 sm:px-5">
      <figcaption className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="t-h3 text-ink text-balance">{title}</p>
          <p className="mt-0.5 text-[12px] text-muted">{unit}</p>
        </div>
        <ChartShare id={chartId(title)} title={title} />
      </figcaption>
      <div className="mt-3">{children}</div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-muted">
        <span>Source:</span>
        {evidence ? <EvidenceTag {...evidence} /> : null}
        {note ? <span>{note}</span> : null}
      </div>
    </figure>
  );
}
