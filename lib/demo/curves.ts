export type CurveSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A plotted term structure. No curve is stored. */
export const curveSlots: CurveSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price curve needs cited points. None is stored.",
    href: "/markets",
  },
  {
    slug: "yield",
    label: "Yield",
    status: "empty",
    lede: "A yield curve needs a publisher. This page does not invent one.",
    href: "/benchmarks",
  },
  {
    slug: "fx",
    label: "FX",
    status: "empty",
    lede: "An FX curve needs a source. None is attached.",
    href: "/series",
  },
];

export function storedCurveCount() {
  return 0;
}
