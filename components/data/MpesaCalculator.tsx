"use client";

import { useState } from "react";
import { charge, fulizaCost, monthly, type Kind, type Tariffs } from "@/lib/mpesa-calc";
import { toolDefaults } from "@/lib/tool-defaults";

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const num = (s: string) => Math.max(0, Number(s.replace(/[^\d.]/g, "")) || 0);
const kinds: { kind: Kind; label: string }[] = [
  { kind: "send", label: "Send to an M-PESA number" },
  { kind: "other", label: "Send to another network's mobile money" },
  { kind: "withdraw", label: "Withdraw at an agent" },
];

/** Three questions on Safaricom's own charges: one transaction, a Fuliza balance, and a month of habits. */
export function MpesaCalculator({ tariffs }: { tariffs: Tariffs }) {
  const [amount, setAmount] = useState(String(toolDefaults.mpesa.amount));
  const [kind, setKind] = useState<Kind>(toolDefaults.mpesa.kind);
  const [fAmount, setFAmount] = useState("1000");
  const [fDays, setFDays] = useState("7");
  const [h, setH] = useState({ sends: "20", sendAmount: "1000", withdrawals: "4", withdrawAmount: "3000", fulizaTimes: "2", fulizaAmount: "500", fulizaDays: "5" });

  const one = charge(tariffs, kind, num(amount));
  const f = fulizaCost(tariffs, num(fAmount), num(fDays));
  const m = monthly(tariffs, {
    sends: num(h.sends),
    sendAmount: num(h.sendAmount),
    withdrawals: num(h.withdrawals),
    withdrawAmount: num(h.withdrawAmount),
    fulizaTimes: num(h.fulizaTimes),
    fulizaAmount: num(h.fulizaAmount),
    fulizaDays: num(h.fulizaDays),
  });
  const share =
    `I pay about ${kes(m.total)} a month in M-PESA and Fuliza charges, ${kes(m.total * 12)} a year (sending ${kes(m.send)}, withdrawing ${kes(m.withdraw)}, Fuliza ${kes(m.fuliza)}). ` +
    `Work out yours with Safaricom's own charges: https://www.afronomicsfeed.com/rates/kenya/mpesa-charges?utm_source=whatsapp&utm_medium=share&utm_campaign=mpesa-calc`;

  const field = "mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] text-ink";
  const box = "rounded-2xl border border-rule bg-surface px-5 py-5";
  const set = (k: keyof typeof h) => (e: React.ChangeEvent<HTMLInputElement>) => setH({ ...h, [k]: e.target.value });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section aria-labelledby="one" className={box}>
        <h2 id="one" className="t-h2 text-ink">
          What will this cost?
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] text-ink-soft">
            Amount (KES)
            <input className={field} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </label>
          <label className="text-[13px] text-ink-soft">
            Transaction
            <select className={field} value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
              {kinds.map((k) => (
                <option key={k.kind} value={k.kind}>
                  {k.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-4 text-[13px] text-muted">Safaricom charges you</p>
        <p data-num className="af-figure tabular text-[2rem] font-semibold leading-tight text-ink">
          {one == null ? "Not allowed" : one === 0 ? "Free" : kes(one)}
        </p>
        <p className="mt-1 text-[12.5px] text-muted">
          {one == null
            ? num(amount) > tariffs.max_transaction
              ? `The most per transaction is ${kes(tariffs.max_transaction)}.`
              : "Agents do not pay out amounts under KES 50."
            : one > 0
              ? `${((one / Math.max(1, num(amount))) * 100).toFixed(1)}% of the amount.`
              : "Up to KES 100 is free to send."}
        </p>
      </section>

      <section aria-labelledby="fuliza" className={box}>
        <h2 id="fuliza" className="t-h2 text-ink">
          What does Fuliza cost?
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] text-ink-soft">
            Amount used (KES)
            <input className={field} inputMode="numeric" value={fAmount} onChange={(e) => setFAmount(e.target.value)} />
          </label>
          <label className="text-[13px] text-ink-soft">
            Days before you pay it back
            <input className={field} inputMode="numeric" value={fDays} onChange={(e) => setFDays(e.target.value)} />
          </label>
        </div>
        <p className="mt-4 text-[13px] text-muted">Total charges</p>
        <p data-num className="af-figure tabular text-[2rem] font-semibold leading-tight text-ink">{kes(f.total)}</p>
        <p className="mt-1 text-[12.5px] text-muted">
          Access fee {kes(f.access)} once, then {kes(f.daily)} a day.
          {f.yearly > 0 ? ` As a yearly rate, about ${Math.round(f.yearly).toLocaleString("en-US")}%.` : ""}
        </p>
      </section>

      <section aria-labelledby="month" className={`${box} lg:col-span-2`}>
        <h2 id="month" className="t-h2 text-ink">
          What do I pay in a month?
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="text-[13px] text-ink-soft">
            Sends a month
            <input className={field} inputMode="numeric" value={h.sends} onChange={set("sends")} />
          </label>
          <label className="text-[13px] text-ink-soft">
            Usual amount sent
            <input className={field} inputMode="numeric" value={h.sendAmount} onChange={set("sendAmount")} />
          </label>
          <label className="text-[13px] text-ink-soft">
            Withdrawals a month
            <input className={field} inputMode="numeric" value={h.withdrawals} onChange={set("withdrawals")} />
          </label>
          <label className="text-[13px] text-ink-soft">
            Usual withdrawal
            <input className={field} inputMode="numeric" value={h.withdrawAmount} onChange={set("withdrawAmount")} />
          </label>
          <label className="text-[13px] text-ink-soft">
            Times on Fuliza
            <input className={field} inputMode="numeric" value={h.fulizaTimes} onChange={set("fulizaTimes")} />
          </label>
          <label className="text-[13px] text-ink-soft">
            Usual Fuliza amount
            <input className={field} inputMode="numeric" value={h.fulizaAmount} onChange={set("fulizaAmount")} />
          </label>
          <label className="text-[13px] text-ink-soft">
            Days each time
            <input className={field} inputMode="numeric" value={h.fulizaDays} onChange={set("fulizaDays")} />
          </label>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
          <div>
            <p className="text-[13px] text-muted">You pay about</p>
            <p data-num className="af-figure tabular text-[2.2rem] font-semibold leading-tight text-ink">{kes(m.total)} a month</p>
            <p className="text-[13px] text-ink-soft">{kes(m.total * 12)} a year</p>
          </div>
          <dl className="grid grid-cols-3 gap-2 text-[12.5px] sm:justify-self-end">
            <div>
              <dt className="text-muted">Sending</dt>
              <dd data-num className="tabular text-ink">{kes(m.send)}</dd>
            </div>
            <div>
              <dt className="text-muted">Withdrawing</dt>
              <dd data-num className="tabular text-ink">{kes(m.withdraw)}</dd>
            </div>
            <div>
              <dt className="text-muted">Fuliza</dt>
              <dd data-num className="tabular text-ink">{kes(m.fuliza)}</dd>
            </div>
          </dl>
        </div>
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
