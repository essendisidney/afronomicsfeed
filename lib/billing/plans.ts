export const checkoutPlans = {
  trial: {
    label: "Kenya desk trial",
    amount: 50_000,
    currency: "KES",
  },
  pro: {
    label: "Pro",
    amount: 2_900,
    currency: "USD",
  },
  professional: {
    label: "Professional",
    amount: 14_900,
    currency: "USD",
  },
} as const;

export type CheckoutPlanId = keyof typeof checkoutPlans;

export function getCheckoutPlan(id: string): ({ id: CheckoutPlanId } & (typeof checkoutPlans)[CheckoutPlanId]) | null {
  if (id === "trial" || id === "pro" || id === "professional") {
    return { id, ...checkoutPlans[id] };
  }
  return null;
}
