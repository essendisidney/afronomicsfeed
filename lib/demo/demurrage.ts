export type DemurrageSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited charge after an allowance. No charge is stored. */
export const demurrageSlots: DemurrageSlot[] = [
  {
    slug: "period",
    label: "Period",
    status: "empty",
    lede: "A period needs a period file. None is stored.",
    href: "/periods",
  },
  {
    slug: "notice",
    label: "Notice",
    status: "empty",
    lede: "A notice needs a notice file. None is attached.",
    href: "/notices",
  },
  {
    slug: "record",
    label: "Record",
    status: "empty",
    lede: "A demurrage record needs a citation. None is stored.",
    href: "/citations",
  },
];

export function storedDemurrageCount() {
  return 0;
}
