export type CutoffSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** When a file would stop taking input. No clock time is stored. */
export const cutoffSlots: CutoffSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price cutoff needs an exchange and a cited clock. None is stored.",
    href: "/markets",
  },
  {
    slug: "flow",
    label: "Flow",
    status: "empty",
    lede: "A flow cutoff needs a publisher. This page does not invent one.",
    href: "/releases",
  },
  {
    slug: "file",
    label: "File",
    status: "empty",
    lede: "A file cutoff needs a source. None is attached.",
    href: "/frequencies",
  },
];

export function storedCutoffCount() {
  return 0;
}
