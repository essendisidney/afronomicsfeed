import type { BondRow } from "@/lib/data/sovereign-bonds";
import { bucketOf, buckets, type Bucket } from "./stats";

/**
 * Every auction result as a dot, coloured by tenor bucket, with each bucket's monthly median drawn as a 2px line.
 * Dependency-free server SVG in the site's chart style (recessive grid, mono axis labels, --series-N hues).
 * Renders a narrow variant for phones so axis text stays legible.
 */
export function AuctionRateChart({ rows, label }: { rows: BondRow[]; label: string }) {
  const points = rows
    .map((r) => ({ t: Date.parse(`${r.date}T12:00:00Z`), rate: r.rate, bucket: bucketOf(r.tenor_years), date: r.date }))
    .filter((p): p is { t: number; rate: number; bucket: Bucket["key"]; date: string } => p.bucket != null && Number.isFinite(p.t));
  const present = buckets.filter((b) => points.some((p) => p.bucket === b.key));
  const counts = Object.fromEntries(present.map((b) => [b.key, points.filter((p) => p.bucket === b.key).length]));
  const undated = rows.length - points.length;

  if (!points.length) return <p className="text-sm text-muted">No results with a tenor to chart.</p>;

  return (
    <figure>
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-ink-soft">
        {present.map((b) => (
          <span key={b.key} className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: b.color }} />
            {b.label}
            <span className="font-mono text-[11px] text-muted">({counts[b.key].toLocaleString("en-US")})</span>
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-muted">
          <span className="inline-block h-0.5 w-4 rounded bg-ink-soft" />
          monthly median
        </span>
      </div>
      <div className="hidden sm:block">
        <Plot points={points} present={present} width={820} height={340} label={label} />
      </div>
      <div className="sm:hidden">
        <Plot points={points} present={present} width={360} height={280} label={label} />
      </div>
      {undated > 0 ? (
        <figcaption className="mt-2 text-xs text-muted">
          {undated.toLocaleString("en-US")} result{undated === 1 ? "" : "s"} without a stated tenor are in the table but not the chart.
        </figcaption>
      ) : null}
    </figure>
  );
}

type Point = { t: number; rate: number; bucket: Bucket["key"]; date: string };

function niceStep(span: number, target: number) {
  const raw = span / Math.max(1, target);
  const pow = 10 ** Math.floor(Math.log10(raw));
  const m = raw / pow;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * pow;
}

function Plot({ points, present, width, height, label }: { points: Point[]; present: Bucket[]; width: number; height: number; label: string }) {
  const narrow = width < 500;
  const pad = { top: 12, right: narrow ? 10 : 16, bottom: 26, left: narrow ? 34 : 42 };
  const t0 = Math.min(...points.map((p) => p.t));
  const t1 = Math.max(...points.map((p) => p.t));
  const lo = Math.min(...points.map((p) => p.rate));
  const hi = Math.max(...points.map((p) => p.rate));
  const step = niceStep(hi - lo || 1, narrow ? 4 : 6);
  const min = Math.floor(lo / step) * step;
  const max = Math.ceil(hi / step) * step === min ? min + step : Math.ceil(hi / step) * step;
  const x = (t: number) => pad.left + ((t - t0) / Math.max(1, t1 - t0)) * (width - pad.left - pad.right);
  const y = (v: number) => pad.top + (1 - (v - min) / (max - min)) * (height - pad.top - pad.bottom);

  const ticks: number[] = [];
  for (let v = min; v <= max + step / 2; v += step) ticks.push(Math.round(v * 100) / 100);

  const y0 = new Date(t0).getUTCFullYear();
  const y1 = new Date(t1).getUTCFullYear();
  const spanYears = y1 - y0 + 1;
  const yearsEvery = Math.max(1, Math.ceil(spanYears / (narrow ? 4 : 9)));
  const years: number[] = [];
  for (let yr = y0; yr <= y1 + 1; yr += 1) {
    const t = Date.UTC(yr, 0, 1);
    if (t >= t0 && t <= t1 && (yr - y0) % yearsEvery === 0) years.push(yr);
  }
  // Short histories (under two calendar years) get month ticks instead of year ticks.
  const monthTicks: { t: number; text: string }[] = [];
  if (years.length < 2) {
    const fmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" });
    const start = new Date(t0);
    const months = Math.round((t1 - t0) / (30.44 * 864e5));
    const every = Math.max(1, Math.ceil(months / (narrow ? 4 : 8)));
    for (let k = 1; ; k += every) {
      const t = Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + k, 1);
      if (t > t1) break;
      monthTicks.push({ t, text: fmt.format(new Date(t)) });
    }
  }

  const medianPath = (key: Bucket["key"]) => {
    const byMonth = new Map<string, number[]>();
    for (const p of points) if (p.bucket === key) byMonth.set(p.date.slice(0, 7), [...(byMonth.get(p.date.slice(0, 7)) ?? []), p.rate]);
    const months = [...byMonth.entries()].sort(([a], [b]) => a.localeCompare(b));
    let d = "";
    let prev: number | null = null;
    for (const [m, rates] of months) {
      const v = [...rates].sort((a, b) => a - b);
      const mid = Math.floor(v.length / 2);
      const med = v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
      const t = Date.UTC(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1, 15);
      const gap = prev != null && t - prev > 190 * 864e5; // lift the pen across gaps of six months or more
      d += `${d && !gap ? "L" : "M"}${x(Math.min(Math.max(t, t0), t1)).toFixed(1)},${y(med).toFixed(1)}`;
      prev = t;
    }
    return d;
  };

  const r = narrow ? 1.8 : 2.4;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" role="img" aria-label={label}>
      {ticks.map((v) => (
        <g key={v}>
          <line x1={pad.left} x2={width - pad.right} y1={y(v)} y2={y(v)} stroke="var(--rule)" strokeWidth={1} />
          <text x={pad.left - 6} y={y(v) + 3.5} textAnchor="end" className="fill-muted font-mono text-[10px]">
            {Number.isInteger(v) ? v : v.toFixed(1)}%
          </text>
        </g>
      ))}
      {(monthTicks.length ? [] : years).map((yr) => (
        <text key={yr} x={x(Date.UTC(yr, 0, 1))} y={height - 8} textAnchor="middle" className="fill-muted font-mono text-[10px]">
          {yr}
        </text>
      ))}
      {monthTicks.map((m) => (
        <text key={m.t} x={x(m.t)} y={height - 8} textAnchor="middle" className="fill-muted font-mono text-[10px]">
          {m.text}
        </text>
      ))}
      {present.map((b) => (
        <g key={b.key} fill={b.color} fillOpacity={0.4}>
          {points
            .filter((p) => p.bucket === b.key)
            .map((p, i) => (
              <circle key={i} cx={x(p.t).toFixed(1)} cy={y(p.rate).toFixed(1)} r={r} />
            ))}
        </g>
      ))}
      {present.map((b) => (
        <path key={b.key} d={medianPath(b.key)} fill="none" stroke={b.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      ))}
    </svg>
  );
}
