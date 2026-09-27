export type LagSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** Delay between an event and a print. No lag is stored. */
export const lagSlots: LagSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price lag needs a series and two dates. None is stored.",
    href: "/series",
  },
  {
    slug: "flow",
    label: "Flow",
    status: "empty",
    lede: "A flow lag needs a licensed cargo series. This page does not invent one.",
    href: "/trade",
  },
  {
    slug: "dwell",
    label: "Dwell",
    status: "empty",
    lede: "A dwell lag needs a named post and a date. None is attached.",
    href: "/borders",
  },
];

export function storedLagCount() {
  return 0;
}
