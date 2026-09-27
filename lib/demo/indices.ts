export type IndexSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited basket of prices. No index is stored. */
export const indexSlots: IndexSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price index needs cited constituents. None is stored.",
    href: "/markets",
  },
  {
    slug: "currency",
    label: "Currency",
    status: "empty",
    lede: "A currency index needs a publisher. This page does not invent one.",
    href: "/baskets",
  },
  {
    slug: "commodity",
    label: "Commodity",
    status: "empty",
    lede: "A commodity index needs a source. None is attached.",
    href: "/constituents",
  },
];

export function storedIndexCount() {
  return 0;
}
