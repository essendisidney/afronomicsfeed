export type PrecisionSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** How fine a print is. No precision is stored. */
export const precisionSlots: PrecisionSlot[] = [
  {
    slug: "decimal",
    label: "Decimal",
    status: "empty",
    lede: "A decimal precision needs a publisher. None is stored.",
    href: "/series",
  },
  {
    slug: "unit",
    label: "Unit",
    status: "empty",
    lede: "A unit precision needs a cited measure. This page does not invent one.",
    href: "/units",
  },
  {
    slug: "timestamp",
    label: "Timestamp",
    status: "empty",
    lede: "A timestamp precision needs a source and a clock. None is attached.",
    href: "/observations",
  },
];

export function storedPrecisionCount() {
  return 0;
}
