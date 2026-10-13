import { SectionTitle } from "@/components/data/parts";
import { Badge } from "@/components/ui/Badge";
import { DealEdit, DealMove, SaveDeal } from "./DeskActions";
import { escalation, type DealRow } from "./today-core";

/**
 * Deals by stage, one column each: what is next and when, a one-click move to the next stage, and an edit with a
 * dated note (af_deal_save). On a phone the columns stack; lost deals stay folded away.
 */

const COLUMNS = ["prospect", "contacted", "qualified", "pilot", "proposal", "won"] as const;
/** Cards shown per column before "N more": the soonest next steps. */
const SHOWN = 4;
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function DealCard({ d, today }: { d: DealRow; today: string }) {
  const esc = escalation(d);
  const due = d.next_date && d.stage !== "won" ? (d.next_date < today ? "down" : d.next_date === today ? "warn" : null) : null;
  return (
    <li className="rounded-xl border border-rule bg-surface px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-sm font-semibold text-ink [overflow-wrap:anywhere]">{d.organisation}</p>
        <span className="shrink-0 text-[11px] text-muted">#{d.id}</span>
      </div>
      <p className="text-[11px] text-muted">
        {d.product.replace(/_/g, " ")} · {d.segment.replace(/_/g, " ")}
        {d.value_usd_month ? ` · est. ${usd(d.value_usd_month)}/mo` : ""}
        {d.signed_at ? ` · signed ${d.signed_at}` : ""}
      </p>
      {esc ? (
        <p className="mt-1 text-[12px] text-down [overflow-wrap:anywhere]">
          <Badge tone="down">Escalation</Badge> {esc}
        </p>
      ) : null}
      {d.stage !== "won" && d.stage !== "lost" ? (
        <p className="mt-1 text-[12px] text-ink-soft [overflow-wrap:anywhere]">
          {d.next_date ? <span className={`font-mono ${due === "down" ? "text-down" : due === "warn" ? "text-opinion" : "text-muted"}`}>{d.next_date}</span> : <span className="text-down">no date</span>}
          {esc === d.next_step ? null : (
            <>
              {" · "}
              {d.next_step ?? <span className="text-muted">no next step</span>}
            </>
          )}
        </p>
      ) : null}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <DealMove id={d.id} stage={d.stage} />
        <DealEdit id={d.id} stage={d.stage} />
      </div>
    </li>
  );
}

export function PipelineBoard({ deals, today }: { deals: DealRow[]; today: string }) {
  const lost = deals.filter((d) => d.stage === "lost");
  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const sortByDate = (a: DealRow, b: DealRow) => (a.next_date ?? "9999").localeCompare(b.next_date ?? "9999");
  return (
    <section id="pipeline" className="scroll-mt-20">
      <SectionTitle
        kicker="Pipeline"
        title={`${open.length} open deal${open.length === 1 ? "" : "s"}`}
        note="Soonest next step first in each column. A red date is overdue. “Won” needs the signing date. Values are estimates, not revenue."
      />
      {deals.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {COLUMNS.map((s) => {
            const rows = deals.filter((d) => d.stage === s).sort(sortByDate);
            return (
              <div key={s} className="min-w-0 rounded-2xl bg-paper-2 p-2">
                <p className="flex items-baseline justify-between px-1 pb-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
                  <span>{s === "won" ? "won (signed)" : s}</span>
                  <span className="tabular-nums">{rows.length}</span>
                </p>
                {rows.length ? (
                  <>
                    <ul className="space-y-2">
                      {rows.slice(0, SHOWN).map((d) => (
                        <DealCard key={d.id} d={d} today={today} />
                      ))}
                    </ul>
                    {rows.length > SHOWN ? (
                      <details className="mt-2">
                        <summary className="cursor-pointer px-1 text-[12px] font-semibold text-forest">{rows.length - SHOWN} more</summary>
                        <ul className="mt-2 space-y-2">
                          {rows.slice(SHOWN).map((d) => (
                            <DealCard key={d.id} d={d} today={today} />
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </>
                ) : (
                  <p className="px-1 pb-2 text-[12px] text-muted">None</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">No deals logged yet. Add the first below.</p>
      )}
      {lost.length ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-[13px] font-semibold text-muted">Lost ({lost.length})</summary>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lost.map((d) => (
              <DealCard key={d.id} d={d} today={today} />
            ))}
          </ul>
        </details>
      ) : null}
      <details className="mt-4 rounded-2xl border border-rule bg-surface px-4 py-3">
        <summary className="cursor-pointer text-[14px] font-semibold text-ink">New deal, or update any field of a deal</summary>
        <div className="mt-3">
          <SaveDeal />
        </div>
      </details>
    </section>
  );
}
