import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

/**
 * When each central bank next decides its policy rate, from the meeting calendar the bank itself publishes
 * (data/mpc_calendar.json, each entry with the bank's own wording and link).
 */

export type Meeting = { start: string | null; end: string | null; announce: string | null };
type BankCal = { source_url: string; quote: string; meetings: Meeting[] };
type File = { updated: string; not_published?: Record<string, string>; banks: Record<string, BankCal> };

const FILE = path.join(process.cwd(), "data", "mpc_calendar.json");

export const loadMpc = cache((): File | null => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : null));

/** The day the decision is due: the announcement date if published, else the meeting's last day. */
export const decisionDay = (m: Meeting) => (m.announce ?? m.end ?? m.start)!;

/** Next decision per market from `today` (YYYY-MM-DD), with the bank's source. */
export function nextDecisions(today: string) {
  const f = loadMpc();
  const out = new Map<string, { day: Meeting; date: string; source: string }>();
  for (const [market, cal] of Object.entries(f?.banks ?? {})) {
    const next = cal.meetings.map((m) => ({ day: m, date: decisionDay(m) })).filter((x) => x.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0];
    if (next) out.set(market, { ...next, source: cal.source_url });
  }
  return out;
}
