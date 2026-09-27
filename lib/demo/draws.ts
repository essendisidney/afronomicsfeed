export type DrawSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited selection from a series. No draw is stored. */
export const drawSlots: DrawSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price draw needs a cited observation. None is stored.",
    href: "/observations",
  },
  {
    slug: "flow",
    label: "Flow",
    status: "empty",
    lede: "A flow draw needs a publisher. This page does not invent one.",
    href: "/series",
  },
  {
    slug: "dwell",
    label: "Dwell",
    status: "empty",
    lede: "A dwell draw needs a source. None is attached.",
    href: "/samples",
  },
];

export function storedDrawCount() {
  return 0;
}
