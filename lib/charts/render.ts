/**
 * The house column chart as an SVG string, drawn from the data and never by a model. One renderer serves the page
 * (components/charts/BarChart.tsx), the embed (/embed/chart/...) and the downloaded PNG (lib/charts/export.ts), so all
 * three show the same bars, labels and notes. Values sit on the bars (no legend), the axis starts at zero so no bar
 * overstates, and one highlight colour marks the point being made; everything else is grey.
 *
 * Notes on the chart (`annotations`) are either a line at one bar (`x`) or a shaded span between two bars, centre to
 * centre (`from`, `to`). Their text sits in a band above the plot, one note per row, wrapped so it stays readable
 * when the chart is scaled down to a 390px phone.
 */

export type ChartPoint = { label: string; value: number };
export type ChartAnnotation = { x: string; label: string } | { from: string; to: string; label: string };
export type ChartReference = { value: number; label: string };

export type ChartSpec = {
  data: ChartPoint[];
  unit: string;
  highlight?: string[];
  reference?: ChartReference;
  annotations?: ChartAnnotation[];
};

export type ChartPalette = { surface: string; ink: string; inkSoft: string; muted: string; rule: string; accent: string; quiet: string };

/** Site colours by reference, so the chart follows light and dark mode. */
export const cssPalette: ChartPalette = {
  surface: "var(--surface)",
  ink: "var(--ink)",
  inkSoft: "var(--ink-soft)",
  muted: "var(--muted)",
  rule: "var(--rule)",
  accent: "var(--chart-accent)",
  quiet: "var(--chart-quiet)",
};

// The same tokens as hex, for the PNG export, are lightPalette in lib/charts/palette.ts (from lib/brand/card-style.ts).

/**
 * Whether a chart's values are percentages: the unit has a "%" that is not part of a figure. "% a year" and
 * "Growth in 2025, %" are; "Interest kept after 15% tax, KES" is not, because its "%" belongs to the 15.
 */
export function isPercentUnit(unit: string): boolean {
  return /(^|[^\d.])%/.test(unit);
}

/** A value as the chart prints it: up to two decimals, and a % sign when the unit is a percentage. */
export function formatChartValue(v: number, unit: string): string {
  return `${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}${isPercentUnit(unit) ? "%" : ""}`;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const r1 = (n: number) => Math.round(n * 10) / 10;

export const CHART_WIDTH = 420; // narrow, so labels stay readable when the chart scales down to a phone
const BASE_HEIGHT = 240;
const NOTE_FONT = 14; // ~10.8px at 390px, no smaller than the value labels
const NOTE_LINE = 16;
const NOTE_GAP = 7;

/** Splits a note into lines of at most `max` characters, at spaces. */
export function wrapText(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && (line + " " + word).length > max) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return lines;
}

export type ChartGeometry = {
  width: number;
  height: number;
  points: { label: string; value: number; cx: number; top: number; text: string; on: boolean }[];
};

/**
 * The chart as an SVG string. `standalone` drops the page sizing, for an SVG drawn as an image. `interactive` makes each bar a focusable point (keyboard and screen reader) that the
 * page's tooltip script reads its period, value and unit from.
 */
