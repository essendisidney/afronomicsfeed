export type SpreadSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A gap between two prints. No spread is stored. */
export const spreadSlots: SpreadSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price spread needs two sourced prints and a unit. None is stored.",
    href: "/observations",
  },
  {
    slug: "fx",
    label: "FX",
    status: "empty",
    lede: "An FX spread needs two cited rates and a timestamp. This page does not invent one.",
    href: "/markets",
  },
  {
    slug: "yield",
    label: "Yield",
    status: "empty",
    lede: "A yield spread needs a publisher and two tenors. None is attached.",
    href: "/benchmarks",
  },
];

export function storedSpreadCount() {
  return 0;
}
