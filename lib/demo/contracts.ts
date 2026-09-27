export type ContractSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited agreement. No contract is stored. */
export const contractSlots: ContractSlot[] = [
  {
    slug: "spot",
    label: "Spot",
    status: "empty",
    lede: "A spot contract needs a cited instrument. None is stored.",
    href: "/markets",
  },
  {
    slug: "forward",
    label: "Forward",
    status: "empty",
    lede: "A forward needs a publisher. This page does not invent one.",
    href: "/horizons",
  },
  {
    slug: "swap",
    label: "Swap",
    status: "empty",
    lede: "A swap needs a source. None is attached.",
    href: "/series",
  },
];

export function storedContractCount() {
  return 0;
}
