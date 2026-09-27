export type BasketSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A named set. No weight is stored. */
export const basketSlots: BasketSlot[] = [
  {
    slug: "index",
    label: "Index",
    status: "empty",
    lede: "An index basket needs constituents and weights. None are stored.",
    href: "/markets",
  },
  {
    slug: "currency",
    label: "Currency",
    status: "empty",
    lede: "A currency basket needs a publisher and a method. This page does not invent one.",
    href: "/markets",
  },
  {
    slug: "commodity",
    label: "Commodity",
    status: "empty",
    lede: "A commodity basket needs cited members. None are attached.",
    href: "/series",
  },
];

export function storedBasketCount() {
  return 0;
}
