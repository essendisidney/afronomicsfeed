export type StampSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** An as-of mark. No date is stored. */
export const stampSlots: StampSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price stamp needs a cited as-of. None is stored.",
    href: "/observations",
  },
  {
    slug: "flow",
    label: "Flow",
    status: "empty",
    lede: "A flow stamp needs a publisher. This page does not invent one.",
    href: "/vintages",
  },
  {
    slug: "dwell",
    label: "Dwell",
    status: "empty",
    lede: "A dwell stamp needs a source. None is attached.",
    href: "/series",
  },
];

export function storedStampCount() {
  return 0;
}
