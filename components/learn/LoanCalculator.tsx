"use client";

import { useState } from "react";

const kes = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

function reducing(amount: number, yearly: number, months: number) {
  const i = yearly / 100 / 12;
  const payment = i === 0 ? amount / months : (amount * i) / (1 - Math.pow(1 + i, -months));
  return { payment, interest: payment * months - amount };
}

function flat(amount: number, yearly: number, months: number) {
  const interest = (amount * yearly * months) / 1200;
  return { payment: (amount + interest) / months, interest };
}

/** The reducing-balance yearly rate that costs the same as a flat rate (solved by bisection). */
function flatAsReducing(amount: number, yearly: number, months: number) {
  const target = flat(amount, yearly, months).payment;
  let lo = 0;
  let hi = 500;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (reducing(amount, mid, months).payment < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** A loan's monthly payment and total interest, flat versus reducing balance. Pure arithmetic, in the browser. */
export function LoanCalculator({ bankAverage }: { bankAverage: number | null }) {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(bankAverage ? Number(bankAverage.toFixed(2)) : 15);
  const [months, setMonths] = useState(12);

  const m = Math.max(1, Math.round(months));
  const r = reducing(amount, rate, m);
  const f = flat(amount, rate, m);
  const equivalent = amount > 0 && rate > 0 ? flatAsReducing(amount, rate, m) : 0;

  return (
    <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-[13px] text-muted">
          Amount borrowed
          <input type="number" min={0} step={1000} value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2 text-[15px] text-ink" />
        </label>
        <label className="text-[13px] text-muted">
          Rate a year (%)
          <input type="number" min={0} max={200} step={0.01} value={rate} onChange={(e) => setRate(Math.min(200, Math.max(0, Number(e.target.value))))} className="mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2 text-[15px] text-ink" />
        </label>
        <label className="text-[13px] text-muted">
          Months to repay
          <input type="number" min={1} max={360} value={months} onChange={(e) => setMonths(Math.min(360, Math.max(1, Number(e.target.value))))} className="mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2 text-[15px] text-ink" />
        </label>
      </div>
      <div className="mt-5 overflow-x-auto" aria-live="polite">
        <table className="data-table">
          <thead>
            <tr>
              <th>If the {rate.toFixed(2)}% is charged</th>
              <th className="text-right">Monthly payment</th>
              <th className="text-right">Total interest</th>
              <th className="text-right">Total repaid</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>On a reducing balance</td>
              <td className="text-right">{kes(r.payment)}</td>
              <td className="text-right font-semibold">{kes(r.interest)}</td>
              <td className="text-right">{kes(amount + r.interest)}</td>
            </tr>
            <tr>
              <td>Flat, on the full amount</td>
              <td className="text-right">{kes(f.payment)}</td>
              <td className="text-right font-semibold">{kes(f.interest)}</td>
              <td className="text-right">{kes(amount + f.interest)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-ink">
        A flat {rate.toFixed(2)}% costs the same as about <strong>{equivalent.toFixed(1)}%</strong> on a reducing balance.
        {bankAverage ? ` For comparison, Kenyan banks’ average lending rate is ${bankAverage.toFixed(2)}% (reducing balance).` : ""}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted">Fees, insurance and excise duty are extra. Ask the lender for the total you will repay. Information, not advice.</p>
    </div>
  );
}
