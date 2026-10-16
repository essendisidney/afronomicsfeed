import { ChartTips } from "@/components/charts/ChartTips";
import { renderChartSvg, type ChartAnnotation, type ChartPoint, type ChartReference } from "@/lib/charts/render";

/**
 * Column chart drawn on the server from the data, never by a model (lib/charts/render.ts draws it, the same SVG the
 * embed and the PNG download use). Values sit on the bars (no legend), the axis starts at zero so no bar overstates,
 * one highlight colour marks the point being made, and notes on the chart (`annotations`) mark the events the text
 * names. Each bar shows its exact value, unit and period on hover, tap or keyboard focus (ChartTips). A visually
 * hidden table carries the same figures for screen readers. The SVG carries its own aspect ratio, so its height is
 * reserved before anything loads (no layout shift).
 */
export function BarChart({
  data,
  unit,
  highlight = [],
  reference,
  annotations = [],
  format,
  label,
}: {
  data: ChartPoint[];
  unit: string;
  highlight?: string[];
  reference?: ChartReference;
  annotations?: ChartAnnotation[];
  format?: (v: number) => string;
  label: string;
}) {
  const { svg } = renderChartSvg({ data, unit, highlight, reference, annotations }, { label, format, interactive: true });
  const fmt = format ?? ((v: number) => v.toLocaleString("en-US", { maximumFractionDigits: 2 }));
  return (
    <>
      <div className="relative">
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        <ChartTips unit={unit} />
      </div>
      <div className="sr-only">
        <table>
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
                <td>{fmt(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {annotations.length ? (
          <ul aria-label="Notes on the chart">
            {annotations.map((a) => (
              <li key={a.label}>{"x" in a ? `${a.x}: ${a.label}` : `${a.from} to ${a.to}: ${a.label}`}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </>
  );
}
