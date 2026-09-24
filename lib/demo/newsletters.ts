export type NewsletterProduct = {
  slug: string;
  label: string;
  cadence: "daily" | "weekly" | "event";
  seat: "free" | "pro" | "professional" | "enterprise";
  status: "catalogue" | "sending";
  lede: string;
  href?: string;
};

/** Newsletter catalogue. Nothing is sent from this build. */
export const newsletterProducts: NewsletterProduct[] = [
  {
    slug: "morning-teaser",
    label: "Morning brief teaser",
    cadence: "daily",
    seat: "free",
    status: "catalogue",
    lede: "Headline strip only. Full brief stays on /today until seats land.",
    href: "/today",
  },
  {
    slug: "pro-digest",
    label: "Pro desk digest",
    cadence: "daily",
    seat: "pro",
    status: "catalogue",
    lede: "Would summarise cited opens. Mail runner offline.",
    href: "/packs",
  },
  {
    slug: "weekly-file",
    label: "Weekly file",
    cadence: "weekly",
    seat: "pro",
    status: "catalogue",
    lede: "Points at MD weekly shells. No invented subscriber count.",
    href: "/weekly",
  },
  {
    slug: "signal-alert",
    label: "Signal alert mail",
    cadence: "event",
    seat: "professional",
    status: "catalogue",
    lede: "Would fire after a cited signal opens. Queue not armed.",
    href: "/signals",
  },
  {
    slug: "enterprise-pack",
    label: "Enterprise pack mail",
    cadence: "event",
    seat: "enterprise",
    status: "catalogue",
    lede: "Licensed delivery only. No inbox invent.",
    href: "/feeds",
  },
];

export function sendingNewsletterCount() {
  return newsletterProducts.filter((item) => item.status === "sending").length;
}
