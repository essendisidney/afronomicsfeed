export type FootnoteSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A caveat on a print. No footnote is stored. */
export const footnoteSlots: FootnoteSlot[] = [
  {
    slug: "method",
    label: "Method",
    status: "empty",
    lede: "A method note needs a publisher. None is stored.",
    href: "/method",
  },
  {
    slug: "break",
    label: "Break",
    status: "empty",
    lede: "A series break needs a date and a source. This page does not invent one.",
    href: "/lineage",
  },
  {
    slug: "caveat",
    label: "Caveat",
    status: "empty",
    lede: "A caveat needs a citation. None is attached.",
    href: "/citations",
  },
];

export function storedFootnoteCount() {
  return 0;
}
