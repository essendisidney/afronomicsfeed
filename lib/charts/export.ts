import { MARK, WORDMARK } from "@/components/brand/logo-paths";
import { chartCsv, lightPalette, renderChartSvg, type ChartSpec } from "@/lib/charts/render";

/**
 * Chart downloads, run in the reader's browser and loaded only when a button asks for them (components/charts/
 * ChartTools.tsx). The PNG is drawn on a canvas with no library: the chart's own SVG (lib/charts/render.ts, light
 * colours), with its title and unit above and its source, date, address and the Afronomics wordmark below, so the
 * image carries its provenance wherever it is posted.
 */

export type ChartExport = {
  spec: ChartSpec;
  title: string;
  unit: string;
  source: string;
  sourceUrl: string;
  /** "as of" line for the source, already formatted. */
  asOf: string;
  /** The Receipt's publication date, already formatted. */
  published: string;
  pageUrl: string;
  embedUrl: string;
  embedHeight: number;
  fileName: string;
};

const W = 640; // CSS pixels; drawn at 2x
const SCALE = 2;
const PAD = 32;

function fontVar(name: string, fallback: string) {
  const v = typeof document === "undefined" ? "" : getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, width: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function loadImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("chart image failed to load"));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}

function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, height: number, ink: string, accent: string) {
  // The same geometry as components/brand/Wordmark.tsx (Logo): the mark, a gap, then the wordmark paths.
  const s = height / 76;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  MARK.bars.forEach((b, i) => {
    ctx.fillStyle = i === MARK.accentIndex ? accent : ink;
    ctx.beginPath();
    ctx.roundRect(b.x, b.y + 4, b.w, b.h, b.w / 2);
    ctx.fill();
  });
  ctx.translate(MARK.width + 20, 18);
  ctx.fillStyle = ink;
  ctx.fill(new Path2D(WORDMARK.name));
  ctx.fillStyle = accent;
  ctx.fill(new Path2D(WORDMARK.sub));
  ctx.restore();
}

export const logoWidth = (height: number) => ((MARK.width + 20 + WORDMARK.width) * height) / 76;

export async function chartPng(c: ChartExport): Promise<Blob> {
  if (document.fonts?.ready) await document.fonts.ready;
  const p = lightPalette;
  const sans = fontVar("--font-sans", "Arial, Helvetica, sans-serif");
  const serif = fontVar("--font-headline", "Georgia, 'Times New Roman', serif");
  const inner = W - PAD * 2;

  const { svg, geometry } = renderChartSvg(c.spec, { label: c.title, palette: p, font: "Arial, Helvetica, sans-serif", standalone: true });
  const chartH = (geometry.height * inner) / geometry.width;
  const img = await loadImage(svg);

  // Measure first, on a scratch canvas, so the image is exactly as tall as its text.
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = `700 24px ${serif}`;
  const titleLines = wrap(probe, c.title, inner);
  probe.font = `400 14px ${sans}`;
  const unitLines = wrap(probe, c.unit, inner);
  probe.font = `400 12.5px ${sans}`;
  // Every footer line wraps short of the wordmark, which sits at the right of the footer.
  const footW = inner - logoWidth(24) - 20;
  const address = c.pageUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/#.*$/, "");
  const footLines = [`Source: ${c.source}, ${c.asOf}`, `Published ${c.published}`, address, "Information, not advice."].flatMap((t) => wrap(probe, t, footW));

  const titleH = titleLines.length * 30;
  const unitH = unitLines.length * 19;
  const footH = Math.max(footLines.length * 18, 30);
  const H = Math.ceil(PAD + titleH + 4 + unitH + 16 + chartH + 18 + 1 + 14 + footH + PAD - 6);

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = p.surface;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  let y = PAD;
  ctx.fillStyle = p.ink;
  ctx.font = `700 24px ${serif}`;
  for (const line of titleLines) {
    ctx.fillText(line, PAD, y + 23);
    y += 30;
  }
  y += 4;
  ctx.fillStyle = p.muted;
  ctx.font = `400 14px ${sans}`;
  for (const line of unitLines) {
    ctx.fillText(line, PAD, y + 14);
    y += 19;
  }
  y += 16;
  ctx.drawImage(img, PAD, y, inner, chartH);
  y += chartH + 18;
  ctx.fillStyle = p.rule;
  ctx.fillRect(PAD, y, inner, 1);
  y += 15;

  const footTop = y;
  ctx.fillStyle = p.muted;
  ctx.font = `400 12.5px ${sans}`;
  for (const line of footLines) {
    ctx.fillText(line, PAD, y + 12);
    y += 18;
  }
  drawLogo(ctx, W - PAD - logoWidth(24), footTop, 24, p.ink, p.accent);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("canvas export failed"))), "image/png"));
}

export function csvBlob(c: ChartExport): Blob {
  return new Blob([chartCsv({ data: c.spec.data, unit: c.unit, source: c.source, url: c.pageUrl })], { type: "text/csv;charset=utf-8" });
}

export function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
