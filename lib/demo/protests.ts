export type ProtestSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited note against a lot. No protest is stored. */
export const protestSlots: ProtestSlot[] = [
  {
    slug: "note",
    label: "Note",
    status: "empty",
    lede: "A note needs a footnote. None is stored.",
    href: "/footnotes",
  },
  {
    slug: "lot",
    label: "Lot",
    status: "empty",
    lede: "A lot needs a lot file. None is attached.",
    href: "/lots",
  },
  {
    slug: "file",
    label: "File",
    status: "empty",
    lede: "A protest file needs a citation. None is stored.",
    href: "/citations",
  },
];

export function storedProtestCount() {
  return 0;
}
