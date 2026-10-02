"use client";

import { useState } from "react";

/**
 * "Is my rate fair?" A saver or borrower types the rate they were offered and the amount; the verdict compares it
 * with the published benchmarks the page already shows — the government bill, the best fund after tax, the
 * Central Bank's averages for what banks pay and charge — and puts the gap in shillings. Arithmetic only.
 */
export type FairBench = {
  asOf: string;
  bill91Net: number; // after tax
  bill364Net: number;
  bill364Gross: number;
  bestFundNet: number;
  bestFundName: string;
  depositAvg: number; // CBK weighted average, gross
  savingsAvg: number;
  lendingAvg: number;
  overdraftAvg: number;
  cbr?: number | null;
};

const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
const pts = (n: number) => `${Math.abs(n).toFixed(1)} point${Math.abs(n).toFixed(1) === "1.0" ? "" : "s"}`;

export function FairRate({ bench, compact = false }: { bench: FairBench; compact?: boolean }) {
  const [mode, setMode] = useState<"save" | "borrow">("save");
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState("100000");
  const [place, setPlace] = useState<"bank" | "sacco" | "mmf" | "other">("bank");
  const r = parseFloat(rate);
  const a = parseFloat(amount.replace(/[^\d.]/g, ""));
  const ok = Number.isFinite(r) && r >= 0 && r < 200 && Number.isFinite(a) && a > 0;

  function verdict() {
    if (!ok) return null;
    if (mode === "save") {
      // What the saver keeps after 15% withholding tax, like every option on the page.
      const net = r * 0.85;
      const vsBill = net - bench.bill364Net;
      const vsFund = net - bench.bestFundNet;
      const vsAvg = r - bench.depositAvg;
      const yearGap = (a * (bench.bestFundNet - net)) / 100;
      let tone: "good" | "fair" | "poor";
      let head: string;
      if (net >= bench.bestFundNet - 0.5) {
        tone = "good";
        head = "That is as good as the best published option.";
      } else if (net >= bench.bill91Net - 0.5) {
        tone = "fair";
        head = "Fair: close to what the government itself pays.";
      } else {
        tone = "poor";
        head = "Below what the government pays to borrow the same money.";
      }
      return {
        tone,
        head,
        lines: [
          `${r.toFixed(2)}% is ${net.toFixed(2)}% after 15% withholding tax. The 364-day Treasury bill keeps ${bench.bill364Net.toFixed(2)}% (${vsBill >= 0 ? "you are" : "you are"} ${pts(vsBill)} ${vsBill >= 0 ? "above" : "below"} it); the best published fund, ${bench.bestFundName}, keeps ${bench.bestFundNet.toFixed(2)}% (${pts(vsFund)} ${vsFund >= 0 ? "above" : "below"}).`,
          `Banks on average pay ${bench.depositAvg.toFixed(2)}% on deposits and ${bench.savingsAvg.toFixed(2)}% on savings (Central Bank of Kenya, ${bench.asOf}); your rate is ${pts(vsAvg)} ${vsAvg >= 0 ? "above" : "below"} the deposit average.`,
          yearGap > 0
            ? `On KES ${fmt(a)} for a year, the best published option would leave you KES ${fmt(yearGap)} better off than this rate.`
            : `On KES ${fmt(a)} for a year, this rate beats the best published option by about KES ${fmt(-yearGap)}.`,
        ],
      };
    }
    const vsLend = r - bench.lendingAvg;
    const vsBill = r - bench.bill364Gross;
    const yearCost = (a * r) / 100;
    const avgCost = (a * bench.lendingAvg) / 100;
    let tone: "good" | "fair" | "poor";
    let head: string;
    if (r <= bench.lendingAvg - 1) {
      tone = "good";
      head = "Better than the average bank loan.";
    } else if (r <= bench.lendingAvg + 2) {
      tone = "fair";
      head = "About what banks charge on average.";
    } else if (r <= bench.lendingAvg + 8) {
      tone = "poor";
      head = "Expensive against the bank average.";
    } else {
      tone = "poor";
      head = "Far above what any bank charges on average — compare before signing.";
    }
    return {
      tone,
      head,
      lines: [
        `Banks charged ${bench.lendingAvg.toFixed(2)}% a year on average in ${bench.asOf} (Central Bank of Kenya); your ${r.toFixed(2)}% is ${pts(vsLend)} ${vsLend >= 0 ? "above" : "below"} that. The government itself borrows at ${bench.bill364Gross.toFixed(2)}% for a year, so your lender's margin over the risk-free rate is ${pts(vsBill)}.`,
        `On KES ${fmt(a)} for a year, ${r.toFixed(2)}% costs about KES ${fmt(yearCost)} in interest; the bank average would cost KES ${fmt(avgCost)} — a difference of KES ${fmt(Math.abs(yearCost - avgCost))} ${yearCost > avgCost ? "more" : "less"}.`,
        place === "sacco"
          ? "SACCO loans usually quote a rate on the reducing balance and pay a dividend on your shares; compare the all-in cost, including any fees, with the bank average above."
          : "Check whether the rate is on the reducing balance or flat: a flat 10% on a one-year loan is roughly 18% on the reducing balance.",
      ],
    };
  }
  const v = verdict();
  const field = "rounded-xl border border-rule bg-surface px-3 py-2.5 text-[15px] text-ink outline-none focus:border-accent";
  const toneClass = v?.tone === "good" ? "border-up/40" : v?.tone === "fair" ? "border-rule" : "border-down/40";

  return (
    <div className={compact ? "" : "rounded-2xl border border-rule bg-surface px-5 py-5 sm:px-6"}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">Is my rate fair?</h2>
        <p className="text-[12px] text-muted">Against the published benchmarks · information, not advice</p>
      </div>
      <div className="mt-3 flex gap-2">
        {(["save", "borrow"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${mode === m ? "bg-ink text-paper" : "border border-rule text-ink-soft hover:border-accent"}`}>
            {m === "save" ? "I’m saving" : "I’m borrowing"}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-[12px] font-medium text-muted">{mode === "save" ? "Rate offered, % a year" : "Rate charged, % a year"}</span>
          <input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder={mode === "save" ? "e.g. 7" : "e.g. 16"} className={`mt-1 w-full ${field}`} />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-muted">Amount, KES</span>
          <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} className={`mt-1 w-full ${field}`} />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-muted">{mode === "save" ? "Where" : "From"}</span>
          <select value={place} onChange={(e) => setPlace(e.target.value as typeof place)} className={`mt-1 w-full ${field}`}>
            <option value="bank">A bank</option>
            <option value="sacco">A SACCO</option>
            {mode === "save" ? <option value="mmf">A money market fund</option> : <option value="other">A digital lender / other</option>}
          </select>
        </label>
      </div>
      {v ? (
        <div className={`mt-4 rounded-xl border px-4 py-4 ${toneClass}`} aria-live="polite">
          <p className="font-serif text-2xl text-ink">{v.head}</p>
          <div className="mt-2 space-y-2 text-[15px] leading-7 text-ink-soft">
            {v.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-[13px] text-muted">Type the rate you were offered and the amount. Benchmarks: 364-day bill {bench.bill364Gross.toFixed(2)}%, best published fund {bench.bestFundNet.toFixed(2)}% after tax, bank deposit average {bench.depositAvg.toFixed(2)}%, bank lending average {bench.lendingAvg.toFixed(2)}% ({bench.asOf}).</p>
      )}
    </div>
  );
}
