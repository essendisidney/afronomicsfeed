"use client";

import Link from "next/link";
import { useState } from "react";
import { billGrowth, depositGrowth, worth, type BillRate, type CpiPoint, type DepositRate } from "@/lib/inflation";
import { toolDefaults } from "@/lib/tool-defaults";

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const pct = (n: number) => `${n.toFixed(1)}%`;
const num = (s: string) => Math.max(0, Number(s.replace(/[^\d.]/g, "")) || 0);
const monthLabel = (ym: string) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${ym}-01T00:00:00Z`));

function span(months: number) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [y ? `${y} ${y === 1 ? "year" : "years"}` : "", m ? `${m} ${m === 1 ? "month" : "months"}` : ""].filter(Boolean);
  return parts.join(" and ") || "no time";
}

/**
 * An amount and two months in; out, what the amount is worth in the later month's prices (and the reverse), how much
 * prices rose in all and a year, and what the same money would have become in rolled 364-day Treasury bills or an
 * average bank fixed deposit, after tax.
 */
export function InflationCalculator({
  index,
  bills,
  deposits,
  defaultFrom,
}: {
  index: CpiPoint[];
  bills: BillRate[];
  deposits: DepositRate[];
  defaultFrom: string;
}) {
  const first = index[0].month;
  const latest = index[index.length - 1].month;
  const firstBill = bills.length ? bills.reduce((a, b) => (a.date < b.date ? a : b)).date.slice(0, 7) : null;
  const [amount, setAmount] = useState(String(toolDefaults.inflation.amount));
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(latest);

  const clamp = (ym: string, fallback: string) => (/^\d{4}-\d{2}$/.test(ym) && ym >= first && ym <= latest ? ym : fallback);
  const f = clamp(from, defaultFrom);
  const t = clamp(to, latest);
  const a = num(amount);
  const w = worth(a, f, t, index);
  if (!w) return null;
  const forward = w.months > 0;
  const bill = forward ? billGrowth(a, f, t, bills) : null;
  const deposit = forward ? depositGrowth(a, f, t, deposits) : null;
  const places = [
    { name: "364-day Treasury bills, rolled over", note: "each new bill at the latest auction rate, after 15% tax", value: bill, href: "/markets/kenya-tbills/calculator" },
    { name: "Bank fixed deposit, average", note: "the CBK’s average deposit rate each month, after 15% tax", value: deposit, href: "/rates/kenya" },
    { name: "Cash or M-PESA", note: "no interest", value: forward ? a : null, href: undefined },
  ];

  const share =
    `${kes(a)} in ${monthLabel(f)} is worth ${kes(w.value)} in ${monthLabel(t)} prices: Kenyan prices rose ${pct(w.cumulativePct)}` +
    `${forward ? `, about ${pct(w.yearlyPct)} a year` : ""}. Check yours: https://www.afronomicsfeed.com/rates/kenya/inflation?utm_source=whatsapp&utm_medium=share&utm_campaign=inflation`;

  const field = "mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] text-ink";
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <section aria-labelledby="infl-in" className="rounded-2xl border border-rule bg-surface px-5 py-5 lg:col-span-2">
        <h2 id="infl-in" className="t-h2 text-ink">
          Your money
        </h2>
        <label className="mt-3 block text-[13px] text-ink-soft">
          Amount (KES)
          <input className={field} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label className="mt-3 block text-[13px] text-ink-soft">
          Back then (month)
          <input className={field} type="month" min={first} max={latest} value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="mt-3 block text-[13px] text-ink-soft">
          Compared with (month)
          <input className={field} type="month" min={first} max={latest} value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
        <p className="mt-2 text-[12px] text-muted">
          Prices from {monthLabel(first)} to {monthLabel(latest)}, the latest month KNBS has published.
        </p>
      </section>

      <section aria-labelledby="infl-out" className="rounded-2xl border border-rule bg-surface px-5 py-5 lg:col-span-3">
        <h2 id="infl-out" className="sr-only">
          What your money is worth
        </h2>
        <p className="text-[13px] text-muted">
          {kes(a)} in {monthLabel(f)} is worth, in {monthLabel(t)} prices
        </p>
        <p data-num className="tabular text-[2rem] font-semibold leading-tight text-ink">
          {kes(w.value)}
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">
          {forward
            ? `You would need ${kes(w.value)} in ${monthLabel(t)} to buy what ${kes(a)} bought in ${monthLabel(f)}. Each shilling buys ${pct(w.lostPct)} less.`
            : w.months < 0
              ? `Prices were lower in ${monthLabel(t)}: ${kes(a)} from ${monthLabel(f)} would have bought what ${kes(w.value)} did then.`
              : "Pick two different months to see the change."}
        </p>
        {w.months !== 0 ? (
          <p className="mt-1 text-[13px] text-ink-soft">
            The other way round: {kes(a)} in {monthLabel(t)} would have been {kes(w.back)} in {monthLabel(f)}.
          </p>
        ) : null}

        <dl className="mt-4 grid grid-cols-3 gap-3 text-[13px]">
          <div>
            <dt className="text-muted">Prices rose</dt>
            <dd data-num className="tabular font-semibold text-ink">
              {pct(w.cumulativePct)}
            </dd>
          </div>
          <div>
            <dt className="text-muted">A year, on average</dt>
            <dd data-num className="tabular font-semibold text-ink">
              {forward ? pct(w.yearlyPct) : "–"}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Over</dt>
            <dd className="font-semibold text-ink">{span(Math.abs(w.months))}</dd>
          </div>
        </dl>

        {forward ? (
          <>
            <h3 className="mt-5 text-[13px] font-semibold text-ink">What {kes(a)} would have become by {monthLabel(t)}</h3>
            <ul className="mt-1 divide-y divide-rule text-[14px]">
              {places.map((p) => {
                const gap = p.value === null ? null : p.value - w.value;
                return (
                  <li key={p.name} className="flex items-baseline justify-between gap-4 py-2">
                    <span>
                      <span className="text-ink">{p.href ? <Link href={p.href} className="underline underline-offset-2">{p.name}</Link> : p.name}</span>
                      <span className="block text-[11.5px] text-muted">{p.note}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span data-num className="tabular block whitespace-nowrap font-semibold text-ink">
                        {p.value === null ? "–" : kes(p.value)}
                      </span>
                      <span className="block text-[11.5px] text-muted">
                        {gap === null
                          ? firstBill && f < firstBill
                            ? `our auction record starts ${monthLabel(firstBill)}`
                            : "no data for these months"
                          : gap >= 0
                            ? `beat prices by ${kes(gap)}`
                            : `${kes(-gap)} short of prices`}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[12px] text-muted">
              Past rates, not a promise: a bill or a deposit bought today earns today’s rate. A Treasury bill needs at least KES 50,000 at once.
            </p>
          </>
        ) : null}

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
