import { MIN_SPARK_POINTS, formatValue, pointDate, sparkPoints, sparkSpan, type RateSeries } from "@/lib/rate-series-core";

/**
 * A small trend line for one rate series, drawn on the server as inline SVG at a fixed size (no layout shift, no
 * script). Only the stored history: the series' latest `sparkPoints` prints. With fewer than three points it draws
 * nothing. The line is spaced by date, so a gap in the record shows as a longer segment rather than being hidden.
 */
export function Spark({ series, width = 88, height = 28, className = "" }: { series: RateSeries; width?: number; height?: number; className?: string }) {
  const pts = sparkPoints(series);
  if (pts.length < MIN_SPARK_POINTS) return null;
  const pad = 3;
  const values = pts.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const t0 = Date.parse(pts[0].date);
  const t1 = Date.parse(pts.at(-1)!.date);
  const x = (d: string) => pad + ((Date.parse(d) - t0) / Math.max(1, t1 - t0)) * (width - pad * 2);
  // A flat series sits in the middle rather than on the floor.
  const y = (v: number) => (max === min ? height / 2 : pad + (1 - (v - min) / (max - min)) * (height - pad * 2));
  const d = pts.map((p, i) => `${i ? "L" : "M"}${x(p.date).toFixed(1)},${y(p.value).toFixed(1)}`).join("");
  const first = pts[0];
  const last = pts.at(-1)!;
  const label = `${series.label}, ${sparkSpan(series, pts.length)}: ${formatValue(first.value, series.unit)} on ${pointDate(first.date, series.frequency)} to ${formatValue(last.value, series.unit)} on ${pointDate(last.date, series.frequency)}; low ${formatValue(min, series.unit)}, high ${formatValue(max, series.unit)}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} data-spark={series.id} data-points={pts.length} className={`inline-block shrink-0 overflow-visible align-middle text-forest ${className}`}>
      <title>{label}</title>
      <path d={d} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last.date)} cy={y(last.value)} r={2.5} className="fill-accent" />
    </svg>
  );
}
