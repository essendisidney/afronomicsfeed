/**
 * The debt plan (/rates/kenya/debt-plan): every loan a person carries, Fuliza and mobile loans included, and one
 * monthly budget; out, the order to clear them, the month each one ends and what the charges add up to. Pure
 * arithmetic with no imports, so it runs in the browser and in tests (tests/site/test_debt_plan.py).
 *
 * Each month, in this order:
 * 1. every unpaid balance takes its charge: a percentage a month (mobile loans, SACCO and bank loans as their yearly
 *    rate / 12), or Fuliza's daily fee for the balance's band, for 30 days (data/kenya/mpesa_tariffs.json);
 * 2. every debt gets its minimum payment;
 * 3. whatever is left of the budget goes to one debt at a time, in the order of the strategy:
 *    - "costliest": the debt whose charge is the largest share of its balance this month first (the "avalanche"); it
 *      always costs least in total;
 *    - "smallest": the smallest balance first (the "snowball"); a debt is gone sooner, which keeps some people going.
 *    A cleared debt's minimum stays in the budget and moves on to the next one.
 * "Minimums only" pays the minimums and nothing more, to show what doing nothing new costs.
 */

export type FulizaBand = { min: number; max: number; fee: number };
export type Charge = { kind: "monthly"; pct: number } | { kind: "fuliza"; bands: FulizaBand[] };
export type Debt = { name: string; balance: number; charge: Charge; minimum: number };
export type Strategy = "costliest" | "smallest" | "minimums";

export type PlanResult = {
  strategy: Strategy;
  /** False when the budget never clears the debts: it does not cover the minimums, or charges outgrow payments. */
  feasible: boolean;
  /** Months until every debt is paid, when feasible. */
  months: number | null;
  totalCharges: number;
  totalPaid: number;
  /** The month each debt is cleared, in the order they clear. */
  cleared: { name: string; month: number }[];
  /** The budget is below the sum of the minimum payments. */
  shortOfMinimums: boolean;
};

const MAX_MONTHS = 360;
const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);

/** One month's charge on a balance. Fuliza: the band's daily fee for 30 days (above the top band, the top band's fee). */
export function monthlyCharge(charge: Charge, balance: number): number {
  const b = pos(balance);
  if (!b) return 0;
  if (charge.kind === "monthly") return (b * pos(charge.pct)) / 100;
  const band = charge.bands.find((x) => b >= x.min && b <= x.max) ?? charge.bands[charge.bands.length - 1];
  return band ? band.fee * 30 : 0;
}

/** This month's charge as a % of the balance: how the "costliest" order ranks debts. */
export function monthlyRate(charge: Charge, balance: number): number {
  const b = pos(balance);
  return b ? (monthlyCharge(charge, b) / b) * 100 : 0;
}

export function plan(debts: Debt[], budget: number, strategy: Strategy): PlanResult {
  const live = debts.filter((d) => pos(d.balance) > 0);
  const bal = live.map((d) => pos(d.balance));
  const mins = live.map((d) => pos(d.minimum));
  const minSum = mins.reduce((a, b) => a + b, 0);
  const pay = strategy === "minimums" ? minSum : pos(budget);
  const result: PlanResult = { strategy, feasible: true, months: 0, totalCharges: 0, totalPaid: 0, cleared: [], shortOfMinimums: pos(budget) < minSum };
  if (!live.length) return result;
  const done = new Set<number>();

  for (let month = 1; month <= MAX_MONTHS; month++) {
    const before = bal.reduce((a, b) => a + b, 0);
    live.forEach((d, i) => {
      const c = monthlyCharge(d.charge, bal[i]);
      bal[i] += c;
      result.totalCharges += c;
    });

    let left = pay;
    live.forEach((_, i) => {
      const p = Math.min(bal[i], mins[i], left);
      bal[i] -= p;
      left -= p;
      result.totalPaid += p;
    });

    if (strategy !== "minimums") {
      const order = live
        .map((d, i) => ({ i, rate: monthlyRate(d.charge, bal[i]), balance: bal[i] }))
        .filter((x) => x.balance > 0.005)
        .sort((a, b) => (strategy === "costliest" ? b.rate - a.rate || a.balance - b.balance : a.balance - b.balance || b.rate - a.rate));
      for (const { i } of order) {
        if (left <= 0) break;
        const p = Math.min(bal[i], left);
        bal[i] -= p;
        left -= p;
        result.totalPaid += p;
      }
    }

    live.forEach((d, i) => {
      if (bal[i] <= 0.005 && !done.has(i)) {
        bal[i] = 0;
        done.add(i);
        result.cleared.push({ name: d.name, month });
      }
    });

    const after = bal.reduce((a, b) => a + b, 0);
    if (after <= 0.005) {
      result.months = month;
      return result;
    }
    // Not shrinking: the payments no longer beat the charges, so the debt never ends at this budget.
    if (after >= before - 0.005) break;
  }
  result.feasible = false;
  result.months = null;
  return result;
}

/** All three plans at once, the cheapest feasible one first. */
export function comparePlans(debts: Debt[], budget: number): PlanResult[] {
  const all = (["costliest", "smallest", "minimums"] as Strategy[]).map((s) => plan(debts, budget, s));
  return all.sort((a, b) => Number(b.feasible) - Number(a.feasible) || a.totalCharges - b.totalCharges);
}
