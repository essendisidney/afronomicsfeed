export type ShortageSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited gap against a lot. No shortage is stored. */
export const shortageSlots: ShortageSlot[] = [
  {
    slug: "gap",
    label: "Gap",
    status: "empty",
    lede: "A gap needs a gap file. None is stored.",
    href: "/gaps",
  },
  {
    slug: "lot",
    label: "Lot",
    status: "empty",
    lede: "A lot needs a lot file. None is attached.",
    href: "/lots",
  },
  {
    slug: "note",
    label: "Note",
    status: "empty",
    lede: "A shortage note needs a footnote. None is stored.",
    href: "/footnotes",
  },
];

export function storedShortageCount() {
  return 0;
}
