export type SettlementSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited cash or security movement. No settlement is stored. */
export const settlementSlots: SettlementSlot[] = [
  {
    slug: "cash",
    label: "Cash",
    status: "empty",
    lede: "A cash settlement needs a cited movement. None is stored.",
    href: "/markets",
  },
  {
    slug: "security",
    label: "Security",
    status: "empty",
    lede: "A security settlement needs a contract file. This page does not invent one.",
    href: "/contracts",
  },
  {
    slug: "net",
    label: "Net",
    status: "empty",
    lede: "A net settlement needs an observation. None is attached.",
    href: "/observations",
  },
];

export function storedSettlementCount() {
  return 0;
}
