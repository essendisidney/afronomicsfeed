import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

/**
 * Publication latency, written by scripts/latency.py after each data run (see that file for the method): per auction
 * result, when our reader first wrote it and, where the publisher exposes it, when the publisher released it.
 * Figures (p50/p90 hours) exist only for markets with at least `min_results` timed results; otherwise they are null.
 */
export type LatencyResult = {
  key: string;
  kind: "bills" | "bonds";
  market: string;
  date: string;
  baseline?: boolean;
  first_seen_at: string | null;
  published_at?: string | null;
  published_how?: string | null;
  delay_h?: number;
  excluded?: string;
};

export type LatencySummary = {
  kind: "bills" | "bonds";
  market: string;
  name: string;
  results: number;
  timed: number;
  p50_h: number | null;
  p90_h: number | null;
  publisher_time: string | null;
  status: string;
};

export type Latency = {
  since: string;
  min_results: number;
  updated_at: string | null;
  overall: { timed: number; results: number; p50_h: number | null; p90_h: number | null };
  summary: LatencySummary[];
  results: LatencyResult[];
};

const FILE = path.join(process.cwd(), "data", "latency.json");

export const loadLatency = cache((): Latency | null => {
  if (!fs.existsSync(FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Latency;
  } catch {
    return null;
  }
});

/** "3.2 hours", "14 hours", "40 minutes": one decimal below ten hours, minutes below one. */
export function hoursText(h: number) {
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} minutes`;
  if (h < 10) return `${h.toFixed(1)} hours`;
  return `${Math.round(h)} hours`;
}

export const latencyDate = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** The one-line claim for product pages: a measured median, or that measuring is under way. Never a made-up figure. */
export function latencyLine(l: Latency | null): string {
  if (!l) return "Publication delay: measuring starts with the next data run.";
  const o = l.overall;
  if (o.p50_h != null && o.timed >= (l.min_results ?? 5)) {
    return `Median delay after the issuer publishes: ${hoursText(o.p50_h)}, measured over ${o.timed} results since ${latencyDate(l.since)}.`;
  }
  return `Publication delay: measuring since ${latencyDate(l.since)}; a figure appears once ${l.min_results ?? 5} results carry the issuer’s own release time.`;
}
