import { SectionTitle } from "@/components/data/parts";
import { HealthList } from "@/components/data/HealthList";
import type { Health } from "@/lib/data/health";
import { hoursText, type Latency } from "@/lib/data/latency";

/** Data health, routines and founder decisions: the bottom of the morning desk. */

export type Freshness = { name: string; value: string; stale: boolean; note?: string };

export function HealthPanel({ health, latency, freshness }: { health: Health | null; latency: Latency | null; freshness: Freshness[] }) {
  const attention = (health?.items ?? []).filter((x) => x.status === "late" || x.status === "failed");
  const s = health?.summary;
  const stale = freshness.filter((f) => f.stale);
  const timed = latency?.summary.filter((m) => m.p50_h != null) ?? [];
  return (
    <section id="health" className="scroll-mt-20">
      <SectionTitle
        kicker={`Data health${health ? ` · checked ${health.checked_on}` : ""}`}
        title={s ? `${s.failed} not read, ${s.late} late, ${s.ok} up to date` : "No health check found"}
        note="From data/health.json (the check after each data run; public at /status) and the latest file per market."
      />
      <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
        <span className="rounded-full border border-rule px-3 py-1">
          Publication latency:{" "}
          {latency?.overall.p50_h != null ? (
            <strong>
              p50 {hoursText(latency.overall.p50_h)}
              {latency.overall.p90_h != null ? `, p90 ${hoursText(latency.overall.p90_h)}` : ""}
            </strong>
          ) : (
            <span className="text-muted">{latency ? `not enough timed results yet (${latency.overall.timed} of ${latency.min_results} needed per market)` : "not measured yet (data/latency.json not written)"}</span>
          )}
        </span>
        {s?.gap ? <span className="rounded-full border border-rule px-3 py-1">{s.gap} known gap{s.gap === 1 ? "" : "s"}</span> : null}
        <span className={`rounded-full border px-3 py-1 ${stale.length ? "border-down/40 text-down" : "border-rule"}`}>
          {stale.length ? `Stale feeds: ${stale.map((f) => f.name).join(", ")}` : "Every feed within its normal cycle"}
        </span>
      </div>
      {timed.length ? (
        <p className="mt-2 text-[12px] text-muted">
          p50 by market: {timed.slice(0, 8).map((m) => `${m.name} ${hoursText(m.p50_h!)}`).join(" · ")}
        </p>
      ) : null}
      {attention.length ? (
        <div className="mt-4">
          <HealthList items={attention} label="Figures late or not read" />
        </div>
      ) : null}
      {health?.workflows?.some((w) => w.failures_in_row) ? (
        <ul className="mt-4 space-y-1 text-[13px]" aria-label="Workflows failing">
          {health.workflows
            .filter((w) => w.failures_in_row)
            .map((w) => (
              <li key={w.name} className={w.failures_in_row >= 2 ? "text-down" : "text-ink-soft"}>
                <strong>{w.name}</strong>: {w.failures_in_row} failed run{w.failures_in_row === 1 ? "" : "s"} in a row, last {w.day}
              </li>
            ))}
        </ul>
      ) : null}
      <details className="mt-3">
        <summary className="cursor-pointer text-[13px] font-semibold text-muted">Feed freshness, every market</summary>
        <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-4 lg:grid-cols-6">
          {freshness.map((f) => (
            <div key={f.name} className="bg-surface px-3 py-2">
              <p className="text-[11px] text-muted">{f.name}</p>
              <p className={`font-serif text-lg ${f.stale ? "text-down" : "text-ink"}`}>{f.value}</p>
              {f.note ? <p className="text-[10px] text-muted">{f.note}</p> : null}
            </div>
          ))}
        </div>
      </details>
    </section>
  );
}
