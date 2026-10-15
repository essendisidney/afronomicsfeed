/**
 * The savings goal planner (/rates/kenya/savings-goal): how much to put away each month to reach a goal by a date,
 * in each place a saver can keep money, at today's after-tax rates. Pure arithmetic with no imports, so it runs in the
 * browser and in tests (tests/site/test_savings_goal.py).
 *
 * Deposits are made at the end of each month and earn the place's after-tax rate, compounded monthly. A rate quoted
 * as an effective annual yield (money market funds) is turned into its monthly equivalent; a nominal yearly rate
 * (banks) is divided by 12.
 */

export type Place = { name: string; short?: string; net: number; effective: boolean; note: string; href?: string }; // short: for running text

export const monthlyRate = (p: Pick<Place, "net" | "effective">) =>
  p.effective ? Math.pow(1 + p.net / 100, 1 / 12) - 1 : p.net / 100 / 12;

/** What `start` today plus `monthly` at the end of each month grows to after `months`, at monthly rate `r`. */
export function futureValue(start: number, monthly: number, months: number, r: number) {
  const g = Math.pow(1 + r, months);
  return start * g + (r === 0 ? monthly * months : (monthly * (g - 1)) / r);
}

/** The monthly saving that reaches `goal` in `months`, given `start` already saved. Zero if `start` gets there alone. */
export function monthlyNeeded(goal: number, start: number, months: number, r: number) {
  const n = Math.max(1, Math.round(months));
  const g = Math.pow(1 + r, n);
  const gap = goal - start * g;
  if (gap <= 0) return 0;
  return r === 0 ? gap / n : (gap * r) / (g - 1);
}

export function plan(goal: number, start: number, months: number, places: Place[]) {
  const n = Math.max(1, Math.round(months));
  const s = Math.max(0, start);
  return places
    .map((p) => {
      const r = monthlyRate(p);
      const monthly = monthlyNeeded(goal, s, n, r);
      const paidIn = s + monthly * n;
      return { place: p, monthly, paidIn, interest: Math.max(0, futureValue(s, monthly, n, r) - paidIn) };
    })
    .sort((a, b) => a.monthly - b.monthly);
}

/** Whole months from `fromIso` (YYYY-MM-DD) to the start of month `toYm` (YYYY-MM); at least 1. */
export function monthsUntil(fromIso: string, toYm: string) {
  const [fy, fm] = fromIso.split("-").map(Number);
  const [ty, tm] = toYm.split("-").map(Number);
  return Math.max(1, (ty - fy) * 12 + (tm - fm));
}
