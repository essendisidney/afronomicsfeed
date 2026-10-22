"use client";

import { useState } from "react";
import { FoundLine } from "@/components/data/FoundLine";
import { foundLoan, foundSlug, type FulizaTariff, type LoanProduct } from "@/lib/found";

const num = (s: string) => Number(s.replace(/[^\d.]/g, ""));

/**
 * Mobile loans (/rates/kenya/mobile-loans): the reader picks the loan they use, the amount, the days and how many
 * loans a year; the line sets it against the cheapest loan we hold with a fixed published charge for the same amount
 * and days (lib/found.ts foundLoan). Arithmetic on the providers' own published charges only.
 */
export function MobileLoanFound({ products, fuliza }: { products: LoanProduct[]; fuliza: FulizaTariff }) {
  const [product, setProduct] = useState("");
  const [amount, setAmount] = useState("5000");
  const [days, setDays] = useState("30");
  const [times, setTimes] = useState("6");
  const maxDays = Math.max(...products.map((p) => p.days), 1);
  const a = num(amount);
  const d = Math.round(num(days));
  const t = Math.round(num(times));
  const result = product ? foundLoan({ tool: "mobile_loans", product, amount: a, days: d, times: t, products, fuliza }) : null;
  const field = "mt-1 w-full rounded-xl border border-rule bg-surface px-3 py-2.5 text-[15px] text-ink outline-none focus:border-accent";
  return (
    <section id="found" aria-labelledby="found-h" className="scroll-mt-24 rounded-2xl border border-rule bg-surface px-5 py-5 sm:px-6">
      <h2 id="found-h" className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
        What does your mobile loan cost in a year?
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <label className="block text-[12px] font-medium text-muted sm:col-span-1">
          The loan you use
          <select data-found-product value={product} onChange={(e) => setProduct(e.target.value)} className={field}>
            <option value="">Pick one</option>
            {products.map((p) => (
              <option key={p.product} value={p.product}>
                {p.product}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-[12px] font-medium text-muted">
          Amount, KES
          <input data-found-amount inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} className={field} />
        </label>
        <label className="block text-[12px] font-medium text-muted">
          Days before you repay (up to {maxDays})
          <input data-found-days inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} className={field} />
        </label>
        <label className="block text-[12px] font-medium text-muted">
          Loans a year
          <input data-found-times inputMode="numeric" value={times} onChange={(e) => setTimes(e.target.value)} className={field} />
        </label>
      </div>
      {!product ? (
        <p className="mt-3 text-[13px] text-muted">Pick the loan you use to see its cost beside the cheapest published charge we track for the same amount and days.</p>
      ) : result && result.status !== "none" ? (
        <FoundLine
          result={result}
          payload={{ tool: "mobile_loans", product, amount: a, days: d, times: t }}
          figures={{ product: foundSlug(product), amount: Math.round(a), days: d, times: t }}
        />
      ) : (
        <p className="mt-3 text-[13px] text-muted">
          The published charges we hold do not cover this amount and term (each covers up to {maxDays} days, and loans × days cannot pass a year), so there is
          nothing to compare.
        </p>
      )}
    </section>
  );
}
