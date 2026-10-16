"use client";

import { useState } from "react";
import { loanCost, type RateBasis, type RateUnit } from "@/lib/loan-calc";

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const num = (s: string) => Math.max(0, Number(s.replace(/[^\d.]/g, "")) || 0);
const pct = (n: number) => `${n.toFixed(1)}%`;

/**
 * What a loan quote really costs: the interest method (flat or reducing) and the fees, turned into one true yearly
 * rate, and set against the same loan at the banks' average lending rate published by the CBK.
 */
export function LoanCalculator({ benchmark }: { benchmark: { rate: number; month: string; source: string } | null }) {
  const [amount, setAmount] = useState("100000");
  const [rate, setRate] = useState("14");
  const [unit, setUnit] = useState<RateUnit>("year");
  const [basis, setBasis] = useState<RateBasis>("flat");
  const [months, setMonths] = useState("12");
  const [upfront, setUpfront] = useState("");
  const [monthlyFees, setMonthlyFees] = useState("");

  const input = { amount: num(amount), rate: num(rate), unit, basis, months: num(months), upfrontFees: num(upfront), monthlyFees: num(monthlyFees) };
  const r = loanCost(input);
  const bench = benchmark ? loanCost({ amount: input.amount, rate: benchmark.rate, unit: "year", basis: "reducing", months: input.months }) : null;
  const quoted = `${num(rate)}% a ${unit} ${basis === "flat" ? "flat" : "on the reducing balance"}`;
  const n = Math.max(1, Math.round(input.months));

  const share =
    `A ${kes(input.amount)} loan at ${quoted} over ${n} months really costs ${pct(r.apr)} a year, all fees in: ${kes(r.payment)} a month, ${kes(r.totalCost)} in total. ` +
    `Check yours: https://www.afronomicsfeed.com/rates/kenya/loan-cost?utm_source=whatsapp&utm_medium=share&utm_campaign=loan-calc`;

  const field = "mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] text-ink";
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <section aria-labelledby="loan-in" className="rounded-2xl border border-rule bg-surface px-5 py-5 lg:col-span-2">
        <h2 id="loan-in" className="t-h2 text-ink">
          The loan you were offered
        </h2>
        <label className="mt-3 block text-[13px] text-ink-soft">
          Amount borrowed (KES)
          <input className={field} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-[13px] text-ink-soft">
            Interest rate (%)
            <input className={field} inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
          </label>
          <label className="text-[13px] text-ink-soft">
            Per
            <select className={field} value={unit} onChange={(e) => setUnit(e.target.value as RateUnit)}>
              <option value="year">Year</option>
              <option value="month">Month</option>
            </select>
          </label>
        </div>
        <div className="no-print mt-3 inline-flex rounded-full border border-rule p-1 text-[13px]" role="group" aria-label="How the interest is charged">
          {(
            [
              ["flat", "Flat rate"],
              ["reducing", "Reducing balance"],
            ] as const
          ).map(([b, label]) => (
            <button
              key={b}
              type="button"
              aria-pressed={basis === b}
              onClick={() => setBasis(b)}
              className={`min-h-11 rounded-full px-3 font-semibold sm:min-h-9 ${basis === b ? "bg-ink text-paper" : "text-ink-soft hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[12px] text-muted">
          Flat: interest on the full amount for the whole term. Reducing: interest only on what you still owe. Not sure? Ask the lender which one; it is
          the biggest difference in cost.
        </p>
        <label className="mt-3 block text-[13px] text-ink-soft">
          Months to repay
          <input className={field} inputMode="numeric" value={months} onChange={(e) => setMonths(e.target.value)} />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="text-[13px] text-ink-soft">
            Fees at the start (KES)
            <input className={field} inputMode="numeric" placeholder="0" value={upfront} onChange={(e) => setUpfront(e.target.value)} />
          </label>
          <label className="text-[13px] text-ink-soft">
            Fees every month (KES)
            <input className={field} inputMode="numeric" placeholder="0" value={monthlyFees} onChange={(e) => setMonthlyFees(e.target.value)} />
          </label>
        </div>
        <p className="mt-1 text-[12px] text-muted">Processing, appraisal, legal and insurance charges, and any duty on them, as your loan offer lists them.</p>
      </section>

      <section aria-labelledby="loan-out" className="rounded-2xl border border-rule bg-surface px-5 py-5 lg:col-span-3">
        <h2 id="loan-out" className="sr-only">
          What it really costs
        </h2>
        <p className="text-[13px] text-muted">True yearly rate, all costs in</p>
        <p data-num className="af-figure tabular text-[2rem] font-semibold leading-tight text-ink">
          {pct(r.apr)}
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">
          Quoted as {quoted}. Compounded, {pct(r.effective)}.
        </p>

        <dl className="mt-4 divide-y divide-rule text-[14px]">
          {[
            ["You pay each month", r.payment],
            ["You receive", r.received],
            ["Interest", r.totalInterest],
            ["Fees", r.totalFees],
            ["You pay back in total", r.totalRepaid],
          ].map(([label, v]) => (
            <div key={label as string} className="flex items-baseline justify-between gap-4 py-2">
              <dt className="text-ink">{label}</dt>
              <dd data-num className="tabular shrink-0 whitespace-nowrap text-ink">
                {kes(v as number)}
              </dd>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 py-2 font-semibold">
            <dt className="text-ink">The loan costs you</dt>
            <dd data-num className="tabular shrink-0 whitespace-nowrap text-ink">
              {kes(r.totalCost)}
            </dd>
          </div>
        </dl>

        {bench && benchmark ? (
          <div className="mt-4 rounded-xl border border-rule px-3 py-3 text-[13px]">
            <p className="text-muted">
              The same {kes(input.amount)} over {n} months at the banks’ average lending rate ({benchmark.rate.toFixed(2)}% a year, reducing, CBK,{" "}
              {benchmark.month}), before fees
            </p>
            <p className="mt-1 text-ink">
              <span data-num className="tabular font-semibold">
                {kes(bench.totalCost)}
              </span>{" "}
              in interest, {kes(bench.payment)} a month.{" "}
              {r.totalCost > bench.totalCost ? (
                <>
                  Your offer costs{" "}
                  <span data-num className="tabular font-semibold">
                    {kes(r.totalCost - bench.totalCost)}
                  </span>{" "}
                  more.
                </>
              ) : (
                <>Your offer costs no more than that.</>
              )}
            </p>
          </div>
        ) : null}

        <details className="mt-4 text-[13px]">
          <summary className="cursor-pointer font-semibold text-ink">Month by month</summary>
          <div className="table-box mt-2 max-h-80 overflow-auto" tabIndex={0} role="region" aria-label="Repayment schedule (scrolls)">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="text-right">Payment</th>
                  <th className="text-right">Interest</th>
                  <th className="text-right">Still owed</th>
                </tr>
              </thead>
              <tbody>
                {r.schedule.slice(0, 360).map((s) => (
                  <tr key={s.month}>
                    <th scope="row">{s.month}</th>
                    <td data-num className="text-right">{Math.round(s.payment + num(monthlyFees)).toLocaleString("en-US")}</td>
                    <td data-num className="text-right">{Math.round(s.interest).toLocaleString("en-US")}</td>
                    <td data-num className="text-right">{Math.round(s.balance).toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {basis === "flat" ? <p className="mt-2 text-[12px] text-muted">On a flat rate the interest stays the same every month, even as what you owe falls.</p> : null}
        </details>

        <div className="no-print mt-4 flex flex-wrap gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(share)}`}
            target="_blank"
            rel="noopener noreferrer"
            data-track="share"
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
