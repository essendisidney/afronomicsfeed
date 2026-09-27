export type VintageSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A restatement vintage. Nothing is posted. */
export const vintageSlots: VintageSlot[] = [
  {
    slug: "first-print",
    label: "First print",
    status: "empty",
    lede: "A first print needs a source and a date. None is stored.",
    href: "/observations",
  },
  {
    slug: "restatement",
    label: "Restatement",
    status: "empty",
    lede: "A restatement needs the prior figure and a date. None is posted.",
    href: "/revisions",
  },
  {
    slug: "final",
    label: "Final",
    status: "empty",
    lede: "A final vintage needs a publisher’s close. This page does not invent one.",
    href: "/releases",
  },
];

export function postedVintageCount() {
  return 0;
}
