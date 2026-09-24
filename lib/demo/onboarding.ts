export type OnboardingStep = {
  slug: string;
  label: string;
  status: "open" | "gated" | "done";
  lede: string;
  href: string;
};

/** New-seat path. Done stays empty until Auth marks progress. */
export const onboardingSteps: OnboardingStep[] = [
  {
    slug: "read-method",
    label: "Read the method",
    status: "open",
    lede: "Facts, analysis, opinion and empty cells.",
    href: "/method",
  },
  {
    slug: "open-country",
    label: "Open a country terminal",
    status: "open",
    lede: "Start with a featured desk. Prints stay blank until cited.",
    href: "/countries/kenya",
  },
  {
    slug: "walk-graph",
    label: "Walk a graph desk",
    status: "open",
    lede: "Edges are editorial scaffolds, not invented relationships.",
    href: "/graph/kenya",
  },
  {
    slug: "try-ask",
    label: "Try Ask (refuse is correct)",
    status: "open",
    lede: "Corpus is empty. The desk refuses invented numbers.",
    href: "/ask",
  },
  {
    slug: "sign-in",
    label: "Sign in for a seat",
    status: "gated",
    lede: "Auth is not live. Every visitor stays Free.",
    href: "/login",
  },
  {
    slug: "save-watch",
    label: "Save a watch",
    status: "gated",
    lede: "Requires a Pro seat. Store empty.",
    href: "/watchlists",
  },
];

export function completedOnboarding() {
  return [] as { id: string; stepSlug: string; at: string }[];
}
