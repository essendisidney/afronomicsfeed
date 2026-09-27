export type BreakSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** Where a series would split. No break is stored. */
export const breakSlots: BreakSlot[] = [
  {
    slug: "series",
    label: "Series",
    status: "empty",
    lede: "A series break needs a cited change in method. None is stored.",
    href: "/series",
  },
  {
    slug: "method",
    label: "Method",
    status: "empty",
    lede: "A method break needs a publisher. This page does not invent one.",
    href: "/method",
  },
  {
    slug: "rebase",
    label: "Rebase",
    status: "empty",
    lede: "A rebase needs a source. None is attached.",
    href: "/baselines",
  },
];

export function storedBreakCount() {
  return 0;
}
