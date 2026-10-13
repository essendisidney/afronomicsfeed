import { institutionalTier, KES_PER_USD, localInstitutionPrices, type InstitutionalTierId } from "./ratecard";

const kenyaLocal = localInstitutionPrices.find((p) => p.id === "kenya")!;

/**
 * Checkout plans. Amounts are in the currency's subunit (KES cents / US cents).
 *
 * Afronomics bills in KES by default: every Kenyan Paystack account can take KES by M-Pesa, card and
 * bank transfer, while USD needs Paystack to enable it. Set PAYSTACK_CURRENCY=USD to charge Pro and
 * Team in dollars once that is on.
 *
 * If a Paystack plan code is set for a tier (PAYSTACK_PLAN_PRO, _TEAM, _PACK, _PACK_PLUS, _WHATSAPP, _LICENCE,
 * _WIDGET, _FUND, _TENDERS, _ANALYST, _DATA_TEAM, _ANALYST_KE, _DATA_TEAM_KE), checkout creates a recurring monthly subscription and Paystack uses
 * the plan's own amount and currency. Without a plan code it is a single charge for one period. Prices come from
 * lib/billing/ratecard.ts.
 *
 * The institutional ladder (Analyst, Team and API) is priced in US dollars on the rate card. With PAYSTACK_CURRENCY=USD
 * it is charged in dollars (card only); otherwise it is charged as the shilling equivalent at the rate card's own
 * KES_PER_USD, so M-Pesa works too. The dollar price never changes; only the currency it is collected in.
 */
const usd = (process.env.PAYSTACK_CURRENCY ?? "KES").toUpperCase() === "USD";

/** A rate-card dollar price in the currency the checkout collects, in subunits. */
function institutional(id: InstitutionalTierId) {
  const dollars = institutionalTier(id).monthlyUsd;
  return usd ? { amount: dollars * 100, currency: "USD" as const } : { amount: dollars * KES_PER_USD * 100, currency: "KES" as const };
}

export const checkoutPlans = {
  trial: {
    label: "Kenya desk trial (14 days)",
    product: "Pro, fourteen days",
    amount: 20_000,
    currency: "KES",
    planEnv: null,
  },
  pro: {
    label: "Pro (monthly)",
    product: "Afronomics Pro",
    amount: usd ? 1_200 : 150_000,
    currency: usd ? "USD" : "KES",
    planEnv: "PAYSTACK_PLAN_PRO",
  },
  professional: {
    label: "Team (monthly)",
    product: "Afronomics Team",
    amount: usd ? 4_900 : 600_000,
    currency: usd ? "USD" : "KES",
    planEnv: "PAYSTACK_PLAN_TEAM",
  },
  pack: {
    label: "Investment Committee Pack (monthly)",
    product: "Investment Committee Pack",
    amount: 1_200_000,
    currency: "KES",
    planEnv: "PAYSTACK_PLAN_PACK",
  },
  pack_plus: {
    label: "Investment Committee Pack with alerts (monthly)",
    product: "Investment Committee Pack with alerts",
    amount: 1_800_000,
    currency: "KES",
    planEnv: "PAYSTACK_PLAN_PACK_PLUS",
  },
  pack_single: { label: "Single committee pack", product: "This month’s Investment Committee Pack", amount: 100_000, currency: "KES", planEnv: null },
  alerts_whatsapp: { label: "Auction alerts on WhatsApp (monthly)", product: "Auction alerts on WhatsApp", amount: 30_000, currency: "KES", planEnv: "PAYSTACK_PLAN_WHATSAPP" },
  benchmarking: { label: "Treasury benchmarking (quarter)", product: "Treasury benchmarking, one quarter", amount: 4_000_000, currency: "KES", planEnv: null },
  licence_startup: { label: "Startup data licence (monthly)", product: "Startup data licence", amount: 750_000, currency: "KES", planEnv: "PAYSTACK_PLAN_LICENCE" },
  widget: { label: "Branded live-rates widget (monthly)", product: "Branded live-rates widget", amount: 4_000_000, currency: "KES", planEnv: "PAYSTACK_PLAN_WIDGET" },
  fund_listing: { label: "Verified fund listing (monthly)", product: "Verified fund listing", amount: 2_000_000, currency: "KES", planEnv: "PAYSTACK_PLAN_FUND" },
  sacco_listing: { label: "Verified SACCO listing (monthly)", product: "Verified SACCO listing", amount: 2_000_000, currency: "KES", planEnv: "PAYSTACK_PLAN_SACCO" },
  job_listing: { label: "Jobs listing (30 days)", product: "Jobs listing, 30 days", amount: 1_000_000, currency: "KES", planEnv: null },
  tender_alerts: { label: "Tender alerts (monthly)", product: "Tender alerts, one month", amount: 50_000, currency: "KES", planEnv: "PAYSTACK_PLAN_TENDERS" },
  tender_alerts_year: { label: "Tender alerts (a year)", product: "Tender alerts, twelve months", amount: 500_000, currency: "KES", planEnv: null },
  analyst: { label: "Analyst (monthly)", product: "Afronomics Data: Analyst, one month", ...institutional("analyst"), planEnv: "PAYSTACK_PLAN_ANALYST" },
  data_team: { label: "Team and API (monthly)", product: "Afronomics Data: Team and API, one month", ...institutional("team"), planEnv: "PAYSTACK_PLAN_DATA_TEAM" },
  // Kenyan local-institution prices (D-014): only for institutions that meet localInstitutionRule.
  analyst_ke: { label: "Analyst, Kenyan institution (monthly)", product: "Afronomics Data: Analyst (Kenyan institution), one month", amount: kenyaLocal.analyst * 100, currency: "KES", planEnv: "PAYSTACK_PLAN_ANALYST_KE" },
  data_team_ke: { label: "Team and API, Kenyan institution (monthly)", product: "Afronomics Data: Team and API (Kenyan institution), one month", amount: kenyaLocal.team * 100, currency: "KES", planEnv: "PAYSTACK_PLAN_DATA_TEAM_KE" },
} as const;

