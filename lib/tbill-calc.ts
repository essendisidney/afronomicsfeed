/**
 * The Treasury bill calculator (/markets/kenya-tbills/calculator): what a Kenyan T-bill costs, pays back and leaves
 * you after tax, for an amount you have or a face value you bid. Pure arithmetic with no imports, so it runs in the
 * browser and in tests (tests/site/test_tbill_calc.py). The convention is the CBK's own, the same as lib/auction-math.ts:
 * price per KES 100 = 100 / (1 + rate × days / 36,500), and 15% withholding tax on the interest (the discount).
 */

export const TBILL_WHT = 0.15;
export const TBILL_MIN_FACE = 50_000;

export type BillQuote = {
  tenor: number; // days
  rate: number; // % a year, the auction's weighted average
  pricePer100: number;
  face: number; // what the CBK pays back at maturity
  cost: number; // what you pay at the auction
  interest: number; // face − cost
  tax: number;
  net: number; // interest after tax
  netYield: number; // after-tax return, % a year (365-day basis)
  belowMinimum: boolean;
};

export const billPrice = (rate: number, days: number) => 100 / (1 + (rate * days) / 36500);

/** A bill bought at `rate`: give either the money you have (`amount`, mode "pay") or the face value you bid ("face"). */
export function quoteBill(rate: number, tenor: number, amount: number, mode: "pay" | "face" = "pay", price?: number | null): BillQuote {
  const pricePer100 = price && price > 0 ? price : billPrice(rate, tenor);
  const face = mode === "face" ? amount : (amount * 100) / pricePer100;
  const cost = mode === "face" ? (amount * pricePer100) / 100 : amount;
  const interest = face - cost;
  const tax = interest * TBILL_WHT;
  const net = interest - tax;
  const netYield = cost > 0 ? (net / cost) * (36500 / tenor) : 0;
  return { tenor, rate, pricePer100, face, cost, interest, tax, net, netYield, belowMinimum: face < TBILL_MIN_FACE };
}

/** After-tax earnings over `days` if the bill is bought again at the same rate each time it matures (a rough guide). */
export function rolledOver(q: BillQuote, days: number) {
  const times = days / q.tenor;
  const growth = Math.pow(1 + q.net / q.cost, times);
  return q.cost * (growth - 1);
}

/** What another place earns over the same days, after the same 15% tax on interest, from its yearly rate. */
export const simpleEarnings = (amount: number, rate: number, days: number) => amount * (rate / 100) * (days / 365) * (1 - TBILL_WHT);

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
