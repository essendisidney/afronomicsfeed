import { TableScroll } from "@/components/ui/DataTable";
import { formatValue, pointDate, sharedAxis, type RateSeries, type SeriesPoint } from "@/lib/rate-series-core";

/**
 * One or two rate series on one chart, rendered on the server. Lines are SVG stretched to the plot box (strokes
 * keep their width); axis labels and point markers are HTML positioned by percentage, so text stays readable at
 * phone width and the box has a fixed height (no layout shift). Two series share one axis when their units match;
 * otherwise the first reads off the left axis and the second off the right. The second line is dashed as well as
 * differently coloured, so the pair can be told apart without colour.
 */

type Domain = { min: number; max: number; ticks: number[] };

function niceDomain(values: number[]): Domain {
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (!Number.isFinite(min)) return { min: 0, max: 1, ticks: [0, 1] };
  if (max - min < 0.2) {
    min -= 0.25;
    max += 0.25;
  }
  const raw = (max - min) / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1000) / 1000);
  return { min: lo, max: hi, ticks };
}

const t = (d: string) => Date.parse(`${d.slice(0, 10)}T00:00:00Z`);

function tickLabel(v: number, s: RateSeries) {
  if (s.unit === "pct") return `${Number.isInteger(v) ? v : v.toFixed(v * 10 === Math.round(v * 10) ? 1 : 2)}%`;
  return String(Math.round(v));
}

export function SeriesChart({ a, b, start, label }: { a: RateSeries; b?: RateSeries | null; start: string; label: string }) {
  const pa = a.points.filter((p) => p.date >= start);
  const pb = b ? b.points.filter((p) => p.date >= start) : [];
  const shared = !b || sharedAxis(a, b);
  const da = niceDomain(shared ? [...pa, ...pb].map((p) => p.value) : pa.map((p) => p.value));
  const db = shared ? da : niceDomain(pb.map((p) => p.value));
  const dates = [...pa, ...pb].map((p) => t(p.date));
  const t0 = Math.min(...dates);
  const t1 = Math.max(...dates);
  const xPct = (d: string) => (t1 === t0 ? 50 : ((t(d) - t0) / (t1 - t0)) * 100);
  const yPct = (v: number, dom: Domain) => (1 - (v - dom.min) / Math.max(1e-9, dom.max - dom.min)) * 100;
  const path = (pts: SeriesPoint[], dom: Domain) => pts.map((p, i) => `${i ? "L" : "M"}${(xPct(p.date) * 10).toFixed(1)},${(yPct(p.value, dom) * 10).toFixed(1)}`).join("");

  // Four to six date labels, at evenly spaced times.
  const xTicks: string[] = [];
  if (Number.isFinite(t0) && t1 > t0) {
    const n = 4;
    for (let i = 0; i <= n; i++) xTicks.push(new Date(t0 + ((t1 - t0) * i) / n).toISOString().slice(0, 10));
  }
  const spanDays = (t1 - t0) / 86_400_000;
  const xFmt = (d: string) => (spanDays > 400 ? pointDate(d, "monthly") : pointDate(d, "daily", spanDays < 300));

  const lines = [
    { s: a, pts: pa, dom: da, color: "var(--series-1)", dash: undefined, side: "left" as const },
    ...(b ? [{ s: b, pts: pb, dom: db, color: "var(--series-2)", dash: "6 4", side: shared ? ("left" as const) : ("right" as const) }] : []),
  ];

  return (
    <figure className="mt-4">
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-ink-soft" aria-label="Legend">
        {lines.map((l) => (
          <li key={l.s.id} className="inline-flex items-center gap-2">
            <svg width="28" height="8" aria-hidden="true" className="shrink-0">
              <line x1="0" y1="4" x2="28" y2="4" stroke={l.color} strokeWidth="2.5" strokeDasharray={l.dash} />
            </svg>
            <span>
              <span className="font-medium text-ink">{l.s.label}</span>
              {!shared ? <span className="text-muted"> · {l.side} axis, {l.s.unitLabel}</span> : null}
              {l.pts.length < 3 ? <span className="text-muted"> · {l.pts.length} stored {l.pts.length === 1 ? "reading" : "readings"} in this window</span> : null}
            </span>
          </li>
        ))}
      </ul>
      <div className={`relative mt-3 h-64 sm:h-80`} role="img" aria-label={label}>
        <div className={`absolute bottom-7 top-2 ${shared ? "left-11 right-3" : "left-11 right-12"}`}>
          {da.ticks.map((v) => (
            <div key={`ga${v}`} className="absolute inset-x-0 border-t border-rule/70" style={{ top: `${yPct(v, da)}%` }}>
              <span className="absolute right-full mr-2 -translate-y-1/2 whitespace-nowrap text-[11px] tabular-nums text-muted">{tickLabel(v, a)}</span>
            </div>
          ))}
          {!shared && b
            ? db.ticks.map((v) => (
                <span key={`gb${v}`} className="absolute left-full ml-2 -translate-y-1/2 whitespace-nowrap text-[11px] tabular-nums text-muted" style={{ top: `${yPct(v, db)}%` }}>
                  {tickLabel(v, b)}
                </span>
              ))
            : null}
          <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
            {lines.map((l) =>
              l.pts.length > 1 ? (
                <path key={l.s.id} d={path(l.pts, l.dom)} fill="none" stroke={l.color} strokeWidth={2} strokeDasharray={l.dash} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
              ) : null,
            )}
          </svg>
          {lines.flatMap((l) =>
            (l.pts.length < 3 ? l.pts : l.pts.slice(-1)).map((p) => (
              <span
                key={`${l.s.id}-${p.date}`}
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface"
                style={{ left: `${xPct(p.date)}%`, top: `${yPct(p.value, l.dom)}%`, background: l.color }}
                title={`${l.s.short}: ${formatValue(p.value, l.s.unit)}, ${pointDate(p.date, l.s.frequency)}`}
              />
            )),
          )}
          {xTicks.map((d, i) => (
            <span
              key={d}
              className={`absolute top-full mt-1.5 whitespace-nowrap text-[11px] text-muted ${i === 0 ? "" : i === xTicks.length - 1 ? "-translate-x-full" : "-translate-x-1/2"} ${i % 2 === 1 ? "hidden sm:inline" : ""}`}
              style={{ left: `${(i / (xTicks.length - 1)) * 100}%` }}
            >
              {xFmt(d)}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}

/** The figures behind the chart, newest first, for anyone who would rather read than look. */
export function SeriesTable({ series, start, limit = 12 }: { series: RateSeries[]; start: string; limit?: number }) {
  const dates = [...new Set(series.flatMap((s) => s.points.filter((p) => p.date >= start).map((p) => p.date)))].sort().reverse().slice(0, limit);
  const lookup = series.map((s) => new Map(s.points.map((p) => [p.date, p.value])));
  const freq = series.every((s) => s.frequency === "monthly") ? "monthly" : "daily";
  return (
    <TableScroll label={`Figures: ${series.map((s) => s.short).join(" and ")}`}>
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            {series.map((s) => (
              <th key={s.id} className="text-right">
                {s.short}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map((d) => (
            <tr key={d}>
              <td className="whitespace-nowrap text-xs">{pointDate(d, freq)}</td>
              {series.map((s, i) => {
                const v = lookup[i].get(d);
                return (
                  <td key={s.id} className="text-right font-mono text-xs">
                    {v == null ? "—" : formatValue(v, s.unit, s.frequency === "auction" ? 3 : undefined)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </TableScroll>
  );
}
