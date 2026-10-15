/**
 * The loan true-cost calculator (/rates/kenya/loan-cost): what a loan really costs once the interest method and the
 * fees are counted. Pure arithmetic with no imports, so it runs in the browser and in tests (tests/site/test_loan_calc.py).
 *
 * Two ways lenders quote interest:
 * - reducing balance: interest each month on what is still owed (banks, most SACCOs); the instalment is an annuity.
 * - flat: interest on the full amount for the whole term, whatever has been repaid (many chamas, shops, some lenders).
 * The true yearly rate is the rate that equates what you actually receive (the amount less upfront fees) with what you
 * pay back each month (instalment plus monthly fees): the monthly internal rate of return, times 12 (the usual APR convention),
 * and compounded, the effective yearly rate.
 */

export type RateBasis = "reducing" | "flat";
export type RateUnit = "year" | "month";

export type LoanInput = {
  amount: number;
  rate: number; // % per `unit`
  unit: RateUnit;
  basis: RateBasis;
  months: number;
  upfrontFees?: number; // KES taken at the start (processing, appraisal, legal, insurance paid upfront)
  monthlyFees?: number; // KES added to every instalment (e.g. monthly insurance)
};

export type LoanResult = {
  instalment: number; // principal and interest, a month
  payment: number; // instalment plus monthly fees
  totalInterest: number;
  totalFees: number;
  totalRepaid: number; // every payment, plus upfront fees
  totalCost: number; // totalRepaid − amount
  received: number; // amount less upfront fees
  apr: number; // % a year, monthly IRR × 12
  effective: number; // % a year, compounded
  schedule: { month: number; payment: number; interest: number; principal: number; balance: number }[];
};

const pos = (n: number | undefined) => (n && n > 0 ? n : 0);

/** Monthly rate as a fraction, from a % quoted per year or per month. */
const monthly = (rate: number, unit: RateUnit) => (unit === "month" ? rate : rate / 12) / 100;

/** Monthly rate r at which `received` today equals `payment` for `n` months: the internal rate of return. */
export function irrMonthly(received: number, payment: number, n: number) {
  if (received <= 0 || payment <= 0 || n <= 0) return 0;
  if (payment * n <= received) return 0;
  const pv = (r: number) => (r === 0 ? payment * n : (payment * (1 - Math.pow(1 + r, -n))) / r);
  let lo = 0;
  let hi = 1;
  while (pv(hi) > received) hi *= 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (pv(mid) > received) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function loanCost(input: LoanInput): LoanResult {
  const P = pos(input.amount);
  const n = Math.max(1, Math.round(pos(input.months)));
  const r = monthly(pos(input.rate), input.unit);
  const upfront = pos(input.upfrontFees);
  const perMonth = pos(input.monthlyFees);

  let instalment: number;
  const schedule: LoanResult["schedule"] = [];
  if (input.basis === "flat") {
    const interest = P * r * n;
    instalment = (P + interest) / n;
    let balance = P;
    for (let m = 1; m <= n; m++) {
      const principal = P / n;
      balance -= principal;
      schedule.push({ month: m, payment: instalment, interest: interest / n, principal, balance: Math.max(0, balance) });
    }
  } else {
    instalment = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
    let balance = P;
    for (let m = 1; m <= n; m++) {
      const interest = balance * r;
      const principal = instalment - interest;
      balance -= principal;
      schedule.push({ month: m, payment: instalment, interest, principal, balance: Math.max(0, balance) });
    }
  }

  const totalInterest = instalment * n - P;
  const totalFees = upfront + perMonth * n;
  const payment = instalment + perMonth;
  const received = P - upfront;
  const rm = irrMonthly(received, payment, n);
  return {
    instalment,
    payment,
    totalInterest,
    totalFees,
    totalRepaid: payment * n + upfront,
    totalCost: payment * n + upfront - P,
    received,
    apr: rm * 12 * 100,
    effective: (Math.pow(1 + rm, 12) - 1) * 100,
    schedule,
  };
}
