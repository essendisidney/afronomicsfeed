export type AdjustmentSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A change of method. No factor is stored. */
export const adjustmentSlots: AdjustmentSlot[] = [
  {
    slug: "seasonal",
    label: "Seasonal",
    status: "empty",
    lede: "A seasonal adjustment needs a cited method. None is stored.",
    href: "/seasons",
  },
  {
    slug: "rebase",
    label: "Rebase",
    status: "empty",
    lede: "A rebase needs a publisher and a new base date. This page does not invent one.",
    href: "/baselines",
  },
  {
    slug: "revision",
    label: "Revision",
    status: "empty",
    lede: "A revision adjustment needs a filed restatement. None is attached.",
    href: "/revisions",
  },
];

export function storedAdjustmentCount() {
  return 0;
}
