/**
 * The M-PESA and Fuliza cost calculator (/rates/kenya/mpesa-charges): Safaricom's published consumer charges and
 * Fuliza fees (data/kenya/mpesa_tariffs.json, checked by hand against Safaricom's pages). Pure arithmetic with no
 * imports, so it runs in the browser and in tests (tests/site/test_mpesa_calc.py).
 */

export type MpesaBand = { min: number; max: number; send: number; other: number; withdraw: number | null };
export type FulizaBand = { min: number; max: number; fee: number };
export type Tariffs = {
  checked: string;
  sources: { mpesa: string; fuliza: string };
  max_transaction: number;
  mpesa: MpesaBand[];
  fuliza: { access_fee_pct: number; daily: FulizaBand[] };
};
export type Kind = "send" | "other" | "withdraw";

/** The charge for one transaction, or null when it is not allowed (too small to withdraw, or over the maximum). */
export function charge(t: Tariffs, kind: Kind, amount: number): number | null {
  const a = Math.round(amount);
  if (a < 1 || a > t.max_transaction) return null;
  const band = t.mpesa.find((b) => a >= b.min && a <= b.max);
  return band ? band[kind] : null;
}

/** What Fuliza costs: the one-off access fee, then the daily fee for the balance's band for each day it is unpaid. */
export function fulizaCost(t: Tariffs, amount: number, days: number) {
  const a = Math.max(0, amount);
  const access = (a * t.fuliza.access_fee_pct) / 100;
  const band = t.fuliza.daily.find((b) => a >= b.min && a <= b.max) ?? t.fuliza.daily[t.fuliza.daily.length - 1];
  const daily = a > 0 ? band.fee : 0;
  const total = access + daily * Math.max(0, days);
  // The same cost as a yearly rate, to compare with a loan's; only meaningful for a few days' borrowing.
  const yearly = a > 0 && days > 0 ? (total / a) * (365 / days) * 100 : 0;
  return { access, daily, total, yearly };
}

/** A month's M-PESA and Fuliza costs from typical habits. */
export function monthly(
  t: Tariffs,
  h: { sends: number; sendAmount: number; withdrawals: number; withdrawAmount: number; fulizaTimes: number; fulizaAmount: number; fulizaDays: number },
) {
  const send = (charge(t, "send", h.sendAmount) ?? 0) * h.sends;
  const withdraw = (charge(t, "withdraw", h.withdrawAmount) ?? 0) * h.withdrawals;
  const fuliza = fulizaCost(t, h.fulizaAmount, h.fulizaDays).total * h.fulizaTimes;
  return { send, withdraw, fuliza, total: send + withdraw + fuliza };
}

/** Withdrawing a sum in one go against splitting it in two: the saving from one withdrawal. */
export function splitPenalty(t: Tariffs, amount: number) {
  const once = charge(t, "withdraw", amount);
  const half = charge(t, "withdraw", amount / 2);
  return once == null || half == null ? null : 2 * half - once;
}
