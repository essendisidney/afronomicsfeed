export type FactorSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A conversion between two cited units. No factor is stored. */
export const factorSlots: FactorSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price factor needs two cited units. None is stored.",
    href: "/markets",
  },
  {
    slug: "fx",
    label: "FX",
    status: "empty",
    lede: "An FX factor needs a publisher. This page does not invent one.",
    href: "/series",
  },
  {
    slug: "unit",
    label: "Unit",
    status: "empty",
    lede: "A unit factor needs a source. None is attached.",
    href: "/units",
  },
];

export function storedFactorCount() {
  return 0;
}
