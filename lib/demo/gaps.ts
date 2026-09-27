export type GapSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A missing print. No gap is recorded. */
export const gapSlots: GapSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price gap needs a series and a missing date. None is recorded.",
    href: "/series",
  },
  {
    slug: "flow",
    label: "Flow",
    status: "empty",
    lede: "A flow gap needs a licensed cargo series. This page does not invent one.",
    href: "/trade",
  },
  {
    slug: "dwell",
    label: "Dwell",
    status: "empty",
    lede: "A dwell gap needs a named post and a date. None is attached.",
    href: "/borders",
  },
];

export function recordedGapCount() {
  return 0;
}
