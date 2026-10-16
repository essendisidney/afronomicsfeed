"use client";

import { useMemo, useState } from "react";
import { addDays, quoteBill, rolledOver, simpleEarnings, TBILL_MIN_FACE } from "@/lib/tbill-calc";
import { toolDefaults } from "@/lib/tool-defaults";

export type CalcBill = { tenor: 91 | 182 | 364; rate: number; price: number | null; auctionDate: string; source: string };
export type CalcCompare = { label: string; rate: number; source: string; href: string };

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const fmtDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const day = (iso: string) => fmtDate.format(new Date(`${iso}T00:00:00Z`));

/**
 * The T-bill calculator: the money you have (or the face value you bid) in, then for each bill what you pay, what
 * you get back on what date, the 15% tax and what you keep; and what the same money earns elsewhere over a year.
 */
export function TbillCalculator({
  bills,
  nextValueDate,
  bidsClose,
  compare,
}: {
  bills: CalcBill[];
  nextValueDate: string | null;
  bidsClose: string | null;
  compare: CalcCompare[];
}) {
  const [amount, setAmount] = useState(String(toolDefaults.tbill.amount));
  const [mode, setMode] = useState<"pay" | "face">(toolDefaults.tbill.mode);
  const value = Math.max(0, Number(amount.replace(/[^\d.]/g, "")) || 0);

  const quotes = useMemo(() => bills.map((b) => ({ bill: b, q: quoteBill(b.rate, b.tenor, value, mode, b.price) })), [bills, value, mode]);
  const best = quotes.reduce((m, x) => (x.q.netYield > (m?.q.netYield ?? -1) ? x : m), quotes[0]);
  const money = mode === "pay" ? value : (best?.q.cost ?? value);
  const year = [
    ...quotes.map(({ bill, q }) => ({ label: `${bill.tenor}-day bill${bill.tenor < 364 ? `, bought again ${Math.round(364 / bill.tenor)} times` : ""}`, net: rolledOver(q, 364) * (money / q.cost) })),
    ...compare.map((c) => ({ label: c.label, net: simpleEarnings(money, c.rate, 364) })),
  ].sort((a, b) => b.net - a.net);

  const share =
    `${mode === "pay" ? `${kes(value)} in` : `${kes(value)} face value of`} Kenya Treasury bills, at the last CBK auction:\n` +
    quotes.map(({ bill, q }) => `• ${bill.tenor}-day: pay ${kes(q.cost)}, get ${kes(q.face)}, keep ${kes(q.net)} after 15% tax`).join("\n") +
    `\nInformation, not advice. Work out yours: https://www.afronomicsfeed.com/markets/kenya-tbills/calculator?utm_source=whatsapp&utm_medium=share&utm_campaign=tbill-calc`;

  const field = "mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] text-ink";
  return (
    <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
      <div className="no-print grid gap-4 sm:grid-cols-2">
        <label className="text-[13px] text-ink-soft">
          {mode === "pay" ? "Money you want to put in (KES)" : "Face value you bid (KES)"}
          <input className={field} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} aria-describedby="tbill-mode-note" />
        </label>
        <label className="text-[13px] text-ink-soft">
          I am entering
          <select className={field} value={mode} onChange={(e) => setMode(e.target.value as "pay" | "face")}>
            <option value="pay">The money I have</option>
            <option value="face">The face value (as DhowCSD asks)</option>
          </select>
        </label>
      </div>
      <p id="tbill-mode-note" className="mt-2 text-[12px] text-muted">
        A bill is sold at a discount: you pay less than its face value and get the full face value back when it matures. The gap is your interest.
      </p>

      {/* Phones: one card per bill, what you keep first. A five-column table pushed it off the screen. */}
      <ul className="mt-5 space-y-3 sm:hidden">
        {quotes.map(({ bill, q }) => (
          <li key={bill.tenor} className="rounded-xl border border-rule px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-semibold text-ink">{bill.tenor}-day bill</p>
              <p className="text-[12px] text-muted">{bill.rate.toFixed(2)}% a year</p>
            </div>
            <p className="mt-1 text-[12px] text-muted">You keep, after tax</p>
            <p data-num className="af-figure tabular text-[1.5rem] font-semibold leading-tight text-ink">{kes(q.net)}</p>
            <dl className="mt-2 grid grid-cols-3 gap-2 text-[12px]">
              <div>
                <dt className="text-muted">You pay</dt>
                <dd data-num className="tabular text-ink">{kes(q.cost)}</dd>
              </div>
              <div>
                <dt className="text-muted">You get back</dt>
                <dd data-num className="tabular text-ink">{kes(q.face)}</dd>
              </div>
              <div>
                <dt className="text-muted">Tax (15%)</dt>
                <dd data-num className="tabular text-ink">{kes(q.tax)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-[11.5px] text-muted">
              {q.netYield.toFixed(2)}% a year after tax · auction of {day(bill.auctionDate)}
              {nextValueDate ? ` · if bought next, back about ${day(addDays(nextValueDate, bill.tenor))}` : ""}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-5 hidden overflow-x-auto sm:block">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bill</th>
              <th className="text-right">You pay</th>
              <th className="text-right">You get back</th>
              <th className="text-right">Tax (15%)</th>
              <th className="text-right">You keep</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map(({ bill, q }) => (
              <tr key={bill.tenor}>
                <th scope="row">
                  <span className="font-semibold text-ink">{bill.tenor}-day</span>
                  <span className="block text-[11px] font-normal text-muted">
                    {bill.rate.toFixed(2)}% a year · auction of {day(bill.auctionDate)}
                  </span>
                  {nextValueDate ? <span className="block text-[11px] font-normal text-muted">If bought next: back about {day(addDays(nextValueDate, bill.tenor))}</span> : null}
                </th>
                <td data-num className="text-right">{kes(q.cost)}</td>
                <td data-num className="text-right">{kes(q.face)}</td>
                <td data-num className="text-right">{kes(q.tax)}</td>
                <td data-num className="text-right">
                  <span className="font-semibold text-ink">{kes(q.net)}</span>
                  <span className="block text-[11px] text-muted">{q.netYield.toFixed(2)}% a year after tax</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {quotes.some(({ q }) => q.belowMinimum) ? (
        <p className="mt-2 text-[12px] text-accent">The CBK’s minimum is {kes(TBILL_MIN_FACE)} of face value per bill; below that, a money market fund is the usual alternative.</p>
      ) : null}
      {bidsClose && nextValueDate ? (
        <p className="mt-2 text-[12px] text-muted">
          Next auction: bids close {day(bidsClose)} at 2 p.m., bills issued {day(nextValueDate)}. Its rate will differ a little from the last one.
        </p>
      ) : null}

      <h3 className="mt-6 text-[14px] font-semibold text-ink">Over a year, the same {kes(money)} earns after tax</h3>
      <ul className="mt-2 divide-y divide-rule text-[14px]">
        {year.map((y) => (
          <li key={y.label} className="flex items-baseline justify-between gap-4 py-2">
            <span className="text-ink-soft">{y.label}</span>
            <span data-num className="tabular font-semibold text-ink">{kes(y.net)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-1 text-[11.5px] text-muted">
        Bills bought again assume today’s rate holds, which it will not exactly.{" "}
        {compare.map((c, i) => (
          <span key={c.label}>
            {i ? "; " : ""}
            <a href={c.href} className="underline underline-offset-2">
              {c.label}
            </a>
            : {c.rate.toFixed(2)}% before tax, {c.source}
          </span>
        ))}
        .
      </p>

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
    </div>
  );
}
