export type RevisionSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** Revision shapes. No restatement is posted. */
export const revisionSlots: RevisionSlot[] = [
  {
    slug: "figure",
    label: "Figure restatement",
    status: "empty",
    lede: "A changed figure needs the old print, the new print and a source. None is posted.",
    href: "/corrections",
  },
  {
    slug: "method",
    label: "Method change",
    status: "empty",
    lede: "A method change belongs on the registry. This slot does not invent one.",
    href: "/method/registry",
  },
  {
    slug: "desk-note",
    label: "Desk note",
    status: "empty",
    lede: "No dated note is stored as a sample revision.",
    href: "/changelog",
  },
];

export function postedRevisionCount() {
  return 0;
}
