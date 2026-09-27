export type BaselineSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A starting print. No baseline is stored. */
export const baselineSlots: BaselineSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price baseline needs a source, a unit and a date. None is stored.",
    href: "/observations",
  },
  {
    slug: "index",
    label: "Index",
    status: "empty",
    lede: "An index baseline needs a publisher and a start date. This page does not invent one.",
    href: "/benchmarks",
  },
  {
    slug: "flow",
    label: "Flow",
    status: "empty",
    lede: "A flow baseline needs a licensed series. None is attached.",
    href: "/trade",
  },
];

export function storedBaselineCount() {
  return 0;
}
