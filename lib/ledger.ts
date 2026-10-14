import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { outlook } from "@/lib/data/auction-intel";
import { site } from "@/lib/site";

/**
 * The forecast ledger (docs/rebuild/phase-4-plan.md), written by scripts/forecast_ledger.py: Kenya Treasury bill
 * ranges published before bids close, and their outcomes graded by code. This module only reads it and does the
 * arithmetic for the record page; it never edits a row.
 */

export type Forecast = {
  id: string;
  market: string;
  tenor: 91 | 182 | 364;
  auction_value_date: string;
  bids_close: string;
  written_at: string;
  method: string;
  from_value_date: string;
  from_rate: number;
  low: number;
  high: number;
  typical_move: number;
};

export type Outcome = {
  id: string;
  graded_at: string;
  status: "graded" | "no_result";
  result_value_date?: string;
  result_rate?: number;
  inside: boolean | null;
  miss_bps?: number;
  side?: "above" | "below" | null;
  source?: string;
  note?: string;
};

export type LedgerRow = Forecast & { outcome: Outcome | null };

type FirstPublished = { ids: string[]; commit: string; at: string; note: string };
type LedgerFile = { methods: Record<string, string>; forecasts: Forecast[]; outcomes: Outcome[]; first_published?: FirstPublished[] };

const FILE = path.join(process.cwd(), "data", "forecasts", "kenya_tbills.json");
/** Where anyone can see when each forecast was committed: the public history of the ledger file. */
export const LEDGER_HISTORY = "https://github.com/essendisidney/afronomicsfeed/commits/main/data/forecasts/kenya_tbills.json";
export const LEDGER_FILE = "https://github.com/essendisidney/afronomicsfeed/blob/main/data/forecasts/kenya_tbills.json";
/** The share a 10th-to-90th percentile range aims to hold. */
export const TARGET = 0.8;

export const loadLedger = cache((): { methods: Record<string, string>; rows: LedgerRow[]; firstPublished: FirstPublished[] } => {
  if (!fs.existsSync(FILE)) return { methods: {}, rows: [], firstPublished: [] };
  const f = JSON.parse(fs.readFileSync(FILE, "utf8")) as LedgerFile;
  const byId = new Map(f.outcomes.map((o) => [o.id, o]));
  const rows = f.forecasts
    .map((x) => ({ ...x, outcome: byId.get(x.id) ?? null }))
    .sort((a, b) => b.auction_value_date.localeCompare(a.auction_value_date) || a.tenor - b.tenor);
  return { methods: f.methods, rows, firstPublished: f.first_published ?? [] };
});

export type Score = { graded: number; inside: number; share: number | null; meanMissBps: number | null };

export function score(rows: LedgerRow[]): Score {
  const g = rows.filter((r) => r.outcome?.status === "graded");
  const inside = g.filter((r) => r.outcome!.inside).length;
  const misses = g.filter((r) => !r.outcome!.inside).map((r) => r.outcome!.miss_bps ?? 0);
  return {
    graded: g.length,
    inside,
    share: g.length ? inside / g.length : null,
    meanMissBps: misses.length ? misses.reduce((a, b) => a + b, 0) / misses.length : null,
  };
}

/** The forecast already published for an upcoming auction, by tenor; the auction page shows this instead of recomputing. */
export function publishedFor(valueDate: string): Map<number, Forecast> {
  return new Map(loadLedger().rows.filter((r) => r.auction_value_date === valueDate).map((r) => [r.tenor, r]));
}

/** The backtest from lib/data/auction-intel.ts, labelled as such: today's method run over past auctions. */
export function backtest() {
  const rows = outlook();
  const tested = rows.reduce((n, r) => n + r.trackRecord.tested, 0);
  const inside = rows.reduce((n, r) => n + r.trackRecord.inside, 0);
  return {
    tested,
    inside,
    share: tested ? inside / tested : null,
    byTenor: rows.map((r) => ({ tenor: r.tenor, tested: r.trackRecord.tested, inside: r.trackRecord.inside })),
  };
}

export function ledgerCsv(): string {
  const { rows } = loadLedger();
  const q = (v: unknown) => (v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));
  const header = ["id", "tenor_days", "auction_value_date", "bids_close_utc", "written_at_utc", "method", "from_rate_pct", "low_pct", "high_pct", "status", "result_value_date", "result_rate_pct", "inside", "miss_bps", "side", "result_source"];
  return [
    "# Afronomics forecast ledger: Kenya Treasury bill ranges, written before bids close and graded by code against CBK's results.",
    `# Method v1: latest weighted average rate plus the 10th to 90th percentile of the last 26 weekly moves; aims to hold about 80%. Time stamps: ${LEDGER_HISTORY}`,
    `# Free to use with credit and a link (${site.url}/record). Information, not advice.`,
    header.join(","),
    ...rows.map((r) =>
      [r.id, r.tenor, r.auction_value_date, r.bids_close, r.written_at, r.method, r.from_rate, r.low, r.high, r.outcome?.status ?? "pending", r.outcome?.result_value_date, r.outcome?.result_rate, r.outcome?.inside, r.outcome?.miss_bps, r.outcome?.side, r.outcome?.source]
        .map(q)
        .join(","),
    ),
  ].join("\n");
}
