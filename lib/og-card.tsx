import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { MARK } from "@/components/brand/logo-paths";

/**
 * Branded share cards (1200×630): the image LinkedIn, WhatsApp and X show when an Afronomics link is shared,
 * and the chart image attached to the weekly LinkedIn post. The picture is always the page's own data.
 */

export const cardSize = { width: 1200, height: 630 };

const NAVY = "#0E1524";
const INK = "#F5F6F4";
const SOFT = "#B7BDCC";
const MUTED = "#8189A0";
const RED = "#A08CFF"; // jacaranda, the brand accent
const RED_SOFT = "#B9A9FF";
const UP = "#FF8A7A"; // rates up = tighter money
const DOWN = "#5CD6A8";

const fontDir = path.join(process.cwd(), "assets", "og-fonts");
let fontsPromise: Promise<{ name: string; data: Buffer; weight: 400 | 500 | 600; style: "normal" }[]> | null = null;
function fonts() {
  fontsPromise ??= Promise.all([
    readFile(path.join(fontDir, "ArchivoCondensed-Bold.ttf")).then((data) => ({ name: "Serif", data, weight: 600 as const, style: "normal" as const })),
    readFile(path.join(fontDir, "Archivo-Regular.ttf")).then((data) => ({ name: "Sans", data, weight: 400 as const, style: "normal" as const })),
    readFile(path.join(fontDir, "Archivo-SemiBold.ttf")).then((data) => ({ name: "Sans", data, weight: 600 as const, style: "normal" as const })),
    readFile(path.join(fontDir, "ArchivoExpanded-Bold.ttf")).then((data) => ({ name: "Mono", data, weight: 500 as const, style: "normal" as const })),
  ]);
  return fontsPromise;
}

export type CardStat = { label: string; value: string; note?: string; tone?: "up" | "down" | "flat" };
export type CardBar = { label: string; value: number; display: string };

export type Card = {
  kicker: string;
  title: string;
  stats?: CardStat[];
  line?: { values: number[]; caption?: string };
  bars?: CardBar[];
  barsCaption?: string;
  source: string;
};

function lineChart(values: number[], width: number, height: number) {
  const clean = values.filter((v) => Number.isFinite(v));
  if (clean.length < 2) return null;
  const min = Math.min(...clean);
  const max = Math.max(...clean);
  const span = Math.max(0.5, max - min);
  const x = (i: number) => (i / (clean.length - 1)) * (width - 12);
  const y = (v: number) => 8 + (1 - (v - min) / span) * (height - 16);
  const d = clean.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${d} L${x(clean.length - 1).toFixed(1)},${height} L0,${height} Z`;
  const lx = x(clean.length - 1);
  const ly = y(clean.at(-1)!);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={RED} stopOpacity="0.28" />
          <stop offset="1" stopColor={RED} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#a)" />
      <path d={d} fill="none" stroke={RED} strokeWidth="3" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="12" fill={RED} fillOpacity="0.25" />
      <circle cx={lx} cy={ly} r="6" fill="#D4CAFF" />
    </svg>
  );
}

function barChart(bars: CardBar[], width: number, height: number) {
  const max = Math.max(...bars.map((b) => b.value), 1);
  const gap = 28;
  const bw = (width - gap * (bars.length - 1)) / bars.length;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", width, height, gap }}>
      {bars.map((bar) => (
        <div key={bar.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: bw }}>
          <div style={{ fontFamily: "Serif", fontSize: 40, color: INK, marginBottom: 8 }}>{bar.display}</div>
          <div style={{ width: bw * 0.62, height: Math.max(8, (bar.value / max) * (height - 90)), background: RED, borderRadius: 6 }} />
          <div style={{ fontFamily: "Sans", fontWeight: 600, fontSize: 20, color: SOFT, marginTop: 10 }}>{bar.label}</div>
        </div>
      ))}
    </div>
  );
}

export async function renderCard(card: Card) {
  const chartH = card.stats?.length ? 170 : 250;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(160deg, #141D33 0%, ${NAVY} 70%)`,
          color: INK,
          padding: "52px 64px 40px",
          fontFamily: "Sans",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Sans", fontWeight: 600, fontSize: 24, color: RED_SOFT }}>{card.kicker}</div>
        <div style={{ display: "flex", fontFamily: "Serif", fontSize: card.title.length > 70 ? 54 : 62, lineHeight: 1.02, letterSpacing: -0.5, marginTop: 16, maxWidth: 1060 }}>{card.title}</div>
        {card.stats?.length ? (
          <div style={{ display: "flex", gap: 56, marginTop: 30 }}>
            {card.stats.map((s) => (
              <div key={s.label} style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontFamily: "Sans", fontSize: 20, color: MUTED }}>{s.label}</div>
                <div style={{ fontFamily: "Serif", fontSize: 60, marginTop: 2 }}>{s.value}</div>
                {s.note ? (
                  <div style={{ fontSize: 20, color: s.tone === "up" ? UP : s.tone === "down" ? DOWN : SOFT }}>{s.note}</div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
        <div style={{ display: "flex", flexGrow: 1, alignItems: "flex-end", marginTop: 18 }}>
          {card.bars?.length ? barChart(card.bars, 1072, chartH + 40) : card.line ? lineChart(card.line.values, 1072, chartH) : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, borderTop: "1px solid rgba(255,255,255,0.14)", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", position: "relative", width: 30, height: 30 }}>
              {MARK.bars.map((b, i) => (
                <div
                  key={i}
                  style={{ position: "absolute", left: b.x * 0.48, top: b.y * 0.48, width: b.w * 0.48, height: b.h * 0.48, borderRadius: 3, background: i === MARK.accentIndex ? RED : INK }}
                />
              ))}
            </div>
            <div style={{ fontFamily: "Mono", fontSize: 19, letterSpacing: 2, color: INK }}>AFRONOMICS</div>
            <div style={{ fontSize: 18, color: MUTED }}>afronomicsfeed.com</div>
          </div>
          <div style={{ fontSize: 18, color: MUTED }}>{card.line?.caption ?? card.barsCaption ?? card.source}</div>
        </div>
      </div>
    ),
    { ...cardSize, fonts: await fonts() },
  );
}

export const pct = (v: number | null | undefined, d = 2) => (v == null ? "—" : `${v.toFixed(d)}%`);
export function bpsNote(from?: number | null, to?: number | null): { note?: string; tone?: CardStat["tone"] } {
  if (from == null || to == null) return {};
  const d = Math.round((to - from) * 100);
  if (d === 0) return { note: "unchanged", tone: "flat" };
  return { note: `${d > 0 ? "+" : "−"}${Math.abs(d)} bps`, tone: d > 0 ? "up" : "down" };
}
