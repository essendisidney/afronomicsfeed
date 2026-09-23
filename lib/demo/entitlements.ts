import { pricing } from "@/lib/site";

export type SeatTier = "free" | "pro" | "professional" | "enterprise" | "trial";

export type EntitlementRow = {
  feature: string;
  free: string;
  pro: string;
  professional: string;
  enterprise: string;
};

/** Honest product matrix. Nothing here unlocks without a real seat. */
export const entitlementRows: EntitlementRow[] = [
  {
    feature: "Headlines & Morning Brief teasers",
    free: "Yes",
    pro: "Yes",
    professional: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "Country / economy / industry files",
    free: "Shells",
    pro: "Full desk",
    professional: "Full desk",
    enterprise: "Full desk",
  },
  {
    feature: "Capital & climate explorers",
    free: "Preview",
    pro: "Yes",
    professional: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "Saved watches & alerts",
    free: "—",
    pro: "Yes",
    professional: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "Ask Afronomics",
    free: "Refuse only",
    pro: "Allowance",
    professional: "Higher allowance",
    enterprise: "Custom",
  },
  {
    feature: "Exports / CSV",
    free: "—",
    pro: "—",
    professional: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "Ask corpus / RAG",
    free: "Refuse",
    pro: "Allowance",
    professional: "Higher allowance",
    enterprise: "Custom",
  },
  {
    feature: "Briefing packs",
    free: "Teasers",
    pro: "Yes",
    professional: "Yes",
    enterprise: "Custom",
  },
  {
    feature: "Enterprise feeds",
    free: "—",
    pro: "—",
    professional: "Catalogue",
    enterprise: "Licensed",
  },
  {
    feature: "API keys",
    free: "—",
    pro: "—",
    professional: "Allowance",
    enterprise: "Licence",
  },
  {
    feature: "Project Lens depth",
    free: "Shell",
    pro: "Shell",
    professional: "Yes",
    enterprise: "Yes",
  },
  {
    feature: "Feeds / white-label",
    free: "—",
    pro: "—",
    professional: "—",
    enterprise: "Yes",
  },
];

export const seats = [
  {
    slug: "free" as const,
    ...pricing.free,
    note: "No card. No session required.",
  },
  {
    slug: "pro" as const,
    ...pricing.pro,
    note: "Checkout not live.",
  },
  {
    slug: "professional" as const,
    ...pricing.professional,
    note: "Checkout not live. Keys not issued.",
  },
  {
    slug: "enterprise" as const,
    ...pricing.enterprise,
    note: "Contact the desk. No fake quote form.",
  },
  {
    slug: "trial" as const,
    name: pricing.trial.name,
    price: pricing.trial.price,
    cadence: "14 days",
    detail: pricing.trial.detail,
    note: "M-Pesa checkout not live.",
  },
] as const;

/** Always anonymous until Auth is provisioned. */
export function currentSeat(): { tier: SeatTier; label: string; signedIn: false } {
  return { tier: "free", label: "Anonymous · Free", signedIn: false };
}
