export type ConstituentSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A member of a named set. No constituent is stored. */
export const constituentSlots: ConstituentSlot[] = [
  {
    slug: "index",
    label: "Index",
    status: "empty",
    lede: "An index member needs a named security and a date. None is stored.",
    href: "/markets",
  },
  {
    slug: "company",
    label: "Company",
    status: "empty",
    lede: "A company member needs a cited file. This page does not invent one.",
    href: "/companies",
  },
  {
    slug: "commodity",
    label: "Commodity",
    status: "empty",
    lede: "A commodity member needs a source and a unit. None is attached.",
    href: "/baskets",
  },
];

export function storedConstituentCount() {
  return 0;
}
