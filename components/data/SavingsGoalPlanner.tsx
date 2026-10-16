"use client";

import Link from "next/link";
import { useState } from "react";
import { monthsUntil, plan, type Place } from "@/lib/savings-goal";
import { toolDefaults } from "@/lib/tool-defaults";

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const num = (s: string) => Math.max(0, Number(s.replace(/[^\d.]/g, "")) || 0);
const short = (p: Place) => p.short ?? p.name;
const monthLabel = (ym: string) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${ym}-01T00:00:00Z`));

/**
 * A goal, a date and what is saved already in; out, the monthly saving each place needs to get there, at today's
 * after-tax rates. `today` comes from the server so the month count matches on both sides.
 */
export function SavingsGoalPlanner({ places, today, defaultBy }: { places: Place[]; today: string; defaultBy: string }) {
  const [goal, setGoal] = useState(String(toolDefaults.savingsGoal.goal));
  const [by, setBy] = useState(defaultBy);
  const [start, setStart] = useState("");
  const [label, setLabel] = useState<string>(toolDefaults.savingsGoal.label);

  const months = monthsUntil(today, by || defaultBy);
  const rows = plan(num(goal), num(start), months, places);
  const best = rows[0];
  const worst = rows[rows.length - 1];

  const share =
    `${label ? `${label}: ` : ""}${kes(num(goal))} by ${monthLabel(by || defaultBy)} means saving ${kes(best.monthly)} a month in ${short(best.place)}, ` +
    `or ${kes(worst.monthly)} in ${short(worst.place)}. Plan yours: https://www.afronomicsfeed.com/rates/kenya/savings-goal?utm_source=whatsapp&utm_medium=share&utm_campaign=savings-goal`;

  const field = "mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] text-ink";
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <section aria-labelledby="goal-in" className="rounded-2xl border border-rule bg-surface px-5 py-5 lg:col-span-2">
        <h2 id="goal-in" className="t-h2 text-ink">
          Your goal
        </h2>
        <label className="mt-3 block text-[13px] text-ink-soft">
          What it is for
          <input className={field} value={label} onChange={(e) => setLabel(e.target.value.slice(0, 40))} />
        </label>
        <label className="mt-3 block text-[13px] text-ink-soft">
          How much you need (KES)
          <input className={field} inputMode="numeric" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </label>
        <label className="mt-3 block text-[13px] text-ink-soft">
          By when
          <input className={field} type="month" min={today.slice(0, 7)} value={by} onChange={(e) => setBy(e.target.value)} />
        </label>
        <label className="mt-3 block text-[13px] text-ink-soft">
          Already saved towards it (KES)
          <input className={field} inputMode="numeric" placeholder="0" value={start} onChange={(e) => setStart(e.target.value)} />
        </label>
        <p className="mt-2 text-[12px] text-muted">
          {months} {months === 1 ? "month" : "months"} from now, saving at the end of each month.
        </p>
      </section>

      <section aria-labelledby="goal-out" className="rounded-2xl border border-rule bg-surface px-5 py-5 lg:col-span-3">
        <h2 id="goal-out" className="sr-only">
          What to save each month
        </h2>
        <p className="text-[13px] text-muted">Save each month, in {short(best.place)}</p>
        <p data-num className="tabular text-[2rem] font-semibold leading-tight text-ink">
          {kes(best.monthly)}
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">
          {label ? `${label}: ` : ""}
          {kes(num(goal))} by {monthLabel(by || defaultBy)}. Interest does {kes(best.interest)} of the work.
        </p>

        <ul className="mt-4 divide-y divide-rule text-[14px]">
          {rows.map((x) => (
            <li key={x.place.name} className="flex items-baseline justify-between gap-4 py-2">
              <span>
                <span className="text-ink">{x.place.href ? <Link href={x.place.href} className="underline underline-offset-2">{x.place.name}</Link> : x.place.name}</span>
                <span className="block text-[11.5px] text-muted">
                  {x.place.net.toFixed(2)}% a year after tax · {x.place.note}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span data-num className="tabular block whitespace-nowrap font-semibold text-ink">
                  {kes(x.monthly)}
                </span>
                <span data-num className="tabular block text-[11.5px] text-muted">
                  +{kes(x.interest)} interest
                </span>
              </span>
            </li>
          ))}
        </ul>
        {rows.length > 1 ? (
          <p className="mt-3 text-[13px] text-ink-soft">
            Over {months} months, {short(best.place)} needs {kes((worst.monthly - best.monthly) * months)} less from you than{" "}
            {short(worst.place)}.
          </p>
        ) : null}
        <p className="mt-2 text-[12px] text-muted">
          Rates change, so treat this as a guide: money market fund yields move daily, and past yields do not promise future ones. A Treasury bill needs at
          least KES 50,000 at once, so it suits a lump sum rather than monthly saving.
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
      </section>
    </div>
  );
}
