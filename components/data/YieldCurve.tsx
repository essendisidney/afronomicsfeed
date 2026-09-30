import type { CurvePoint } from "@/lib/data/kenya-bonds";

/**
 * Auction yield curve: rate against years to maturity. Bills and bonds are one series (one hue);
 * bills are hollow markers so the two are told apart by shape, not colour. Native hover titles per point.
 */
export function YieldCurve({ points, height = 300 }: { points: CurvePoint[]; height?: number }) {
  if (points.length < 2) return null;
  const width = 820;
  const pad = { top: 16, right: 24, bottom: 34, left: 44 };
  const maxYears = Math.ceil(Math.max(...points.map((p) => p.years)) / 5) * 5;
  const rates = points.map((p) => p.rate);
  const minRate = Math.floor(Math.min(...rates) - 0.5);
  const maxRate = Math.ceil(Math.max(...rates) + 0.5);
  const x = (years: number) => pad.left + (years / maxYears) * (width - pad.left - pad.right);
  const y = (rate: number) => pad.top + (1 - (rate - minRate) / Math.max(1, maxRate - minRate)) * (height - pad.top - pad.bottom);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.years).toFixed(1)},${y(p.rate).toFixed(1)}`).join(" ");
  const yTicks: number[] = [];
  for (let v = minRate; v <= maxRate; v += 1) yTicks.push(v);
  const xTicks: number[] = [];
  for (let v = 0; v <= maxYears; v += 5) xTicks.push(v);
  const labelled = new Set([points[0], points[points.length - 1], points.reduce((a, b) => (b.rate > a.rate ? b : a))]);

  return (
    <figure>
      <div className="mb-2 flex flex-wrap gap-x-5 text-xs text-ink-soft" aria-hidden>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: "var(--series-1)" }} />
          Treasury bills
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--series-1)" }} />
          Treasury bonds (latest auction, last 12 months)
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" role="img" aria-label="Kenya government auction yield curve">
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={pad.left} x2={width - pad.right} y1={y(v)} y2={y(v)} stroke="var(--rule)" />
            <text x={pad.left - 8} y={y(v) + 4} textAnchor="end" className="fill-muted font-mono text-[10px]">
              {v}%
            </text>
          </g>
        ))}
        {xTicks.map((v) => (
          <text key={v} x={x(v)} y={height - 14} textAnchor="middle" className="fill-muted font-mono text-[10px]">
            {v}y
          </text>
        ))}
        <text x={width - pad.right} y={height - 2} textAnchor="end" className="fill-muted text-[10px]">
          years to maturity
        </text>
        <path d={path} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" />
        {points.map((p) => (
          <g key={`${p.label}-${p.date}`}>
            <circle
              cx={x(p.years)}
              cy={y(p.rate)}
              r={4.5}
              fill={p.kind === "T-bill" ? "var(--paper)" : "var(--series-1)"}
              stroke="var(--series-1)"
              strokeWidth={2}
            />
            <circle cx={x(p.years)} cy={y(p.rate)} r={10} fill="transparent">
              <title>{`${p.label} · ${p.rate.toFixed(3)}% · ${p.years.toFixed(1)} years to maturity · auction ${p.date}`}</title>
            </circle>
            {labelled.has(p) ? (
              <text x={x(p.years) + 7} y={y(p.rate) - 8} className="fill-ink text-[11px]">
                {p.label} {p.rate.toFixed(2)}%
              </text>
            ) : null}
          </g>
        ))}
      </svg>
    </figure>
  );
}
