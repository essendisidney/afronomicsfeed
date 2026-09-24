export type TrustSurface = {
  slug: string;
  label: string;
  status: "live" | "scaffold" | "blocked";
  lede: string;
  href: string;
};

/** Trust center index. Status mirrors honest product posture — no invented audits. */
export const trustSurfaces: TrustSurface[] = [
  {
    slug: "method",
    label: "Method",
    status: "live",
    lede: "Facts / analysis / opinion. Empty until sourced.",
    href: "/method",
  },
  {
    slug: "security",
    label: "Security",
    status: "scaffold",
    lede: "Control list. No SOC 2 invent.",
    href: "/security",
  },
  {
    slug: "sla",
    label: "SLA",
    status: "scaffold",
    lede: "Commitment shapes. No fake uptime %.",
    href: "/sla",
  },
  {
    slug: "cookies",
    label: "Cookies",
    status: "scaffold",
    lede: "Posture only. No consent banner invent.",
    href: "/legal/cookies",
  },
  {
    slug: "privacy",
    label: "Privacy",
    status: "scaffold",
    lede: "Draft notice. Not in force until counsel.",
    href: "/legal/privacy",
  },
  {
    slug: "golive",
    label: "Go-live gates",
    status: "blocked",
    lede: "Blocked stores stay blocked until prints can land.",
    href: "/golive",
  },
  {
    slug: "accessibility",
    label: "Accessibility",
    status: "scaffold",
    lede: "Honest posture. WCAG claim untested.",
    href: "/accessibility",
  },
];

export function trustByStatus(status: TrustSurface["status"]) {
  return trustSurfaces.filter((item) => item.status === status);
}
