import type { Point } from "@/lib/data/series";

/**
 * Single-series trend line. One hue (forest ink token), 2px line, last point
 * marked, native hover titles on every point. Scales to its container width.
 */
export function Sparkline({
  points,
  format,
  label,
  height = 36,
  className = "",
}: {
  points: Point[];
  format: (value: number) => string;
  label: string;
  height?: number;
  className?: string;
}) {
  if (points.length < 2) return null;
  const width = 120;
  const pad = 4;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const x = (index: number) => pad + (index / (points.length - 1)) * (width - pad * 2);
  const y = (value: number) => pad + (1 - (value - min) / span) * (height - pad * 2);
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(point.value).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  const first = points[0];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`${label}: ${format(first.value)} in ${first.year} to ${format(last.value)} in ${last.year}`}
      className={`block h-9 w-full overflow-visible text-forest ${className}`}
    >
      <path d={path} fill="none" stroke="currentColor" strokeWidth={2} vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((point, index) => (
        <circle key={point.year} cx={x(index)} cy={y(point.value)} r={6} fill="transparent" vectorEffect="non-scaling-stroke">
          <title>{`${point.year}: ${format(point.value)}`}</title>
        </circle>
      ))}
      <circle cx={x(points.length - 1)} cy={y(last.value)} r={2.5} fill="currentColor" className="text-gold" />
    </svg>
  );
}
