export type SlaCommitment = {
  slug: string;
  label: string;
  tier: "professional" | "enterprise" | "platform";
  status: "draft" | "contracted" | "empty";
  lede: string;
};

/**
 * Service commitments for seats.
 * Empty / draft only — never invent a measured uptime %.
 */
export const slaCommitments: SlaCommitment[] = [
  {
    slug: "site-availability",
    label: "Public site availability",
    tier: "platform",
    status: "draft",
    lede: "Hosted on Vercel. No contracted uptime % is published until Enterprise paperwork lands.",
  },
  {
    slug: "status-page",
    label: "Status communication",
    tier: "platform",
    status: "draft",
    lede: "Honest surface board at /status. No fake green lights for dark stores.",
  },
  {
    slug: "api-allowance",
    label: "API allowance",
    tier: "professional",
    status: "empty",
    lede: "Keys not issued. Allowance language waits on a live seat.",
  },
  {
    slug: "feed-delivery",
    label: "Feed / webhook delivery",
    tier: "enterprise",
    status: "empty",
    lede: "Catalogue only. No delivery SLO until a runner is armed.",
  },
  {
    slug: "support-response",
    label: "Support response window",
    tier: "enterprise",
    status: "empty",
    lede: "No ticket queue. Contact via advisory when institutional.",
  },
  {
    slug: "data-freshness",
    label: "Cited print freshness",
    tier: "platform",
    status: "draft",
    lede: "As-of on every observation. Empty cells until a source is cited — not a latency invent.",
  },
];

export function contractedSlaCount() {
  return slaCommitments.filter((item) => item.status === "contracted").length;
}
