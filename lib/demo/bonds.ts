export type BondSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited security on a contract. No bond amount is stored. */
export const bondSlots: BondSlot[] = [
  {
    slug: "name",
    label: "Name",
    status: "empty",
    lede: "A name needs a contract. None is stored.",
    href: "/contracts",
  },
  {
    slug: "term",
    label: "Term",
    status: "empty",
    lede: "A term needs a period. None is attached.",
    href: "/periods",
  },
  {
    slug: "file",
    label: "File",
    status: "empty",
    lede: "A bond file needs a citation. None is stored.",
    href: "/citations",
  },
];

export function storedBondCount() {
  return 0;
}
