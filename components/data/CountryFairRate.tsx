"use client";

import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/track";
import { FollowUp } from "@/components/ui/FollowUp";
import type { CountryBench } from "@/lib/data/west-africa-rates";

/**
 * "Is my rate fair?" for Nigeria and Ghana: the rate a saver or borrower was offered, against the government's
 * own borrowing rate and the central bank's averages for what banks pay and charge, with the gap in local
 * currency. Arithmetic only; rates are compared before tax, as each publisher states them.
 */
const fmt = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));
const pts = (n: number) => `${Math.abs(n).toFixed(1)} point${Math.abs(n).toFixed(1) === "1.0" ? "" : "s"}`;

export function CountryFairRate({ bench }: { bench: CountryBench }) {
  const [mode, setMode] = useState<"save" | "borrow">("save");
  const [rate, setRate] = useState("");
  const [amount, setAmount] = useState(bench.currency === "NGN" ? "500000" : "10000");
  const r = parseFloat(rate);
  const a = parseFloat(amount.replace(/[^\d.]/g, ""));
  const ok = Number.isFinite(r) && r >= 0 && r < 300 && Number.isFinite(a) && a > 0;
  const money = (x: number) => `${bench.money}${fmt(x)}`;
  const best = bench.save[0];
  const shortBill = [...bench.save].filter((b) => b.label.includes("Treasury bill")).sort((x, y) => x.rate - y.rate)[0];

  function verdict() {
    if (!ok) return null;
    if (mode === "save") {
      const floor = shortBill?.rate ?? bench.savingsAvg;
      const tone = r >= best.rate - 0.5 ? "good" : r >= floor - 0.5 ? "fair" : "poor";
      const head =
        tone === "good" ? "As good as the best published option." : tone === "fair" ? "Fair: close to what the government itself pays." : "Below what the government pays to borrow the same money.";
      const gap = (a * (best.rate - r)) / 100;
      const vsAvg = r - bench.savingsAvg;
      return {
        tone,
        head,
        lines: [
          `The best published option here is the ${best.label} at ${best.rate.toFixed(2)}% (${best.note}); your ${r.toFixed(2)}% is ${pts(r - best.rate)} ${r >= best.rate ? "above" : "below"} it.`,
          `Banks paid ${bench.savingsAvg.toFixed(2)}% on savings deposits on average (${bench.bankSource.publisher}, ${bench.asOf}); you are ${pts(vsAvg)} ${vsAvg >= 0 ? "above" : "below"} that.`,
          gap > 0
            ? `On ${money(a)} for a year, ${best.rate.toFixed(2)}% would earn about ${money(gap)} more than ${r.toFixed(2)}%, before tax.`
            : `On ${money(a)} for a year, your rate earns about ${money(-gap)} more than the best published option, before tax.`,
        ],
      };
    }
    const ref = bench.lendRef.rate;
    const top = bench.lendTop?.rate;
    let tone: "good" | "fair" | "poor";
    let head: string;
    if (top != null) {
      tone = r <= ref + 1 ? "good" : r <= top ? "fair" : "poor";
      head = tone === "good" ? "Close to what banks charge their best borrowers." : tone === "fair" ? "Within the range banks charge." : "Above the top of what banks charge on average — compare before signing.";
    } else {
      tone = r <= ref - 1 ? "good" : r <= ref + 2 ? "fair" : "poor";
      head = tone === "good" ? "Better than the average bank loan." : tone === "fair" ? "About what banks charge on average." : r <= ref + 8 ? "Expensive against the bank average." : "Far above what banks charge on average — compare before signing.";
    }
    const cost = (a * r) / 100;
    const refCost = (a * ref) / 100;
    return {
      tone,
      head,
      lines: [
        `${bench.lendRef.label}: ${ref.toFixed(2)}% (${bench.lendRef.note})${top != null ? `; ${bench.lendTop!.label.toLowerCase()}: ${top.toFixed(2)}%` : ""}. Your ${r.toFixed(2)}% is ${pts(r - ref)} ${r >= ref ? "above" : "below"} the ${top != null ? "prime rate" : "average"}.`,
        `On ${money(a)} for a year, ${r.toFixed(2)}% costs about ${money(cost)} in interest; at ${ref.toFixed(2)}% it would be ${money(refCost)}.`,
        "Check whether the rate is on the reducing balance or flat, and ask for every fee: a flat rate or upfront fees can make a loan cost far more than its headline rate.",
      ],
    };
  }

  const v = verdict();
  // Count one rate check per visit, once a verdict is shown (after the reader has stopped typing for a moment).
  const counted = useRef(false);
  const shown = Boolean(v);
  useEffect(() => {
    if (!shown || counted.current) return;
    const t = window.setTimeout(() => {
      counted.current = true;
      track("rate_check");
    }, 1500);
    return () => window.clearTimeout(t);
  }, [shown, rate]);
  const field = "rounded-xl border border-rule bg-surface px-3 py-2.5 text-[15px] text-ink outline-none focus:border-accent";
  const toneClass = v?.tone === "good" ? "border-up/40" : v?.tone === "fair" ? "border-rule" : "border-down/40";
  return (
    <div className="rounded-2xl border border-rule bg-surface px-5 py-5 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">Is my rate fair? · {bench.country}</h2>
        <p className="text-[12px] text-muted">Against the published benchmarks · information, not advice</p>
      </div>
      <div className="mt-3 flex gap-2">
        {(["save", "borrow"] as const).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${mode === m ? "bg-ink text-paper" : "border border-rule text-ink-soft hover:border-accent"}`}>
            {m === "save" ? "I’m saving" : "I’m borrowing"}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-[12px] font-medium text-muted">{mode === "save" ? "Rate offered, % a year" : "Rate charged, % a year"}</span>
          <input inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} placeholder={mode === "save" ? "e.g. 8" : "e.g. 30"} className={`mt-1 w-full ${field}`} />
        </label>
        <label className="block">
          <span className="text-[12px] font-medium text-muted">Amount, {bench.currency}</span>
          <input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} className={`mt-1 w-full ${field}`} />
        </label>
      </div>
      {v ? (
        <>
          <div className={`mt-4 rounded-xl border px-4 py-4 ${toneClass}`} aria-live="polite">
          <p className="font-serif text-2xl text-ink">{v.head}</p>
          <div className="mt-2 space-y-2 text-[15px] leading-7 text-ink-soft">
            {v.lines.map((l) => (
              <p key={l}>{l}</p>
            ))}
          </div>
          </div>
          {bench.currency === "NGN" ? (
            <FollowUp
              heading="Rates move every month. Keep up"
              alert="ng_savings_bond"
              alertTitle="Each month: Nigeria’s new FGN Savings Bond rates"
              alertNote="One short email when the DMO publishes the new offer, with the rates and dates."
            />
          ) : (
            <FollowUp
              heading="Rates move every month. Keep up"
              alert="policy_change"
              alertTitle="When a central bank changes its rate"
              alertNote="One short email when the Bank of Ghana, the CBN or another central bank we follow moves its policy rate."
            />
          )}
        </>
      ) : (
        <p className="mt-3 text-[13px] text-muted">
          Type the rate you were offered and the amount. Best published saving option: {best.label} {best.rate.toFixed(2)}%. Banks&rsquo; average savings rate{" "}
          {bench.savingsAvg.toFixed(2)}%; {bench.lendRef.label.toLowerCase()} {bench.lendRef.rate.toFixed(2)}% ({bench.asOf}).
        </p>
      )}
    </div>
  );
}
