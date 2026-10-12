import { SectionTitle } from "@/components/data/parts";
import type { Money } from "./MoneyPanel";
import { SaveDeal } from "./DeskActions";

/**
 * The founder command centre: progress toward USD 1 million a month (docs/strategy/usd-1m-plan.md). Four numbers
 * are kept strictly apart and never added together: money collected (payments, tests excluded), contracted
 * recurring value (deals marked won, which needs a signed agreement), pilots (trial API keys and their use), and
 * the unsigned pipeline (an estimate, not revenue).
 */

export type Deal = {
  id: number;
  organisation: string;
  segment: string;
  product: string;
  stage: string;
  value_usd_month: number | null;
  source: string | null;
  next_step: string | null;
  next_date: string | null;
  signed_at: string | null;
  updated_at: string;
};
export type PilotKey = { id: number; label: string; plan: string; created_at: string; revoked_at: string | null; last_used_at: string | null; calls_30d: number };

export const MILESTONES = [10_000, 50_000, 100_000, 250_000, 500_000, 1_000_000];
const STAGES = ["prospect", "contacted", "qualified", "pilot", "proposal", "won", "lost"] as const;
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

/** Payments are stored in the currency's subunit; perUsd is units of that currency per US dollar. */
export function toUsd(rows: { currency: string | null; amount: number }[], perUsd: Record<string, number>) {
  let total = 0;
  const unconverted: string[] = [];
  for (const r of rows) {
    const code = (r.currency ?? "KES").toUpperCase();
    const rate = perUsd[code];
    if (rate) total += r.amount / 100 / rate;
    else if (r.amount) unconverted.push(code);
  }
  return { total, unconverted };
}

