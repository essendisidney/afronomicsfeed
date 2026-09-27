export type WeightSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A share inside a named set. No weight is stored. */
export const weightSlots: WeightSlot[] = [
  {
    slug: "index",
    label: "Index",
    status: "empty",
    lede: "An index weight needs a member and a method. None is stored.",
    href: "/baskets",
  },
  {
    slug: "currency",
    label: "Currency",
    status: "empty",
    lede: "A currency weight needs a publisher and a pair. This page does not invent one.",
    href: "/markets",
  },
  {
    slug: "commodity",
    label: "Commodity",
    status: "empty",
    lede: "A commodity weight needs a cited member and a unit. None is attached.",
    href: "/series",
  },
];

export function storedWeightCount() {
  return 0;
}
