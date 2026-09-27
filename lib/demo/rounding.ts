export type RoundingSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A rounding rule. No convention is stored. */
export const roundingSlots: RoundingSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price rounding rule needs a source and a unit. None is stored.",
    href: "/precision",
  },
  {
    slug: "index",
    label: "Index",
    status: "empty",
    lede: "An index rounding rule needs a publisher. This page does not invent one.",
    href: "/scales",
  },
  {
    slug: "fx",
    label: "FX",
    status: "empty",
    lede: "An FX rounding rule needs a cited rate convention. None is attached.",
    href: "/markets",
  },
];

export function storedRoundingCount() {
  return 0;
}