export function CommandCentre({ money, deals, pilots, perUsd, fxNote }: { money: Money | null; deals: Deal[]; pilots: PilotKey[]; perUsd: Record<string, number>; fxNote: string }) {
  const thisMonth = toUsd((money?.revenue ?? []).map((r) => ({ currency: r.currency, amount: r.this_month })), perUsd);
  const lastMonth = toUsd((money?.revenue ?? []).map((r) => ({ currency: r.currency, amount: r.last_month })), perUsd);
  const allTime = toUsd((money?.revenue ?? []).map((r) => ({ currency: r.currency, amount: r.all_time })), perUsd);
  const mrr = toUsd(money?.mrr ?? [], perUsd);
  const won = deals.filter((d) => d.stage === "won");
  const contracted = won.reduce((n, d) => n + (d.value_usd_month ?? 0), 0);
  const open = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const pipeline = open.reduce((n, d) => n + (d.value_usd_month ?? 0), 0);
  const activePilots = pilots.filter((k) => k.plan === "trial" && !k.revoked_at);
  const run = Math.max(thisMonth.total, lastMonth.total);
  const next = MILESTONES.find((m) => run < m) ?? MILESTONES[MILESTONES.length - 1];
  const byStage = STAGES.map((s) => {
    const rows = deals.filter((d) => d.stage === s);
    return { s, n: rows.length, v: rows.reduce((n, d) => n + (d.value_usd_month ?? 0), 0) };
  });
  const unconverted = [...new Set([...thisMonth.unconverted, ...lastMonth.unconverted, ...allTime.unconverted])];

  return (
    <section className="rounded-2xl border-2 border-ink/80 bg-surface px-5 py-5">
      <SectionTitle
        kicker="Command centre · USD 1 million a month"
        title={run ? `${usd(run)} a month collected; next milestone ${usd(next)}` : `Nothing collected yet; first milestone ${usd(MILESTONES[0])} a month`}
        note={`Collected money only counts payments received (tests excluded). Converted to US dollars at ${fxNote}.`}
      />
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule lg:grid-cols-4">
        {[
          ["Collected this month", usd(thisMonth.total), `last month ${usd(lastMonth.total)} · all time ${usd(allTime.total)}`],
          ["Recurring (Paystack subscriptions)", usd(mrr.total), `${(money?.mrr ?? []).reduce((n, r) => n + r.subscriptions, 0)} active subscriptions`],
          ["Contracted, signed, a month", usd(contracted), `${won.length} signed deal${won.length === 1 ? "" : "s"}: not yet collected unless paid`],
          ["Pipeline, unsigned (estimate)", usd(pipeline), `${open.length} open deal${open.length === 1 ? "" : "s"} · ${activePilots.length} pilot key${activePilots.length === 1 ? "" : "s"}: not revenue`],
        ].map(([l, v, n]) => (
          <div key={l} className="bg-surface px-4 py-3">
            <p className="text-[12px] text-muted">{l}</p>
            <p className="mt-1 font-serif text-2xl text-ink">{v}</p>
            <p className="mt-0.5 text-[11px] text-muted">{n}</p>
          </div>
        ))}
      </div>
      {unconverted.length ? <p className="mt-2 text-[12px] text-accent">Not converted (no rate): {unconverted.join(", ")}.</p> : null}

      <div className="mt-5 space-y-2">
        {MILESTONES.map((m) => {
          const share = Math.min(1, run / m);
          return (
            <div key={m} className="grid grid-cols-[88px_1fr_52px] items-center gap-3 text-[13px]">
              <span className={run >= m ? "font-semibold text-forest" : m === next ? "font-semibold text-ink" : "text-muted"}>{usd(m)}</span>
              <span className="h-2 overflow-hidden rounded-full bg-rule">
                <span className="block h-full rounded-full bg-forest" style={{ width: `${Math.max(share * 100, share > 0 ? 1 : 0)}%` }} />
              </span>
              <span className="text-right text-[12px] text-muted">{share >= 1 ? "reached" : `${(share * 100).toFixed(share < 0.01 ? 2 : 0)}%`}</span>
            </div>
          );
        })}
        <p className="text-[11px] text-muted">Progress is the higher of this month’s and last month’s collected revenue, against a month’s target.</p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <div>
          <p className="text-[13px] font-semibold text-ink">Pipeline by stage</p>
          <table className="data-table mt-2">
            <thead>
              <tr>
                <th>Stage</th>
                <th className="text-right">Deals</th>
                <th className="text-right">Est. USD a month</th>
              </tr>
            </thead>
            <tbody>
              {byStage.map((r) => (
                <tr key={r.s}>
                  <td>{r.s === "won" ? "won (signed)" : r.s}</td>
                  <td className="text-right">{r.n}</td>
                  <td className="text-right">{r.v ? usd(r.v) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <p className="text-[13px] font-semibold text-ink">Pilots (trial API keys)</p>
          {activePilots.length ? (
            <ul className="mt-2 divide-y divide-rule text-sm">
              {activePilots.map((k) => (
                <li key={k.id} className="flex justify-between gap-3 py-2">
                  <span className="text-ink">{k.label}</span>
                  <span className="text-[12px] text-muted">{k.calls_30d.toLocaleString("en-US")} calls in 30 days</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-muted">No pilots yet. Issue a key with plan “trial” below when an institution starts one.</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[13px] font-semibold text-ink">Deals</p>
        {deals.length ? (
          <ul className="mt-2 divide-y divide-rule text-sm">
            {deals.slice(0, 25).map((d) => (
              <li key={d.id} className="flex flex-wrap items-baseline gap-x-3 py-2">
                <span className="text-[12px] text-muted">#{d.id}</span>
                <span className="font-semibold text-ink">{d.organisation}</span>
                <span className="text-ink-soft">{d.stage}</span>
                <span className="text-[12px] text-muted">
                  {d.product.replace(/_/g, " ")} · {d.segment.replace(/_/g, " ")}
                  {d.value_usd_month ? ` · est. ${usd(d.value_usd_month)}/mo` : ""}
                  {d.signed_at ? ` · signed ${d.signed_at}` : ""}
                  {d.next_step ? ` · next: ${d.next_step}${d.next_date ? ` (${d.next_date})` : ""}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">No deals logged yet.</p>
        )}
        <div className="mt-4">
          <SaveDeal />
        </div>
      </div>
    </section>
  );
}
