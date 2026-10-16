import Link from "next/link";
import { ShareNumberButton } from "@/components/share/ShareNumberButton";
import { site } from "@/lib/site";
import { asOfLabel } from "@/components/evidence/EvidenceTag";
import { EDITORIAL_HISTORY, editorialScore, thresholdText, type CallRow, type CallStatus } from "@/lib/editorial";

/**
 * The editorial calls on /record (docs/rebuild/receipts-r2-plan.md): every call a published Receipt made, its status,
 * and once settled the published figure with its source and quote. Its hit rate is its own, never combined with the
 * auction ranges. Overdue calls show in amber so they cannot hide.
 */

export const statusLabel: Record<CallStatus, string> = { open: "Open", due: "Due, waiting for the source", held: "Held", missed: "Missed", void: "Void" };
export const statusTone: Record<CallStatus, string> = { open: "text-muted", due: "text-warn", held: "text-up", missed: "text-down", void: "text-muted" };

export function EditorialCalls({ rows, notRecorded }: { rows: CallRow[]; notRecorded: { id: string; statement: string; reason: string }[] }) {
  const s = editorialScore(rows);
  return (
    <section id="calls" aria-labelledby="calls-h" className="mt-12 border-t border-rule pt-8">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="calls-h" className="t-h2 text-ink">
          Editorial calls
        </h2>
        <span className="flex flex-wrap gap-4 text-[14px] font-semibold">
          <a href={EDITORIAL_HISTORY} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-4">
            When each was published
          </a>
          <a href="/api/record?ledger=editorial" className="text-forest underline underline-offset-4" data-track="download_click">
            Download CSV
          </a>
        </span>
      </div>
      <p className="mt-2 max-w-3xl text-[15px] leading-6 text-ink-soft">
        The dated calls at the end of each{" "}
        <Link href="/receipts" className="underline underline-offset-2">
          Receipt
        </Link>
        , written to a public file when the Receipt is published and graded against the source each names. The grade is the published figure
        compared with the call by code. This record is kept apart from the auction ranges above: a yes-or-no call and a range are different
        kinds of forecast.
      </p>
      <p className="tabular mt-3 text-[15px] text-ink">
        {s.graded
          ? `${s.held} of ${s.graded} graded calls held (${Math.round((s.share ?? 0) * 100)}%).`
          : rows.length
            ? `No call graded yet. ${s.open} open${s.nextDue ? `, the first due ${asOfLabel(s.nextDue)}` : ""}.`
            : "No calls on the record yet: they are written when the first Receipt is published."}
        {s.due ? ` ${s.due} due and waiting for the source.` : ""}
      </p>
      {rows.length ? (
        <ol className="mt-4 divide-y divide-rule border-y border-rule">
          {rows.map((r) => (
            <li key={r.id} id={r.id} className="grid gap-1.5 py-4 sm:grid-cols-[1fr_auto] sm:gap-6">
              <div>
                <p className="text-[15px] leading-6 text-ink">{r.statement}</p>
                <p className="mt-1 text-[12.5px] text-muted">
                  {r.measure}, {thresholdText(r)} · settled by {r.check_source}, {asOfLabel(r.check_date)} · from{" "}
                  <Link href={`/receipts/${r.receipt}`} className="underline underline-offset-2">
                    this Receipt
                  </Link>
                  , written {r.written_at.replace("T", " ").slice(0, 16)} UTC
                </p>
                {r.outcome ? (
                  <p className="mt-1 text-[13px] text-ink-soft">
                    Published figure: <span className="tabular font-semibold text-ink">{String(r.outcome.value)}</span> &ldquo;{r.outcome.quote}&rdquo;{" "}
                    <a href={r.outcome.source_url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                      Source
                    </a>
                  </p>
                ) : null}
              </div>
              <div className="flex items-start gap-1 sm:flex-col sm:items-end">
                <p className={`t-label sm:pt-1 ${statusTone[r.status]}`}>{statusLabel[r.status]}</p>
                <ShareNumberButton
                  url={`${site.url}/record#${r.id}`}
                  text={`${r.statement} Due ${asOfLabel(r.check_date)}, settled by ${r.check_source}.`}
                  label={r.statement}
                  campaign="call"
                  what="this call"
                  placement="inline"
                  className="-mt-2.5 ml-auto sm:mt-0"
                />
              </div>
            </li>
          ))}
        </ol>
      ) : null}
      {notRecorded.length ? (
        <div className="mt-4 text-[13px] text-muted">
          <p>Not on the record, because the Receipt was published after the call&rsquo;s date (no credit for hindsight):</p>
          <ul className="mt-1 list-disc pl-5">
            {notRecorded.map((n) => (
              <li key={n.id}>
                {n.statement} ({n.reason})
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
