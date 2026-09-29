export type TallySlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited count of units. No tally is stored. */
export const tallySlots: TallySlot[] = [
  {
    slug: "count",
    label: "Count",
    status: "empty",
    lede: "A count needs a named lot. None is stored.",
    href: "/lots",
  },
  {
    slug: "lot",
    label: "Lot",
    status: "empty",
    lede: "A lot needs a publisher. None is attached.",
    href: "/observations",
  },
  {
    slug: "file",
    label: "File",
    status: "empty",
    lede: "A tally file needs a citation. None is stored.",
    href: "/footnotes",
  },
];

export function storedTallyCount() {
  return 0;
}
