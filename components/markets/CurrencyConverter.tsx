"use client";

import { useMemo, useState } from "react";
import { convertAmount, type FxQuote } from "@/lib/fx/reference";

function money(value: number, code: string) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: Math.abs(value) >= 1 ? 2 : 4,
  }).format(value) + " " + code;
}

export function CurrencyConverter({ quote }: { quote: FxQuote }) {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("KES");

  const parsed = Number(amount.replace(/,/g, "").trim());
  const result = useMemo(
    () => convertAmount(parsed, from, to, quote.rates),
    [parsed, from, to, quote.rates],
  );
  const unit = useMemo(() => convertAmount(1, from, to, quote.rates), [from, to, quote.rates]);

  return (
    <form className="mb-12 bg-paper-2 px-5 py-6 sm:px-8" onSubmit={(event) => event.preventDefault()}>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold">Converter</p>
      <h2 className="mt-2 font-serif text-3xl tracking-[-0.02em]">Convert a currency</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
        Daily mid-market reference. This is not a central-bank print and not a dealing price.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto_1fr] sm:items-end">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Amount</span>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-2 w-full border border-rule bg-paper px-3 py-3 font-serif text-2xl"
          />
        </label>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">From</span>
          <select
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className="mt-2 w-full border border-rule bg-paper px-3 py-3 text-sm"
          >
            {quote.codes.map((item) => (
              <option key={item.code} value={item.code}>
                {item.code} · {item.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="border border-rule bg-paper px-4 py-3 text-sm hover:border-gold"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
        >
          Swap
        </button>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">To</span>
          <select
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className="mt-2 w-full border border-rule bg-paper px-3 py-3 text-sm"
          >
            {quote.codes.map((item) => (
              <option key={`to-${item.code}`} value={item.code}>
                {item.code} · {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-8 font-serif text-4xl tracking-[-0.03em] text-ink">
        {result == null || !Number.isFinite(parsed) ? "—" : money(result, to)}
      </p>
      {unit != null ? (
        <p className="mt-2 text-sm text-ink-soft">1 {from} = {money(unit, to)}</p>
      ) : (
        <p className="mt-2 text-sm text-ink-soft">That pair did not come back with a rate.</p>
      )}
      <p className="mt-4 text-xs text-muted">
        Updated {quote.updated}.{" "}
        <a href={quote.sourceUrl} className="text-forest underline underline-offset-2" target="_blank" rel="noopener noreferrer">
          {quote.sourceName}
        </a>
      </p>
    </form>
  );
}
