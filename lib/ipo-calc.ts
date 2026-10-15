/**
 * The IPO helper (/markets/ipo-calculator): how many shares an amount buys in an open offer, what you get if the offer
 * is scaled back, and what the holding is worth if the price opens higher or lower. Pure arithmetic with no imports,
 * so it runs in the browser and in tests (tests/site/test_ipo_calc.py). Offer terms come from data/ipo/offers.json,
 * which is copied from our Receipts.
 */

export type Offer = {
  id: string;
  name: string;
  unit: string;
  units: string;
  price: number;
  min_units: number;
  min_note?: string;
  currency: string;
  closes: string;
  results: string;
  trading: string | null;
  trading_note: string;
  dividend_per_unit: number | null;
  dividend_note: string;
  dividend_tax_pct: number | null;
  costs_note: string;
  receipt: string;
  checked: string;
};

export type Application = {
  units: number; // applied for, whole units
  cost: number; // what you pay in
  leftover: number; // what your amount could not buy
  belowMinimum: boolean;
  minimumCost: number;
};

/** What `amount` buys at the offer price, in whole units. */
export function apply(offer: Offer, amount: number): Application {
  const a = amount > 0 ? amount : 0;
  const units = Math.floor(a / offer.price + 1e-9);
  return {
    units,
    cost: units * offer.price,
    leftover: a - units * offer.price,
    belowMinimum: units < offer.min_units,
    minimumCost: offer.min_units * offer.price,
  };
}

/** If the offer is scaled back to `pct`% of what was applied for: units received (whole) and the refund. */
export function allot(offer: Offer, app: Application, pct: number) {
  const p = Math.min(100, Math.max(0, pct));
  const units = Math.floor((app.units * p) / 100 + 1e-9);
  return { units, paid: units * offer.price, refund: app.cost - units * offer.price };
}

/** The holding at a price `move`% away from the offer price. */
export function scenario(offer: Offer, units: number, move: number) {
  const price = offer.price * (1 + move / 100);
  const value = units * price;
  return { move, price, value, gain: value - units * offer.price };
}

/** A year's forecast dividend after the withholding tax, where the offer has one. */
export function dividend(offer: Offer, units: number) {
  if (offer.dividend_per_unit == null) return null;
  const gross = units * offer.dividend_per_unit;
  const net = gross * (1 - (offer.dividend_tax_pct ?? 0) / 100);
  return { gross, net, yieldNet: (offer.dividend_per_unit * (1 - (offer.dividend_tax_pct ?? 0) / 100) * 100) / offer.price };
}

/** What the same money earns in a one-year Treasury bill at `rate`% a year, after the 15% tax. */
export const billAlternative = (amount: number, rate: number) => amount * (rate / 100) * 0.85;
