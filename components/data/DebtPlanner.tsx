"use client";

import { useState } from "react";
import { comparePlans, monthlyRate, type Charge, type Debt, type PlanResult } from "@/lib/debt-plan";
import type { DebtPreset } from "@/lib/debt-presets";

type Row = { id: number; name: string; preset: string; balance: string; rate: string; minimum: string };

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const num = (s: string) => Math.max(0, Number(s.replace(/[^\d.]/g, "")) || 0);
const months = (n: number) => (n < 12 ? `${n} month${n === 1 ? "" : "s"}` : `${Math.floor(n / 12)} yr${n >= 24 ? "s" : ""}${n % 12 ? ` ${n % 12} mo` : ""}`);
const STRATEGY: Record<PlanResult["strategy"], string> = {
  costliest: "Costliest first",
  smallest: "Smallest first",
  minimums: "Minimums only",
};

/**
 * Every debt in one place, and one monthly budget; out, the order to clear them and what each way costs. The custom
 * rows take "% a month" (mobile loans, chamas, shops) or "% a year" (banks, SACCOs: divided by 12).
 */
export function DebtPlanner({ presets, initial, initialBudget }: { presets: DebtPreset[]; initial: Omit<Row, "id">[]; initialBudget: number }) {
  const [rows, setRows] = useState<Row[]>(initial.map((r, i) => ({ ...r, id: i + 1 })));
  const [budget, setBudget] = useState(String(initialBudget));
  const nextId = Math.max(0, ...rows.map((r) => r.id)) + 1;

  const chargeOf = (r: Row): Charge => {
    const p = presets.find((x) => x.id === r.preset);
    if (p?.charge) return p.charge;
    return { kind: "monthly", pct: r.preset === "year" ? num(r.rate) / 12 : num(r.rate) };
  };
  const debts: Debt[] = rows.map((r) => ({ name: r.name || "Debt", balance: num(r.balance), charge: chargeOf(r), minimum: num(r.minimum) }));
  const plans = comparePlans(debts, num(budget));
  const best = plans[0];
  const minimums = plans.find((p) => p.strategy === "minimums");
  const total = debts.reduce((n, d) => n + d.balance, 0);
  const minSum = debts.reduce((n, d) => n + (d.balance > 0 ? d.minimum : 0), 0);
  const firstCharges = debts.reduce((n, d) => n + (d.balance > 0 ? (monthlyRate(d.charge, d.balance) * d.balance) / 100 : 0), 0);
  const ranked = debts.map((d, i) => ({ d, i, rate: monthlyRate(d.charge, d.balance) })).filter((x) => x.d.balance > 0).sort((a, b) => b.rate - a.rate);

  const set = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const share = best?.feasible
    ? `I owe ${kes(total)} across ${debts.filter((d) => d.balance > 0).length} loans. Paying ${kes(num(budget))} a month, costliest first, I'm debt-free in ${months(best.months ?? 0)}. Plan yours: https://www.afronomicsfeed.com/rates/kenya/debt-plan?utm_source=whatsapp&utm_medium=share&utm_campaign=debt-plan`
    : `What does carrying Fuliza and mobile loans really cost? Plan yours: https://www.afronomicsfeed.com/rates/kenya/debt-plan?utm_source=whatsapp&utm_medium=share&utm_campaign=debt-plan`;

  const field = "mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] text-ink";
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <section aria-labelledby="debts-in" className="min-w-0 rounded-2xl border border-rule bg-surface px-5 py-5 lg:col-span-2">
        <h2 id="debts-in" className="t-h2 text-ink">
          What you owe
        </h2>
        <ol className="mt-3 space-y-4">
          {rows.map((r, n) => {
            const preset = presets.find((p) => p.id === r.preset);
            return (
              <li key={r.id} className="rounded-xl border border-rule bg-paper px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold text-ink">Debt {n + 1}</p>
                  {rows.length > 1 ? (
                    <button type="button" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} className="min-h-11 px-2 text-[12px] font-semibold text-forest underline underline-offset-2">
                      Remove
                    </button>
                  ) : null}
                </div>
                <label className="block text-[13px] text-ink-soft">
                  Kind
                  <select
                    className={field}
                    value={r.preset}
                    onChange={(e) => {
                      const p = presets.find((x) => x.id === e.target.value);
                      set(r.id, { preset: e.target.value, name: p?.charge ? p.label : r.name });
                    }}
                  >
                    {presets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </label>
                {preset?.note ? <p className="mt-1 text-[11.5px] leading-4 text-muted">{preset.note}</p> : null}
                {!preset?.charge ? (
                  <label className="mt-2 block text-[13px] text-ink-soft">
                    Name
                    <input className={field} value={r.name} onChange={(e) => set(r.id, { name: e.target.value.slice(0, 30) })} />
                  </label>
                ) : null}
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="block min-w-0 text-[13px] text-ink-soft">
                    Still owed (KES)
                    <input className={field} inputMode="numeric" value={r.balance} onChange={(e) => set(r.id, { balance: e.target.value })} />
                  </label>
                  <label className="block min-w-0 text-[13px] text-ink-soft">
                    Must pay a month
                    <input className={field} inputMode="numeric" placeholder="0" value={r.minimum} onChange={(e) => set(r.id, { minimum: e.target.value })} />
                  </label>
                </div>
                {!preset?.charge ? (
                  <label className="mt-2 block text-[13px] text-ink-soft">
                    Interest rate (% {r.preset === "year" ? "a year" : "a month"})
                    <input className={field} inputMode="decimal" value={r.rate} onChange={(e) => set(r.id, { rate: e.target.value })} />
                  </label>
                ) : null}
              </li>
            );
          })}
        </ol>
        {rows.length < 8 ? (
          <button
            type="button"
            onClick={() => setRows((rs) => [...rs, { id: nextId, name: "Loan", preset: "month", balance: "", rate: "", minimum: "" }])}
            className="mt-3 inline-flex min-h-11 items-center rounded-full border border-rule px-4 text-[13px] font-semibold text-ink hover:border-accent"
          >
            Add a debt
          </button>
        ) : null}
        <label className="mt-5 block text-[13px] font-semibold text-ink">
          What you can pay in total each month (KES)
          <input className={field} inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </label>
        <p className="mt-1 text-[12px] text-muted">
          The minimums add up to {kes(minSum)}. This month the charges alone come to about {kes(firstCharges)}.
        </p>
      </section>

      <section aria-labelledby="debts-out" className="min-w-0 rounded-2xl border border-rule bg-surface px-5 py-5 lg:col-span-3" aria-live="polite">
        <h2 id="debts-out" className="sr-only">
          Your plan
        </h2>
        {!total ? (
          <p className="text-[15px] text-ink-soft">Put in what you still owe on each debt to see your plan.</p>
        ) : best?.feasible ? (
          <>
            <p className="text-[13px] text-muted">Paying {kes(num(budget))} a month, {STRATEGY[best.strategy].toLowerCase()}</p>
            <p data-num className="af-figure tabular text-[2rem] font-semibold leading-tight text-ink">
              Debt-free in {months(best.months ?? 0)}
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">
              {kes(total)} owed today; {kes(best.totalCharges)} in charges on the way.
            </p>
          </>
        ) : (
          <>
            <p className="text-[13px] text-muted">Paying {kes(num(budget))} a month</p>
            <p className="af-figure text-[1.6rem] font-semibold leading-tight text-down">This budget never clears these debts</p>
            <p className="mt-1 text-[13px] text-ink-soft">
              {best?.shortOfMinimums
                ? `It is below the minimum payments (${kes(minSum)}).`
                : `The charges grow faster than the payments. Try a larger amount, or clear the costliest debt first with any lump sum.`}
            </p>
          </>
        )}

        {ranked.length ? (
          <>
            <h3 className="mt-5 text-[13px] font-semibold text-ink">Pay off in this order (costliest first)</h3>
            <ol className="mt-1 divide-y divide-rule text-[14px]">
              {ranked.map(({ d, rate }, k) => {
                const cleared = plans.find((p) => p.strategy === "costliest")?.cleared.find((c) => c.name === d.name);
                return (
                  <li key={`${d.name}-${k}`} className="flex items-baseline justify-between gap-4 py-2">
                    <span className="min-w-0">
                      <span className="text-ink">
                        {k + 1}. {d.name}
                      </span>
                      <span className="block text-[11.5px] text-muted">
                        costs {rate.toFixed(1)}% of the balance this month · {kes(d.balance)}
                      </span>
                    </span>
                    <span data-num className="tabular shrink-0 text-right text-[13px] text-ink-soft">
                      {cleared ? `gone in ${months(cleared.month)}` : "—"}
                    </span>
                  </li>
                );
              })}
            </ol>
          </>
        ) : null}

        {total ? (
          <div className="table-box mt-5 overflow-x-auto" tabIndex={0} role="region" aria-label="Three ways to pay compared (scrolls sideways)">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Way to pay</th>
                  <th className="text-right">Debt-free in</th>
                  <th className="text-right">Charges paid</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p.strategy}>
                    <th scope="row">{STRATEGY[p.strategy]}</th>
                    <td data-num className="text-right">
                      {p.feasible ? months(p.months ?? 0) : "never"}
                    </td>
                    <td data-num className="text-right">
                      {p.feasible ? kes(p.totalCharges) : "keeps growing"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {minimums && !minimums.feasible && best?.feasible ? (
          <p className="mt-3 text-[13px] text-ink-soft">
            Paying only the minimums, {debts.some((d) => d.balance > 0 && !d.minimum) ? "a debt with no set payment, like Fuliza, never ends" : "the charges keep the debt alive"}. Your plan
            ends it in {months(best.months ?? 0)}.
          </p>
        ) : null}
        <p className="mt-3 text-[12px] text-muted">
          A guide, not a statement: lenders add late fees and roll-over charges that are not counted here, and a mobile loan or Fuliza balance usually
          has to be cleared within 30 days. Your loan agreement decides what you owe.
        </p>

        <div className="no-print mt-4 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(share)}`}
            target="_blank"
            rel="noopener noreferrer"
            data-track="share"
            data-network="whatsapp"
            className="inline-flex min-h-11 items-center rounded-full bg-ink px-4 text-[13px] font-semibold text-paper hover:bg-forest"
          >
            Share on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(share)}
            className="inline-flex min-h-11 items-center rounded-full border border-rule px-4 text-[13px] font-semibold text-ink hover:border-accent"
          >
            Copy the result
          </button>
        </div>
      </section>
    </div>
  );
}
