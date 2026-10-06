"use client";

import { useState } from "react";
import { ShareResult } from "@/components/ui/ShareResult";
import { flat, flatAsReducing, reducing } from "@/lib/learn-calc";
import { calcUi, shareUi, type LearnLang } from "@/lib/learn-ui";
import { whole } from "@/lib/share";

const kes = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

/** A loan's monthly payment and total interest, flat versus reducing balance. Pure arithmetic, in the browser. */
export function LoanCalculator({ bankAverage, lang }: { bankAverage: number | null; lang?: LearnLang }) {
  const labels = calcUi(lang ?? "en");
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(bankAverage ? Number(bankAverage.toFixed(2)) : 15);
  const [months, setMonths] = useState(12);

  const m = Math.max(1, Math.round(months));
  const r = reducing(amount, rate, m);
  const f = flat(amount, rate, m);
  const equivalent = amount > 0 && rate > 0 ? flatAsReducing(amount, rate, m) : 0;
  const shareLang = lang ?? "en";
  const t = shareUi[shareLang];
  const spec = { kind: "loan", amount: Math.min(1e9, Math.round(amount)), rate: Math.round(rate * 100) / 100, months: m, lang: shareLang } as const;
  const shareText = `${t.loanText(whole(spec.amount), String(spec.rate), String(spec.months), whole(reducing(spec.amount, spec.rate, m).interest), whole(flat(spec.amount, spec.rate, m).interest))} ${t.tryOwn}`;

  return (
    <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-[13px] text-muted">
          {labels.amount}
          <input type="number" min={0} step={1000} value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2 text-[15px] text-ink" />
        </label>
        <label className="text-[13px] text-muted">
          {labels.loanRate}
          <input type="number" min={0} max={200} step={0.01} value={rate} onChange={(e) => setRate(Math.min(200, Math.max(0, Number(e.target.value))))} className="mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2 text-[15px] text-ink" />
        </label>
        <label className="text-[13px] text-muted">
          {labels.months}
          <input type="number" min={1} max={360} value={months} onChange={(e) => setMonths(Math.min(360, Math.max(1, Number(e.target.value))))} className="mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2 text-[15px] text-ink" />
        </label>
      </div>
      <div className="mt-5 overflow-x-auto" aria-live="polite">
        <table className="data-table">
          <thead>
            <tr>
              <th>{labels.ifCharged(rate.toFixed(2))}</th>
              <th className="text-right">{labels.monthly}</th>
              <th className="text-right">{labels.totalInterest}</th>
              <th className="text-right">{labels.totalRepaid}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{labels.reducing}</td>
              <td className="text-right">{kes(r.payment)}</td>
              <td className="text-right font-semibold">{kes(r.interest)}</td>
              <td className="text-right">{kes(amount + r.interest)}</td>
            </tr>
            <tr>
              <td>{labels.flat}</td>
              <td className="text-right">{kes(f.payment)}</td>
              <td className="text-right font-semibold">{kes(f.interest)}</td>
              <td className="text-right">{kes(amount + f.interest)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-ink">
        {labels.equivalent(rate.toFixed(2), equivalent.toFixed(1))}
        {bankAverage ? ` For comparison, Kenyan banks’ average lending rate is ${bankAverage.toFixed(2)}% (reducing balance).` : ""}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted">{labels.loanFoot}</p>
      {amount > 0 ? <ShareResult spec={spec} text={shareText} lang={shareLang} /> : null}
    </div>
  );
}
