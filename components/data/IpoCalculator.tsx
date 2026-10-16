"use client";

import Link from "next/link";
import { useState } from "react";
import { allot, apply, billAlternative, dividend, scenario, type Offer } from "@/lib/ipo-calc";

const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const kes2 = (n: number) => `KES ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (s: string) => Math.max(0, Number(s.replace(/[^\d.]/g, "")) || 0);
const fmtDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const day = (iso: string) => fmtDate.format(new Date(`${iso}T00:00:00Z`));
const moves = [-30, -20, -10, 0, 10, 20, 30];

/**
 * An open offer and an amount in: how many shares that buys, what comes back if the offer is scaled back, and what
 * the holding is worth if the price opens higher or lower, next to a one-year Treasury bill.
 */
export function IpoCalculator({ offers, bill }: { offers: Offer[]; bill: { rate: number; date: string } | null }) {
  const [id, setId] = useState(offers[0]?.id ?? "");
  const [amount, setAmount] = useState("20000");
  const [pct, setPct] = useState(100);
  const offer = offers.find((o) => o.id === id) ?? offers[0];
  if (!offer) return null;

  const a = apply(offer, num(amount));
  const got = allot(offer, a, pct);
  const div = dividend(offer, got.units);
  const billNet = bill ? billAlternative(got.paid, bill.rate) : null;
  const share =
    `${kes(num(amount))} in the ${offer.name} offer buys ${a.units.toLocaleString("en-US")} ${offer.units} at ${kes2(offer.price)}. ` +
    `If the price opens 10% lower it is worth ${kes(scenario(offer, a.units, -10).value)}; 10% higher, ${kes(scenario(offer, a.units, 10).value)}. ` +
    `Work out yours: https://www.afronomicsfeed.com/markets/ipo-calculator?utm_source=whatsapp&utm_medium=share&utm_campaign=ipo-calc`;

  const field = "mt-1 w-full rounded-lg border border-rule bg-surface px-3 py-2 text-[15px] text-ink";
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <section aria-labelledby="ipo-in" className="rounded-2xl border border-rule bg-surface px-5 py-5 lg:col-span-2">
        <h2 id="ipo-in" className="t-h2 text-ink">
          Your application
        </h2>
        <label className="mt-3 block text-[13px] text-ink-soft">
          Offer
          <select className={field} value={offer.id} onChange={(e) => setId(e.target.value)}>
            {offers.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
        <p className="mt-1 text-[12px] text-muted">
          {kes2(offer.price)} a {offer.unit}, minimum {offer.min_units.toLocaleString("en-US")} {offer.units} ({kes(a.minimumCost)}). Closes {day(offer.closes)}.
        </p>
        <label className="mt-3 block text-[13px] text-ink-soft">
          Money you want to put in (KES)
          <input className={field} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <label className="mt-4 block text-[13px] text-ink-soft">
          If the offer is scaled back, you get {pct}% of what you applied for
          <input className="mt-2 w-full accent-[var(--accent)]" type="range" min={10} max={100} step={5} value={pct} onChange={(e) => setPct(Number(e.target.value))} />
        </label>
        <p className="mt-1 text-[12px] text-muted">
          When more money is offered than there are {offer.units}, applications can be scaled back and the rest refunded. The results on {day(offer.results)} say
          what you got.
        </p>
      </section>

      <section aria-labelledby="ipo-out" className="rounded-2xl border border-rule bg-surface px-5 py-5 lg:col-span-3">
        <h2 id="ipo-out" className="sr-only">
          What you get
        </h2>
        {a.belowMinimum ? (
          <p className="text-[15px] text-accent">
            That is below the minimum of {offer.min_units.toLocaleString("en-US")} {offer.units}, {kes(a.minimumCost)}.
          </p>
        ) : (
          <>
            <p className="text-[13px] text-muted">You apply for</p>
            <p data-num className="af-figure tabular text-[2rem] font-semibold leading-tight text-ink">
              {a.units.toLocaleString("en-US")} {offer.units}
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">
              {kes2(a.cost)} paid in{a.leftover >= 0.01 ? `; ${kes2(a.leftover)} left over` : ""}.
              {pct < 100 ? ` At ${pct}%: ${got.units.toLocaleString("en-US")} ${offer.units} (${kes(got.paid)}), ${kes(got.refund)} refunded.` : ""}
            </p>

            <h3 className="mt-5 text-[14px] font-semibold text-ink">
              If the price {offer.trading ? `on ${day(offer.trading)}` : "when trading starts"} is
            </h3>
            <div className="table-box mt-2 overflow-x-auto" tabIndex={0} role="region" aria-label="Value at different prices (scrolls sideways)">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Price move</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Worth</th>
                    <th className="text-right">Gain or loss</th>
                  </tr>
                </thead>
                <tbody>
                  {moves.map((m) => {
                    const s = scenario(offer, got.units, m);
                    return (
                      <tr key={m} className={m === 0 ? "font-semibold" : undefined}>
                        <th scope="row">{m === 0 ? "Offer price" : `${m > 0 ? "+" : ""}${m}%`}</th>
                        <td data-num className="text-right">{s.price.toFixed(2)}</td>
                        <td data-num className="text-right">{Math.round(s.value).toLocaleString("en-US")}</td>
                        <td data-num className="text-right">{`${s.gain > 0 ? "+" : ""}${Math.round(s.gain).toLocaleString("en-US")}`}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-1 text-[11.5px] text-muted">Before any broker’s fees when you sell. Prices can move further than these.</p>

            <dl className="mt-4 grid gap-3 text-[13px] sm:grid-cols-2">
              <div className="rounded-xl border border-rule px-3 py-2">
                <dt className="text-muted">A year’s dividend, after tax</dt>
                <dd data-num className="af-figure tabular text-[1.1rem] font-semibold text-ink">
                  {div ? kes(div.net) : "None set"}
                </dd>
                <dd className="text-[11.5px] text-muted">{div ? `${offer.dividend_note}, less ${offer.dividend_tax_pct}% tax: ${div.yieldNet.toFixed(1)}% a year` : offer.dividend_note}</dd>
              </div>
              {billNet != null && bill ? (
                <div className="rounded-xl border border-rule px-3 py-2">
                  <dt className="text-muted">The same {kes(got.paid)} in a one-year T-bill</dt>
                  <dd data-num className="af-figure tabular text-[1.1rem] font-semibold text-ink">
                    {kes(billNet)}
                  </dd>
                  <dd className="text-[11.5px] text-muted">
                    after 15% tax, at {bill.rate.toFixed(2)}% ({day(bill.date)} auction) · <Link href="/markets/kenya-tbills/calculator" className="underline underline-offset-2">T-bill calculator</Link>
                  </dd>
                </div>
              ) : null}
            </dl>
          </>
        )}

        <p className="mt-4 text-[12px] text-muted">{offer.costs_note}{offer.min_note ? ` ${offer.min_note}` : ""}</p>
        <p className="mt-2 text-[13px]">
          <Link href={`/receipts/${offer.receipt}`} className="font-semibold text-forest underline underline-offset-2">
            Read our Receipt on {offer.name}
          </Link>
          <span className="text-muted">: what the offer documents show, and our verdict.</span>
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
