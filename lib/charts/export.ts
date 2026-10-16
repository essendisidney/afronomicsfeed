import { brand } from "@/lib/brand/card-style";
import { lightPalette } from "@/lib/charts/palette";
import { chartCsv, renderChartSvg, type ChartSpec } from "@/lib/charts/render";

/**
 * Chart downloads, run in the reader's browser and loaded only when a button asks for them (components/charts/
 * ChartTools.tsx). The PNG is drawn on a canvas with no library: the chart's own SVG (lib/charts/render.ts, light
 * * colours), with its title and unit above and its source, date, address and the Afronomics stamp and name below, so the
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

const LOGO_GAP = 8;
const logoFont = (height: number, serif: string) => `700 ${Math.round(height * 0.72)}px ${serif}`;

/** The wordmark's width at `height`: the stamp disc, a gap, then "Afronomics" in the headline face. */
function logoWidth(ctx: CanvasRenderingContext2D, height: number, serif: string) {
  ctx.font = logoFont(height, serif);
  return height + LOGO_GAP + ctx.measureText("Afronomics").width;
}

/**
 * The Afronomics mark and name (components/brand/Wordmark.tsx, D-026): a cream stamp disc with a dashed laterite ring
 * around "Af", turned 9 degrees off true, then the name in the headline face.
 */
function drawLogo(ctx: CanvasRenderingContext2D, x: number, y: number, height: number, ink: string, serif: string) {
  const r = height / 2;
  ctx.save();
  ctx.translate(x + r, y + r);
  ctx.rotate((-9 * Math.PI) / 180);
  ctx.fillStyle = brand.stampPaper;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = brand.laterite;
  ctx.lineWidth = Math.max(1, height * 0.04);
  ctx.setLineDash([height * 0.055, height * 0.035]);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.83, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = brand.laterite;
  ctx.font = `700 ${Math.round(height * 0.5)}px ${serif}`;
  ctx.textAlign = "center";
  ctx.fillText("Af", 0, height * 0.17);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = ink;
  ctx.font = logoFont(height, serif);
  ctx.fillText("Afronomics", x + height + LOGO_GAP, y + height * 0.76);
  ctx.restore();
}

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
  // Every footer line wraps short of the wordmark, which sits at the right of the footer.
  const logoW = logoWidth(probe, 24, serif);
  probe.font = `400 12.5px ${sans}`;
  const footW = inner - logoW - 20;
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
  drawLogo(ctx, W - PAD - logoW, footTop, 24, p.ink, serif);

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
