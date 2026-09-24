export type A11yCheck = {
  slug: string;
  label: string;
  status: "pass" | "partial" | "fail" | "untested";
  lede: string;
  href?: string;
};

/**
 * Accessibility posture. Untested stays untested — no invented WCAG badge.
 */
export const a11yChecks: A11yCheck[] = [
  {
    slug: "semantic-landmarks",
    label: "Landmarks and headings",
    status: "partial",
    lede: "App shell uses landmarks. Not every file page has been audited.",
  },
  {
    slug: "keyboard",
    label: "Keyboard reach",
    status: "partial",
    lede: "Primary nav and search are reachable. Full terminal audit pending.",
    href: "/terminal",
  },
  {
    slug: "contrast",
    label: "Colour contrast",
    status: "partial",
    lede: "Forest / ink / gold tokens aim for readable contrast. No formal audit report.",
    href: "/brand",
  },
  {
    slug: "focus-visible",
    label: "Focus visibility",
    status: "untested",
    lede: "Theme and focus rings exist. Systematic review not logged.",
  },
  {
    slug: "alt-text",
    label: "Image alternatives",
    status: "partial",
    lede: "Chrome marks are decorative or labelled. Media kit downloads empty.",
    href: "/press",
  },
  {
    slug: "wcag-claim",
    label: "WCAG 2.2 AA claim",
    status: "untested",
    lede: "No conformance claim is published. Do not invent a badge.",
  },
];

export function a11yByStatus(status: A11yCheck["status"]) {
  return a11yChecks.filter((item) => item.status === status);
}
