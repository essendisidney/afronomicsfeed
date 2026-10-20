import { AddIdea } from "./DeskActions";
import type { Lane, Light } from "./cockpit-core";

/**
 * The four lanes of the desk (docs/rebuild/phase-7b-plan.md, 7b-1), each with a light, the reason for it, three numbers
 * and the next action, linking down to the full panel. Their lights head the first screen (Glance.tsx).
 */

const LIGHT: Record<Light, { dot: string; ring: string; label: string }> = {
  green: { dot: "bg-up", ring: "border-up/30", label: "On track" },
  amber: { dot: "bg-warn", ring: "border-warn/40", label: "Watch" },
  red: { dot: "bg-down", ring: "border-down/50", label: "Act today" },
};

export function Cockpit({ lanes }: { lanes: Lane[] }) {
  return (
    <section id="lanes" aria-labelledby="cockpit-h" className="scroll-mt-20">
      <h2 id="cockpit-h" className="sr-only">
        The four lanes
      </h2>

      <div className="grid gap-4 lg:grid-cols-2">
        {lanes.map((l) => (
          <article key={l.id} id={`lane-${l.id}`} className={`scroll-mt-20 rounded-2xl border bg-surface px-5 py-5 ${LIGHT[l.light].ring}`}>
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="t-label flex items-center gap-2 text-muted">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${LIGHT[l.light].dot}`} />
                  {LIGHT[l.light].label}
                </p>
                <h3 className="t-h3 mt-1 text-ink">{l.title}</h3>
                <p className="mt-0.5 text-[14px] text-ink-soft">{l.why}</p>
              </div>
              <a href={l.href} className="inline-flex min-h-11 shrink-0 items-center text-[13px] font-semibold text-forest underline underline-offset-2">
                Details
              </a>
            </header>
            <dl className="mt-4 grid grid-cols-3 gap-3">
              {l.figures.map((f) => (
                <div key={f.label} className="min-w-0">
                  <dt className="text-[12px] leading-4 text-muted">{f.label}</dt>
                  <dd className="mt-1 truncate font-serif text-2xl tabular-nums text-ink">{f.value}</dd>
                  {f.note ? <dd className="mt-0.5 text-[11px] leading-4 text-muted">{f.note}</dd> : null}
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-rule pt-3 text-[14px] text-ink">
              <span className="font-semibold">Next: </span>
              {l.next}
            </p>
            {l.id === "content" ? (
              <div className="mt-4">
                <AddIdea />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
