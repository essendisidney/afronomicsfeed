export type StowageSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited placement of cargo. No stowage plan is stored. */
export const stowageSlots: StowageSlot[] = [
  {
    slug: "plan",
    label: "Plan",
    status: "empty",
    lede: "A plan needs a corridor file. None is stored.",
    href: "/trade",
  },
  {
    slug: "bay",
    label: "Bay",
    status: "empty",
    lede: "A bay needs a warehouse file. None is attached.",
    href: "/warehouses",
  },
  {
    slug: "record",
    label: "Record",
    status: "empty",
    lede: "A placement record needs an observation. None is stored.",
    href: "/observations",
  },
];

export function storedStowageCount() {
  return 0;
}
