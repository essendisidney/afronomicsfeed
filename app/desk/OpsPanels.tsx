import { SectionTitle } from "@/components/data/parts";
import { HealthList } from "@/components/data/HealthList";
import { Badge } from "@/components/ui/Badge";
import type { Health } from "@/lib/data/health";
import { hoursText, type Latency } from "@/lib/data/latency";
import { FOUNDER_DECISIONS, REFERENCE_UPDATED, ROUTINES } from "@/lib/desk/reference";

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

export function RoutinesPanel() {
  return (
    <section id="routines" className="scroll-mt-20">
      <SectionTitle
        kicker={`Routines · reference of ${REFERENCE_UPDATED}`}
        title="What runs on its own"
        note="Times are Nairobi. This is the schedule, not live status: the site cannot see the Claude routines or GitHub Actions runs. Check the routine list in Claude and the Actions tab on GitHub."
      />
      <ul className="mt-2 divide-y divide-rule">
        {ROUTINES.map((r) => (
          <li key={r.name} className="grid gap-x-4 py-2 text-sm sm:grid-cols-[minmax(0,14rem)_minmax(0,12rem)_1fr]">
            <span className="font-medium text-ink">{r.name}</span>
            <span className="text-[12px] text-ink-soft">{r.when}</span>
            <span className="text-[12px] text-muted">
              {r.does} · {r.where}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function DecisionsPanel() {
  const open = FOUNDER_DECISIONS.filter((d) => d.status === "open");
  return (
    <section id="decisions" className="scroll-mt-20">
      <SectionTitle
        kicker={`Decisions · reference of ${REFERENCE_UPDATED}`}
        title={`${open.length} decisions wait on you`}
        note="F1–F11 from master-plan-v2 §7 and partners-and-revenue §3.4; A1–A4 from the sales operator. Record each answer in docs/strategy/decision-log.md."
      />
      <ul className="mt-2 divide-y divide-rule">
        {[...open, ...FOUNDER_DECISIONS.filter((d) => d.status !== "open")].map((d) => (
          <li key={d.id} className={`flex gap-3 py-2 ${d.status === "open" ? "" : "opacity-70"}`}>
            <span className="w-8 shrink-0 font-mono text-[12px] text-muted">{d.id}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink">
                {d.ask} <Badge tone={d.status === "open" ? "warn" : d.status === "decided" ? "up" : "neutral"}>{d.status}</Badge>
              </p>
              <p className="text-[12px] text-muted">
                {d.note} · {d.source}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
