export type FixSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited fixing. No rate is stored. */
export const fixSlots: FixSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price fixing needs a cited print. None is stored.",
    href: "/markets",
  },
  {
    slug: "fx",
    label: "FX",
    status: "empty",
    lede: "An FX fixing needs a publisher. This page does not invent one.",
    href: "/series",
  },
  {
    slug: "rate",
    label: "Rate",
    status: "empty",
    lede: "A rate fixing needs a source. None is attached.",
    href: "/benchmarks",
  },
];

export function storedFixCount() {
  return 0;
}
