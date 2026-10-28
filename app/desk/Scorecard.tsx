import model from "@/data/strategy/kes-model.json";
import { SectionTitle } from "@/components/data/parts";
import type { Treasury } from "./TreasuryPanel";

/**
 * The 90-day test's verdict board (founder-strategy-pack.md section K and the final answer; D-035, D-036): the day of
 * the test, the kill lines, the evidence that would justify investing further, and booked revenue beside the KES
 * model's base case (scripts/kes_model.py, month 1 = November 2026). What the database cannot measure is marked
 * "by hand", never guessed.
 */

const START = Date.UTC(2026, 9, 28); // D-036, 28 October 2026
const MODEL_START = Date.UTC(2026, 10, 1); // kes_model.py month 1
const DAY = 86_400_000;
const kes = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

type Row = { label: string; now: string; target: string; status: "met" | "not yet" | "breached" | "by hand" };

export function Scorecard({ data, now }: { data: Treasury; now: number }) {
  const day = Math.max(1, Math.floor((now - START) / DAY) + 1);
  const stageAt = (ids: string[]) => data.targets.filter((t) => ids.includes(t.stage)).length;
  const conversations = stageAt(["qualified", "pilot", "proposal", "won"]);
  const monthIndex = Math.floor((new Date(now).getUTCFullYear() - 2026) * 12 + new Date(now).getUTCMonth() - 10) + 1;
  const base = model.scenarios.find((s) => s.scenario === "Base");
  const baseRow = base && monthIndex >= 1 ? base.rows.find((r) => r.month === monthIndex) : undefined;

  const kill: Row[] = [
    {
      label: "Fewer than 3 paying after 40 qualified conversations",
      now: `${data.paying} paying · ${conversations} conversations`,
      target: "3 or more paying",
      status: conversations >= 40 && data.paying < 3 ? "breached" : data.paying >= 3 ? "met" : "not yet",
    },
    { label: "Over half of objections are “our fund manager gives us this free”", now: "count the objection field", target: "half or fewer", status: "by hand" },
    { label: "Lawyer: the pack or benchmark needs a CMA licence we cannot get", now: "opinion not on file", target: "information, not advice", status: "by hand" },
    { label: "Production over 4 hours a customer a month by month 3", now: "time it", target: "4 hours or less", status: "by hand" },
  ];
  const invest: Row[] = [
    { label: "Paying institutions by day 90", now: String(data.paying), target: "10", status: data.paying >= 10 ? "met" : day > 90 ? "breached" : "not yet" },
    { label: "Booked a month by day 90 (KES)", now: kes(data.mrr_kes), target: "300,000", status: data.mrr_kes >= 300_000 ? "met" : day > 90 ? "breached" : "not yet" },
    { label: "On the Treasury Desk tier (KES 45,000 or more)", now: String(data.desk_tier), target: "2", status: data.desk_tier >= 2 ? "met" : day > 90 ? "breached" : "not yet" },
    { label: "Pack used at a board or committee meeting", now: "ask each client at month 1", target: "7 of 10", status: "by hand" },
    { label: "First conversation to invoice", now: "from the deal notes", target: "under 45 days", status: "by hand" },
    { label: "No cancellations at first renewal; 3 referrals by month 6", now: "from month 4", target: "0 lost · 3 referred", status: "by hand" },
  ];
  const tone = { met: "text-up", "not yet": "text-ink-soft", breached: "text-down", "by hand": "text-muted" } as const;
  const table = (rows: Row[]) => (
    <div className="mt-3 overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th>Test</th>
            <th className="text-right">Now</th>
            <th className="text-right">Line</th>
            <th className="text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="text-sm">{r.label}</td>
              <td className="text-right text-sm">{r.now}</td>
              <td className="text-right text-sm">{r.target}</td>
              <td className={`text-right text-sm font-semibold ${tone[r.status]}`}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <section>
      <SectionTitle
        kicker={`Day ${Math.min(day, 999)} of 90 · day 45 is ${new Date(START + 44 * DAY).toISOString().slice(0, 10)}, day 90 is ${new Date(START + 89 * DAY).toISOString().slice(0, 10)}`}
        title="The verdict board"
        note="Kill lines end the institutional thesis in this form; the second table is the evidence to invest further."
      />
      <h3 className="mt-4 text-sm font-semibold text-ink">Kill lines</h3>
      {table(kill)}
      <h3 className="mt-6 text-sm font-semibold text-ink">Evidence to invest further</h3>
      {table(invest)}
      <p className="mt-3 text-[13px] text-ink-soft">
        {baseRow
          ? `The model's base case for this month (month ${monthIndex}) is KES ${kes(baseRow.mrr)} a month from ${baseRow.customers.toFixed(1)} customers; booked now: KES ${kes(data.mrr_kes)} from ${data.paying}.`
          : `The model starts in November 2026 (${new Date(MODEL_START).toISOString().slice(0, 10)}); its base case books nothing until month 3.`}
      </p>
    </section>
  );
}
