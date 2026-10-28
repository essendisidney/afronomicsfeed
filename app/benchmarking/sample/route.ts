import type { Holding } from "@/lib/benchmark";
import { benchmarkHtml } from "@/lib/editions/benchmark-html";

export const revalidate = 3600;

/**
 * A sample quarterly benchmark for the demo (docs/sales/treasury-desk-kit.md section 3) and /benchmarking: made-up
 * holdings of a made-up institution, set against the real CBK auction results of the quarter.
 */
const HOLDINGS: Holding[] = [
  { line: 2, name: "Call deposit at a bank", kind: "deposit", amountKes: 20_000_000, ratePct: 6.5, start: "2026-01-01", end: "2027-01-01" },
  { line: 3, name: "Six-month fixed deposit", kind: "deposit", amountKes: 50_000_000, ratePct: 8.0, start: "2026-04-01", end: "2026-10-01" },
  { line: 4, name: "Money market fund", kind: "fund", amountKes: 30_000_000, ratePct: 9.5, start: "2026-01-01", end: "2026-12-31" },
  { line: 5, name: "91-day Treasury bill", kind: "tbill", amountKes: 25_000_000, ratePct: 8.9, start: "2026-07-06", end: "2026-10-05" },
  { line: 6, name: "364-day Treasury bill", kind: "tbill", amountKes: 40_000_000, ratePct: 9.6, start: "2026-02-02", end: "2027-02-01" },
];

export function GET() {
  const html = benchmarkHtml({ name: "Sample institution", quarter: "2026-Q3", holdings: HOLDINGS, sample: true });
  return new Response(html ?? "Unavailable.", {
    status: html ? 200 : 500,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
