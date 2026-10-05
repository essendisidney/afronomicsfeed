"use client";

import { useState } from "react";
import { ui, type LearnLang } from "@/lib/learn-ui";

type Preset = { label: string; rate: number };

export type SavingsLabels = { saveMonthly: string; years: string; rate: string; youWillHave: string; youPutIn: string; interest: string; savingsFoot: string };

const english: SavingsLabels = {
  saveMonthly: "Save each month",
  years: "For how many years",
  rate: "Rate a year, after tax (%)",
  youWillHave: "You will have",
  youPutIn: "You put in",
  interest: "Interest earned",
  savingsFoot: "Holds one rate for the whole period and adds interest monthly; real rates move. Information, not advice.",
};

const kes = (n: number) => Math.round(n).toLocaleString("en-GB");

/** Regular monthly saving, interest added monthly at a steady yearly rate (after tax). Pure arithmetic, in the browser. */
export function SavingsCalculator({ presets, lang }: { presets: Preset[]; lang?: LearnLang }) {
  const labels: SavingsLabels = lang ? ui[lang].calc : english;
  const [monthly, setMonthly] = useState(1000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(presets[0]?.rate ?? 8);

  const n = Math.max(0, Math.round(years * 12));
  const i = rate / 100 / 12;
  const total = i === 0 ? monthly * n : monthly * ((Math.pow(1 + i, n) - 1) / i);
  const paidIn = monthly * n;

  return (
    <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="text-[13px] text-muted">
          {labels.saveMonthly}
          <input type="number" min={0} step={100} value={monthly} onChange={(e) => setMonthly(Math.max(0, Number(e.target.value)))} className="mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2 text-[15px] text-ink" />
        </label>
        <label className="text-[13px] text-muted">
          {labels.years}
          <input type="number" min={1} max={40} value={years} onChange={(e) => setYears(Math.min(40, Math.max(1, Number(e.target.value))))} className="mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2 text-[15px] text-ink" />
        </label>
        <label className="text-[13px] text-muted">
          {labels.rate}
          <input type="number" min={0} max={40} step={0.01} value={rate} onChange={(e) => setRate(Math.min(40, Math.max(0, Number(e.target.value))))} className="mt-1 w-full rounded-xl border border-rule bg-paper px-3 py-2 text-[15px] text-ink" />
        </label>
      </div>
      {presets.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button key={p.label} type="button" onClick={() => setRate(Number(p.rate.toFixed(2)))} className={`rounded-full border px-3 py-1 text-[13px] ${Math.abs(rate - p.rate) < 0.005 ? "border-forest text-forest" : "border-rule text-ink-soft hover:border-gold"}`}>
              {p.label}: {p.rate.toFixed(2)}%
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-5 grid gap-px overflow-hidden rounded-xl bg-rule sm:grid-cols-3" aria-live="polite">
        {[
          { k: labels.youWillHave, v: kes(total) },
          { k: labels.youPutIn, v: kes(paidIn) },
          { k: labels.interest, v: kes(total - paidIn) },
        ].map((x) => (
          <div key={x.k} className="bg-paper-2 px-4 py-3">
            <p className="text-[12px] text-muted">{x.k}</p>
            <p className="font-serif text-2xl text-ink">{x.v}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">{labels.savingsFoot}</p>
    </div>
  );
}