export type CheckoutPlanId = keyof typeof checkoutPlans;

export function isCheckoutPlan(id: string): id is CheckoutPlanId {
  return Object.prototype.hasOwnProperty.call(checkoutPlans, id);
}

export function getCheckoutPlan(id: string) {
  if (!isCheckoutPlan(id)) return null;
  const plan = checkoutPlans[id];
  const planCode = plan.planEnv ? process.env[plan.planEnv] : undefined;
  return { id, ...plan, planCode: planCode || null };
}

/** Price label for a tier as it will actually be charged. */
export function chargeLabel(id: CheckoutPlanId) {
  const plan = checkoutPlans[id];
  const major = plan.amount / 100;
  const amount = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(major);
  return plan.currency === "USD" ? `$${amount}` : `${plan.currency} ${amount}`;
}

/** The rate-card dollar price of an institutional checkout plan, and what checkout will actually take. */
export function institutionalCharge(id: "analyst" | "data_team") {
  const plan = checkoutPlans[id];
  const usdPrice = institutionalTier(id === "analyst" ? "analyst" : "team").monthlyUsd;
  const dollars = `$${usdPrice.toLocaleString("en-US")}`;
  if (plan.currency === "USD") return { dollars, charged: dollars, note: "Card payment in US dollars." };
  return {
    dollars,
    charged: chargeLabel(id),
    note: `Charged as ${chargeLabel(id)} (KES ${KES_PER_USD} to the dollar), so M-Pesa, card and bank transfer all work.`,
  };
}

/** Money as paid, from a Paystack amount in subunits. */
export function moneyLabel(amount: number, currency: string | null) {
  const major = amount / 100;
  const text = new Intl.NumberFormat("en-US", { maximumFractionDigits: major % 1 ? 2 : 0 }).format(major);
  return currency === "USD" ? `$${text}` : `${currency ?? ""} ${text}`.trim();
}

// Keys: PAYSTACK_SECRET_KEY on Vercel (live in production, test in preview).
