export type PermitSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited authorisation. No permit is stored. */
export const permitSlots: PermitSlot[] = [
  {
    slug: "application",
    label: "Application",
    status: "empty",
    lede: "An application needs a filing door. None is stored.",
    href: "/releases",
  },
  {
    slug: "condition",
    label: "Condition",
    status: "empty",
    lede: "A condition needs a cited footnote. None is attached.",
    href: "/footnotes",
  },
  {
    slug: "expiry",
    label: "Expiry",
    status: "empty",
    lede: "An expiry needs a published period. None is stored.",
    href: "/periods",
  },
];

export function storedPermitCount() {
  return 0;
}
