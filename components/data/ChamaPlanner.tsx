"use client";

import { useMemo, useState } from "react";

export type ChamaOption = {
  id: string;
  label: string;
  rate: number; // % a year, before tax
  source: string; // where and when the rate is from
  access: string;
  href: string;
  tenorDays?: number; // a T-bill: money is locked this long
  minAmount?: number;
};

const HORIZONS = [
  { days: 30, label: "Within a month" },
  { days: 91, label: "In about 3 months" },
  { days: 182, label: "In about 6 months" },
  { days: 364, label: "In a year or more" },
];
const WHT = 0.15;
const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;

/** "Where should our chama put its money?": every option's after-tax earnings for the group's amount and timing. */
export function ChamaPlanner({ options, asOf }: { options: ChamaOption[]; asOf: string }) {
  const [amount, setAmount] = useState("500000");
  const [days, setDays] = useState(182);
  const value = Math.max(0, Number(amount.replace(/[^\d.]/g, "")) || 0);

  const rows = useMemo(() => {
    return options
      .filter((o) => !o.tenorDays || o.tenorDays <= days) // a bill must mature before the money is needed
      .map((o) => {
        // Everything is compared over the same period: a bill shorter than it is assumed rolled over at today's rate.
        const held = days;
        const net = value * (o.rate / 100) * (held / 365) * (1 - WHT);
        return { ...o, held, net, tooSmall: o.minAmount != null && value < o.minAmount };
      })
      .sort((a, b) => b.net - a.net);
  }, [options, days, value]);

  const horizon = HORIZONS.find((h) => h.days === days)!.label.toLowerCase();
  const share =
    `Our chama's ${kes(value)}, needed ${horizon}. What it earns after 15% tax:\n` +
    rows.map((r) => `• ${r.label}: ${kes(r.net)} (${r.rate.toFixed(2)}% a year${r.tenorDays ? `, ${r.tenorDays} days` : ""})`).join("\n") +
    `\nRates as of ${asOf}. Information, not advice. https://afronomicsfeed.com/chama?utm_source=whatsapp&utm_medium=share&utm_campaign=chama`;

  const field = "mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] text-ink";
  return (
    <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
      <div className="no-print grid gap-4 sm:grid-cols-2">
        <label className="text-[13px] text-ink-soft">
          How much the chama has (KES)
          <input className={field} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label className="text-[13px] text-ink-soft">
          When the group will need it
          <select className={field} value={days} onChange={(e) => setDays(Number(e.target.value))}>
            {HORIZONS.map((h) => (
              <option key={h.days} value={h.days}>
                {h.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-5 text-[13px] text-muted">
        {kes(value)}, needed {horizon}: what each option earns after Kenya’s 15% withholding tax, most first.
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Option</th>
              <th className="text-right">Rate a year</th>
              <th className="text-right">Earns, after tax</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <a href={r.href} className="font-medium text-ink hover:text-forest">
                    {r.label}
                  </a>
                  <span className="block text-[11px] text-muted">
                    {r.access} · {r.source}
                  </span>
                  {r.tooSmall ? <span className="block text-[11px] text-accent">Minimum {kes(r.minAmount!)}</span> : null}
                </td>
                <td className="text-right">{r.rate.toFixed(2)}%</td>
                <td className="text-right">
                  <span className="font-semibold">{kes(r.net)}</span>
                  <span className="block text-[11px] text-muted">
                    over {r.held} days{r.tenorDays && r.tenorDays < r.held ? ", rolled over at today’s rate" : ""}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {days < 91 ? <p className="mt-2 text-[12px] text-muted">Treasury bills are left out: the shortest, 91 days, would not mature before the group needs the money.</p> : null}

      <div className="no-print mt-4 flex flex-wrap gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(share)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-paper hover:bg-forest"
        >
          Send to the chama on WhatsApp
        </a>
        <button type="button" onClick={() => window.print()} className="rounded-full border border-rule px-4 py-2 text-[13px] font-semibold text-ink hover:border-accent">
          Print for the meeting
        </button>
      </div>
    </div>
  );
}
