/**
 * Checkout plans. Amounts are in the currency's subunit (cents / KES cents).
 *
 * If a Paystack plan code is set for a tier (PAYSTACK_PLAN_PRO, PAYSTACK_PLAN_TEAM),
 * checkout creates a recurring monthly subscription and Paystack uses the plan's own
 * amount and currency. Without a plan code it is a single month's charge.
 */
/** USD needs Paystack to enable it on the account; KES works on every Kenyan account. */
const kes = (process.env.PAYSTACK_CURRENCY ?? "USD").toUpperCase() === "KES";

export const checkoutPlans = {
  trial: {
    label: "Kenya desk trial (14 days)",
    amount: 50_000,
    currency: process.env.PAYSTACK_TRIAL_CURRENCY ?? "KES",
    planEnv: null,
  },
  pro: {
    label: "Pro (monthly)",
    amount: kes ? 390_000 : 2_900,
    currency: kes ? "KES" : "USD",
    planEnv: "PAYSTACK_PLAN_PRO",
  },
  professional: {
    label: "Team (monthly)",
    amount: kes ? 1_950_000 : 14_900,
    currency: kes ? "KES" : "USD",
    planEnv: "PAYSTACK_PLAN_TEAM",
  },
} as const;

export type CheckoutPlanId = keyof typeof checkoutPlans;

export function getCheckoutPlan(id: string) {
  if (id !== "trial" && id !== "pro" && id !== "professional") return null;
  const plan = checkoutPlans[id];
  const planCode = plan.planEnv ? process.env[plan.planEnv] : undefined;
  return { id: id as CheckoutPlanId, ...plan, planCode: planCode || null };
}

/** Price label for a tier as it will actually be charged. */
export function chargeLabel(id: CheckoutPlanId) {
  const plan = checkoutPlans[id];
  const major = plan.amount / 100;
  const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(major);
  return plan.currency === "USD" ? `$${amount}` : `${plan.currency} ${amount}`;
}