export function renderChartSvg(
  spec: ChartSpec,
  opts: { label: string; palette?: ChartPalette; font?: string; interactive?: boolean; standalone?: boolean; format?: (v: number) => string },
): { svg: string; geometry: ChartGeometry } {
  const { data, unit, highlight = [], reference, annotations = [] } = spec;
  const p = opts.palette ?? cssPalette;
  const format = opts.format ?? ((v: number) => formatChartValue(v, unit));
  const width = CHART_WIDTH;
  const index = new Map(data.map((d, i) => [d.label, i]));
  const pad = { top: 26, right: 8, bottom: 30, left: 8 };
  const innerW = width - pad.left - pad.right;
  const slot = innerW / data.length;
  const centre = (i: number) => pad.left + slot * i + slot / 2;

  // Notes that name a bar the chart does not have are dropped here; the Receipt checks refuse them before a build.
  const notes = annotations
    .map((a) => {
      if ("x" in a) {
        const i = index.get(a.x);
        return i == null ? null : { kind: "line" as const, x1: centre(i), x2: centre(i), label: a.label };
      }
      const i = index.get(a.from);
      const j = index.get(a.to);
      return i == null || j == null || j <= i ? null : { kind: "span" as const, x1: centre(i), x2: centre(j), label: a.label };
    })
    .filter((n) => n !== null)
    .map((n) => {
      if (n.kind === "line") {
        // A line note is centred over its pin, slid inward only as far as it must be to stay inside the chart.
        const lines = wrapText(n.label, Math.max(14, Math.floor(innerW / (NOTE_FONT * 0.55))));
        const half = (Math.max(...lines.map((l) => l.length)) * NOTE_FONT * 0.55) / 2;
        const anchorX = Math.min(width - pad.right - half, Math.max(pad.left + half, n.x1));
        return { ...n, anchor: "middle" as const, anchorX, lines };
      }
      // A span's text runs right from its left edge when there is room, otherwise left from its right edge.
      const startAnchor = n.x1 < width * 0.55;
      const anchorX = startAnchor ? Math.max(pad.left, n.x1) : Math.min(width - pad.right, n.x2);
      const room = startAnchor ? width - pad.right - anchorX : anchorX - pad.left;
      const lines = wrapText(n.label, Math.max(14, Math.floor(room / (NOTE_FONT * 0.55))));
      return { ...n, anchor: startAnchor ? ("start" as const) : ("end" as const), anchorX, lines };
    });

  let bandY = 8;
  const placed = notes.map((n) => {
    const top = bandY;
    bandY += n.lines.length * NOTE_LINE + NOTE_GAP;
    return { ...n, top, bottom: top + n.lines.length * NOTE_LINE };
  });
  const band = placed.length ? bandY : 0;
  pad.top += band;
  const height = BASE_HEIGHT + band;
  const innerH = height - pad.top - pad.bottom;

  const max = Math.max(...data.map((d) => d.value), reference?.value ?? 0, 0) * 1.08 || 1;
  const min = Math.min(...data.map((d) => d.value), 0);
  const span = max - min || 1;
  const barW = Math.min(56, slot * 0.6);
  const y = (v: number) => pad.top + (1 - (v - min) / span) * innerH;
  const zero = y(0);
  const font = opts.font ? ` font-family="${esc(opts.font)}"` : "";
  const halo = `stroke="${p.surface}" stroke-width="4" stroke-linejoin="round" paint-order="stroke"`;

  const out: string[] = [];
  out.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${r1(height)}" width="${width}" height="${r1(height)}" role="group" aria-label="${esc(opts.label)}"${font}${opts.standalone ? "" : ' class="chart-svg" style="display:block;width:100%;height:auto;max-width:36rem"'}>`,
  );

  // Shaded spans and note lines sit behind the bars.
  for (const n of placed) {
    if (n.kind === "span") {
      out.push(`<rect x="${r1(n.x1)}" y="${r1(n.bottom + 3)}" width="${r1(n.x2 - n.x1)}" height="${r1(zero - n.bottom - 3)}" fill="${p.accent}" fill-opacity="0.09"/>`);
      out.push(`<line x1="${r1(n.x1)}" x2="${r1(n.x2)}" y1="${r1(n.bottom + 3)}" y2="${r1(n.bottom + 3)}" stroke="${p.inkSoft}" stroke-width="1"/>`);
    } else {
      out.push(`<line x1="${r1(n.x1)}" x2="${r1(n.x1)}" y1="${r1(n.bottom + 3)}" y2="${r1(zero)}" stroke="${p.inkSoft}" stroke-width="1" stroke-dasharray="3 3"/>`);
    }
  }

  out.push(`<line x1="${pad.left}" x2="${width - pad.right}" y1="${r1(zero)}" y2="${r1(zero)}" stroke="${p.rule}" stroke-width="1"/>`);

  const points: ChartGeometry["points"] = [];
  data.forEach((d, i) => {
    const cx = centre(i);
    const top = Math.min(y(d.value), zero);
    const h = Math.max(1, Math.abs(zero - y(d.value)));
    const on = highlight.includes(d.label);
    const text = format(d.value);
    points.push({ label: d.label, value: d.value, cx, top, text, on });
    const attrs = opts.interactive
      ? ` class="chart-pt" tabindex="0" role="img" aria-label="${esc(`${d.label}: ${text} (${unit})`)}" data-i="${i}" data-label="${esc(d.label)}" data-value="${esc(text)}" data-cx="${r1(cx)}" data-top="${r1(top)}"`
      : "";
    out.push(`<g${attrs}>`);
    // A full-height, invisible target so a finger does not have to land on a short bar.
    if (opts.interactive) out.push(`<rect x="${r1(pad.left + slot * i)}" y="${r1(pad.top - 20)}" width="${r1(slot)}" height="${r1(height - pad.top + 20)}" fill="transparent"/>`);
    out.push(`<rect class="chart-bar" x="${r1(cx - barW / 2)}" y="${r1(top)}" width="${r1(barW)}" height="${r1(h)}" rx="2" fill="${on ? p.accent : p.quiet}"/>`);
    out.push(
      `<text x="${r1(cx)}" y="${r1(top - 7)}" text-anchor="middle" class="tabular" font-size="13" font-weight="${on ? 700 : 500}" fill="${on ? p.ink : p.inkSoft}" ${halo}>${esc(text)}</text>`,
    );
    out.push(`<text x="${r1(cx)}" y="${height - 10}" text-anchor="middle" font-size="12" fill="${p.muted}">${esc(d.label)}</text>`);
    out.push(`</g>`);
  });

  if (reference) {
    const ry = y(reference.value);
    out.push(`<line x1="${pad.left}" x2="${width - pad.right}" y1="${r1(ry)}" y2="${r1(ry)}" stroke="${p.inkSoft}" stroke-width="1" stroke-dasharray="4 4"/>`);
    // A halo in the card colour keeps the label readable where it crosses a bar.
    out.push(`<text x="${pad.left}" y="${r1(ry - 5)}" text-anchor="start" font-size="11" fill="${p.inkSoft}" ${halo}>${esc(reference.label)}</text>`);
  }

  // Note text last, on top of everything, with the same halo.
  for (const n of placed) {
    const anchor = n.anchor;
    if (n.kind === "line") out.push(`<circle cx="${r1(n.x1)}" cy="${r1(n.bottom + 3)}" r="2.5" fill="${p.ink}"/>`);
    out.push(`<text x="${r1(n.anchorX)}" y="${r1(n.top + NOTE_FONT - 2)}" text-anchor="${anchor}" font-size="${NOTE_FONT}" font-weight="600" fill="${p.ink}" ${halo}>`);
    n.lines.forEach((line, k) => out.push(`<tspan x="${r1(n.anchorX)}" dy="${k ? NOTE_LINE : 0}">${esc(line)}</tspan>`));
    out.push(`</text>`);
  }

  out.push(`</svg>`);
  return { svg: out.join(""), geometry: { width, height, points } };
}

/** The chart's figures as CSV: one row per bar, with the unit and the source on every row so a row stands alone. */
export function chartCsv(spec: { data: ChartPoint[]; unit: string; source: string; url: string }): string {
  const cell = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [["label", "value", "unit", "source", "url"], ...spec.data.map((d) => [d.label, d.value, spec.unit, spec.source, spec.url])];
  return rows.map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
