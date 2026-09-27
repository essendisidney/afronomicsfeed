export type ThresholdSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A level that would fire a note. No number is stored. */
export const thresholdSlots: ThresholdSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price threshold needs a series, a unit and a level. None is stored.",
    href: "/series",
  },
  {
    slug: "flow",
    label: "Flow",
    status: "empty",
    lede: "A flow threshold needs a licensed cargo series. This page does not invent one.",
    href: "/trade",
  },
  {
    slug: "dwell",
    label: "Dwell",
    status: "empty",
    lede: "A dwell threshold needs a named post and a date. None is attached.",
    href: "/borders",
  },
];

export function storedThresholdCount() {
  return 0;
}
