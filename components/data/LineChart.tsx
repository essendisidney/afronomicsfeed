"use client";

import { useMemo, useRef, useState } from "react";

export type ChartSeries = { key: string; label: string; color: string };
export type ChartRow = { date: string; values: Record<string, number | null> };

/**
 * Multi-series line chart on one y-axis. 2px lines, recessive grid, direct end labels plus a legend,
 * crosshair tooltip on hover or touch. Colours come from the validated --series-N tokens.
 */
export function LineChart({
  rows,
  series,
  unit = "%",
  height = 300,
  label,
}: {
  rows: ChartRow[]; // ascending by date
  series: ChartSeries[];
  unit?: string;
  height?: number;
  label: string;
}) {
  const width = 820;
  const pad = { top: 16, right: 88, bottom: 28, left: 44 };
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { x, y, ticks, years, paths, last } = useMemo(() => {
    const times = rows.map((row) => new Date(row.date).getTime());
    const all = rows.flatMap((row) => series.map((s) => row.values[s.key]).filter((v): v is number => v != null));
    const min = Math.floor(Math.min(...all));
    const max = Math.ceil(Math.max(...all));
    const t0 = times[0] ?? 0;
    const t1 = times[times.length - 1] ?? 1;
    const xf = (i: number) => pad.left + ((times[i] - t0) / Math.max(1, t1 - t0)) * (width - pad.left - pad.right);
    const yf = (v: number) => pad.top + (1 - (v - min) / Math.max(1, max - min)) * (height - pad.top - pad.bottom);
    const step = Math.max(1, Math.ceil((max - min) / 5));
    const tickValues: number[] = [];
    for (let v = min; v <= max; v += step) tickValues.push(v);
    const yearTicks: Array<{ i: number; year: number }> = [];
    let prev = -1;
    rows.forEach((row, i) => {
      const year = Number(row.date.slice(0, 4));
      if (year !== prev) {
        yearTicks.push({ i, year });
        prev = year;
      }
    });
    const everyN = Math.ceil(yearTicks.length / 9);
    const pathFor = (key: string) => {
      let d = "";
      let pen = false;
      rows.forEach((row, i) => {
        const v = row.values[key];
        if (v == null) {
          pen = false;
          return;
        }
        d += `${pen ? "L" : "M"}${xf(i).toFixed(1)},${yf(v).toFixed(1)}`;
        pen = true;
      });
      return d;
    };
    const lastPoint = (key: string) => {
      for (let i = rows.length - 1; i >= 0; i -= 1) {
        const v = rows[i].values[key];
        if (v != null) return { i, v };
      }
      return null;
    };
    return {
      x: xf,
      y: yf,
      ticks: tickValues,
      years: yearTicks.filter((_, k) => k % everyN === 0),
      paths: Object.fromEntries(series.map((s) => [s.key, pathFor(s.key)])),
      last: Object.fromEntries(series.map((s) => [s.key, lastPoint(s.key)])),
    };
  }, [rows, series, height, pad.bottom, pad.left, pad.right, pad.top]);

  // Keep end labels from colliding: spread them at least 14px apart.
  const endLabels = series
    .map((s) => ({ s, p: last[s.key] }))
    .filter((item): item is { s: ChartSeries; p: { i: number; v: number } } => item.p != null)
    .map((item) => ({ ...item, ly: y(item.p.v) }))
    .sort((a, b) => a.ly - b.ly);
  for (let k = 1; k < endLabels.length; k += 1) {
    if (endLabels[k].ly - endLabels[k - 1].ly < 14) endLabels[k].ly = endLabels[k - 1].ly + 14;
  }

  function onMove(event: React.PointerEvent<SVGSVGElement>) {
    const svg = ref.current;
    if (!svg || rows.length === 0) return;
    const box = svg.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * width;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < rows.length; i += 1) {
      const dist = Math.abs(x(i) - px);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    setHover(best);
  }

  const active = hover != null ? rows[hover] : null;
  const fmt = (v: number) => `${v.toFixed(2)}${unit}`;

  return (
    <figure className="relative">
      <div className="mb-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft" aria-hidden>
        {series.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-0.5 w-4 rounded" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
      <svg
        ref={ref}
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full touch-pan-y select-none"
        role="img"
        aria-label={label}
        onPointerMove={onMove}
        onPointerDown={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line x1={pad.left} x2={width - pad.right} y1={y(v)} y2={y(v)} stroke="var(--rule)" strokeWidth={1} />
            <text x={pad.left - 8} y={y(v) + 4} textAnchor="end" className="fill-muted font-mono text-[10px]">
              {v}
              {unit}
            </text>
          </g>
        ))}
        {years.map(({ i, year }) => (
          <text key={year} x={x(i)} y={height - 8} textAnchor="middle" className="fill-muted font-mono text-[10px]">
            {year}
          </text>
        ))}
        {series.map((s) => (
          <path key={s.key} d={paths[s.key]} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {endLabels.map(({ s, p, ly }) => (
          <g key={s.key}>
            <circle cx={x(p.i)} cy={y(p.v)} r={3} fill={s.color} stroke="var(--paper)" strokeWidth={2} />
            <text x={x(p.i) + 8} y={ly + 4} className="fill-ink text-[11px]">
              {s.label.replace("-day", "d")} {fmt(p.v)}
            </text>
          </g>
        ))}
        {active && hover != null ? (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={height - pad.bottom} stroke="var(--muted)" strokeWidth={1} />
            {series.map((s) => {
              const v = active.values[s.key];
              return v == null ? null : <circle key={s.key} cx={x(hover)} cy={y(v)} r={4} fill={s.color} stroke="var(--paper)" strokeWidth={2} />;
            })}
          </g>
        ) : null}
      </svg>
      {active && hover != null ? (
        <div
          className="pointer-events-none absolute top-8 z-10 min-w-40 border border-rule bg-paper px-3 py-2 text-xs shadow-sm"
          style={{ left: `${Math.min(78, Math.max(2, (x(hover) / width) * 100))}%` }}
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted">{active.date}</p>
          {series.map((s) => {
            const v = active.values[s.key];
            return (
              <p key={s.key} className="mt-1 flex items-center justify-between gap-4 text-ink">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="font-mono">{v == null ? "—" : fmt(v)}</span>
              </p>
            );
          })}
        </div>
      ) : null}
    </figure>
  );
}
