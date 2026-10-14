import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Comparator } from "@/lib/receipts";

/**
 * The editorial calls ledger (docs/rebuild/receipts-r2-plan.md), read from data/forecasts/editorial.json, which
 * scripts/calls_ledger.py writes. Status is worked out here from the call and its outcome, never stored: open before
 * the check date, due after it with no outcome yet, held or missed from the published figure, void when the event
 * could not happen. The hit rate counts held and missed only, and is never combined with the T-bill ranges.
 */

export type EditorialCall = {
  id: string;
  receipt: string;
  written_at: string;
  statement: string;
  measure: string;
  comparator: Comparator;
  threshold: number | [number, number] | string;
  unit: string | null;
  check_source: string;
  check_date: string;
  corrects?: string;
};
export type EditorialOutcome = { call: string; value: number | string; source_url: string; quote: string; recorded_at: string; recorded_by?: string; void?: boolean };
export type CallStatus = "open" | "due" | "held" | "missed" | "void";
export type CallRow = EditorialCall & { outcome: EditorialOutcome | null; status: CallStatus };

type File = { calls: EditorialCall[]; outcomes: EditorialOutcome[]; not_recorded: { id: string; receipt: string; statement: string; reason: string }[] };

const FILE = path.join(process.cwd(), "data", "forecasts", "editorial.json");
export const EDITORIAL_FILE = "https://github.com/essendisidney/afronomicsfeed/blob/main/data/forecasts/editorial.json";
export const EDITORIAL_HISTORY = "https://github.com/essendisidney/afronomicsfeed/commits/main/data/forecasts/editorial.json";

export function held(call: Pick<EditorialCall, "comparator" | "threshold">, value: number | string): boolean {
  const t = call.threshold;
  if (call.comparator === "is") return String(value).trim().toLowerCase() === String(t).trim().toLowerCase();
  const v = Number(value);
  if (call.comparator === "between") return Array.isArray(t) && v >= t[0] && v <= t[1];
  const n = Number(t);
  return { "<": v < n, "<=": v <= n, ">": v > n, ">=": v >= n }[call.comparator] ?? false;
}

export function statusOf(call: EditorialCall, outcome: EditorialOutcome | null, today: string): CallStatus {
  if (outcome) return outcome.void ? "void" : held(call, outcome.value) ? "held" : "missed";
  return today > call.check_date ? "due" : "open";
}

export const loadEditorial = cache((): File => {
  if (!fs.existsSync(FILE)) return { calls: [], outcomes: [], not_recorded: [] };
  const f = JSON.parse(fs.readFileSync(FILE, "utf8")) as Partial<File>;
  return { calls: f.calls ?? [], outcomes: f.outcomes ?? [], not_recorded: f.not_recorded ?? [] };
});

export function editorialRows(today = new Date().toISOString().slice(0, 10)): CallRow[] {
  const { calls, outcomes } = loadEditorial();
  const byCall = new Map(outcomes.map((o) => [o.call, o]));
  return calls
    .map((c) => {
      const outcome = byCall.get(c.id) ?? null;
      return { ...c, outcome, status: statusOf(c, outcome, today) };
    })
    .sort((a, b) => a.check_date.localeCompare(b.check_date) || a.id.localeCompare(b.id));
}

export function editorialScore(rows: CallRow[]) {
  const held = rows.filter((r) => r.status === "held").length;
  const missed = rows.filter((r) => r.status === "missed").length;
  const open = rows.filter((r) => r.status === "open").length;
  const due = rows.filter((r) => r.status === "due").length;
  const nextDue = rows.filter((r) => r.status === "open").map((r) => r.check_date).sort()[0] ?? null;
  return { held, missed, graded: held + missed, open, due, share: held + missed ? held / (held + missed) : null, nextDue };
}

export function thresholdText(c: Pick<EditorialCall, "comparator" | "threshold" | "unit">) {
  const u = c.unit ? ` ${c.unit}` : "";
  if (c.comparator === "between" && Array.isArray(c.threshold)) return `between ${c.threshold[0]} and ${c.threshold[1]}${u}`;
  if (c.comparator === "is") return `is ${c.threshold}`;
  return `${c.comparator} ${c.threshold}${u}`;
}

export function editorialCsv(rows: CallRow[]) {
  const head = ["id", "receipt", "written_at", "statement", "measure", "test", "check_source", "check_date", "status", "value", "source_url", "quote"];
  const q = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((r) =>
    [r.id, r.receipt, r.written_at, r.statement, r.measure, thresholdText(r), r.check_source, r.check_date, r.status, r.outcome?.value ?? "", r.outcome?.source_url ?? "", r.outcome?.quote ?? ""].map(q).join(","),
  );
  return [head.join(","), ...lines].join("\n") + "\n";
}
