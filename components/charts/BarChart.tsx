/**
 * Column chart drawn on the server from the data, never by a model. Values sit on the bars (no legend), the axis
 * starts at zero so no bar overstates, and one highlight colour marks the point being made; everything else is grey.
 * A visually hidden table carries the same figures for screen readers.
 */
export function BarChart({
  data,
  unit,
  highlight = [],
  reference,
  format = (v) => v.toLocaleString("en-US", { maximumFractionDigits: 2 }),
  label,
}: {
  data: { label: string; value: number }[];
  unit: string;
  highlight?: string[];
  reference?: { value: number; label: string };
  format?: (v: number) => string;
  label: string;
}) {
  const width = 640;
  const height = 240;
  const pad = { top: 26, right: 8, bottom: 30, left: 8 };
  const max = Math.max(...data.map((d) => d.value), reference?.value ?? 0, 0) * 1.08 || 1;
  const min = Math.min(...data.map((d) => d.value), 0);
  const span = max - min || 1;
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const slot = innerW / data.length;
  const barW = Math.min(72, slot * 0.62);
  const y = (v: number) => pad.top + (1 - (v - min) / span) * innerH;
  const zero = y(0);

  return (
    <>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="block h-auto w-full">
        <line x1={pad.left} x2={width - pad.right} y1={zero} y2={zero} stroke="var(--rule)" strokeWidth={1} />
        {data.map((d, i) => {
          const cx = pad.left + slot * i + slot / 2;
          const top = Math.min(y(d.value), zero);
          const h = Math.max(1, Math.abs(zero - y(d.value)));
          const on = highlight.includes(d.label);
          return (
            <g key={d.label}>
              <rect x={cx - barW / 2} y={top} width={barW} height={h} rx={2} fill={on ? "var(--brand-accent)" : "var(--chart-quiet)"}>
                <title>{`${d.label}: ${format(d.value)} ${unit}`}</title>
              </rect>
              <text x={cx} y={top - 7} textAnchor="middle" className="tabular" fontSize={13} fontWeight={on ? 700 : 500} fill={on ? "var(--ink)" : "var(--ink-soft)"}>
                {format(d.value)}
              </text>
              <text x={cx} y={height - 10} textAnchor="middle" fontSize={12} fill="var(--muted)">
                {d.label}
              </text>
            </g>
          );
        })}
        {reference ? (
          <g>
            <line x1={pad.left} x2={width - pad.right} y1={y(reference.value)} y2={y(reference.value)} stroke="var(--ink-soft)" strokeWidth={1} strokeDasharray="4 4" />
            <text x={width - pad.right} y={y(reference.value) - 5} textAnchor="end" fontSize={11} fill="var(--ink-soft)">
              {reference.label}
            </text>
          </g>
        ) : null}
      </svg>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">{unit}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              <td>{format(d.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
