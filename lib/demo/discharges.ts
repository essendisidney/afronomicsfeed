export type DischargeSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited movement out of a place. No discharge is stored. */
export const dischargeSlots: DischargeSlot[] = [
  {
    slug: "lot",
    label: "Lot",
    status: "empty",
    lede: "A lot needs a lot file. None is stored.",
    href: "/lots",
  },
  {
    slug: "place",
    label: "Place",
    status: "empty",
    lede: "A place needs a warehouse file. None is attached.",
    href: "/warehouses",
  },
  {
    slug: "file",
    label: "File",
    status: "empty",
    lede: "A discharge file needs an observation. None is stored.",
    href: "/observations",
  },
];

export function storedDischargeCount() {
  return 0;
}
