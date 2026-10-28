"use client";

import { useState } from "react";
import { FoundLine } from "@/components/data/FoundLine";
import { foundMmf, foundSlug, type FundOption } from "@/lib/found";

const num = (s: string) => Number(s.replace(/[^\d.]/g, ""));

const text = {
  en: {
    title: "Your fund against the best-earning one",
    fund: "Your fund",
    pick: "Pick your fund",
    amount: "Amount, KES",
    hint: "Pick the fund you hold to set what it keeps after tax beside the best-earning fund we track.",
  },
  sw: {
    title: "Mfuko wako dhidi ya unaolipa zaidi",
    fund: "Mfuko wako",
    pick: "Chagua mfuko wako",
    amount: "Kiasi, KES",
    hint: "Chagua mfuko ulio nao ili kulinganisha unachobaki nacho baada ya kodi na mfuko unaolipa zaidi tunaoufuatilia.",
  },
};

/**
 * Money market funds (/rates/kenya/money-market-funds, /rates/kenya/best-money-market-fund, and in Kiswahili on /sw):
 * the reader picks the fund they hold and an amount; the line sets it against the best-earning fund we track, both
 * after 15% withholding tax, from the managers' own published yields (lib/found.ts foundMmf).
 */
export function FundFound({ funds, lang = "en", defaultAmount = "100000" }: { funds: FundOption[]; lang?: "en" | "sw"; defaultAmount?: string }) {
  const t = text[lang];
  const [fund, setFund] = useState("");
  const [amount, setAmount] = useState(defaultAmount);
  const a = num(amount);
  const result = fund ? foundMmf({ fund, amount: a, funds }, lang) : null;
  const field = "mt-1 w-full rounded-xl border border-rule bg-surface px-3 py-2.5 text-[15px] text-ink outline-none focus:border-accent";
  if (!funds.length) return null;
  return (
    <section id="found" aria-labelledby="found-h" className="scroll-mt-24 rounded-2xl border border-rule bg-surface px-5 py-5 sm:px-6">
      <h2 id="found-h" className="text-[12px] font-semibold uppercase tracking-[0.14em] text-accent">
        {t.title}
      </h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-[2fr_1fr]">
        <label className="block min-w-0 text-[12px] font-medium text-muted">
          {t.fund}
          <select data-found-fund value={fund} onChange={(e) => setFund(e.target.value)} className={field}>
            <option value="">{t.pick}</option>
            {[...funds]
              .sort((x, y) => x.name.localeCompare(y.name))
              .map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
                </option>
              ))}
          </select>
        </label>
        <label className="block text-[12px] font-medium text-muted">
          {t.amount}
          <input data-found-amount inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} className={field} />
        </label>
      </div>
      {result && result.status !== "none" ? (
        <FoundLine result={result} lang={lang} payload={{ tool: "mmf", fund, amount: a }} figures={{ fund: foundSlug(fund), amount: Math.round(a) }} />
      ) : (
        <p className="mt-3 text-[13px] text-muted">{t.hint}</p>
      )}
    </section>
  );
}
