/**
 * What a rate alert can watch, in words: the only part of lib/rate-alerts-core.ts the sign-up form
 * (components/ui/RateAlertForm.tsx) needs, kept apart so the form does not ship the due-check logic to the browser.
 */

export const alertKinds = ["auction", "tbill_above", "tbill_below", "ng_savings_bond", "policy_change", "mmf_month", "series"] as const;
export type AlertKind = (typeof alertKinds)[number];
export const alertTenors = [91, 182, 364] as const;
export type AlertTenor = (typeof alertTenors)[number];

export const kindLabel: Record<AlertKind, string> = {
  auction: "Every Kenya T-bill auction result",
  tbill_above: "A Kenya T-bill rate rises above a level",
  tbill_below: "A Kenya T-bill rate falls below a level",
  ng_savings_bond: "A new Nigeria FGN Savings Bond offer",
  policy_change: "Any central bank changes its policy rate",
  mmf_month: "Each month’s Kenya money market fund ranking",
  series: "A number I follow changes",
};
