/** The calculators' arithmetic, shared by the browser tools and their share cards. Pure functions, no imports. */

/** Regular monthly saving, interest added monthly at a steady yearly rate (after tax). */
export function savingsGrowth(monthly: number, years: number, yearly: number) {
  const n = Math.max(0, Math.round(years * 12));
  const i = yearly / 100 / 12;
  const total = i === 0 ? monthly * n : monthly * ((Math.pow(1 + i, n) - 1) / i);
  const paidIn = monthly * n;
  return { total, paidIn, interest: total - paidIn };
}

export function reducing(amount: number, yearly: number, months: number) {
  const i = yearly / 100 / 12;
  const payment = i === 0 ? amount / months : (amount * i) / (1 - Math.pow(1 + i, -months));
  return { payment, interest: payment * months - amount };
}

export function flat(amount: number, yearly: number, months: number) {
  const interest = (amount * yearly * months) / 1200;
  return { payment: (amount + interest) / months, interest };
}

/** The reducing-balance yearly rate that costs the same as a flat rate (solved by bisection). */
export function flatAsReducing(amount: number, yearly: number, months: number) {
  const target = flat(amount, yearly, months).payment;
  let lo = 0;
  let hi = 500;
  for (let k = 0; k < 80; k++) {
    const mid = (lo + hi) / 2;
    if (reducing(amount, mid, months).payment < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}
