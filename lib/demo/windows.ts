export type WindowSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited span of time. No window is stored. */
export const windowSlots: WindowSlot[] = [
  {
    slug: "price",
    label: "Price",
    status: "empty",
    lede: "A price window needs two cited dates. None is stored.",
    href: "/periods",
  },
  {
    slug: "flow",
    label: "Flow",
    status: "empty",
    lede: "A flow window needs a publisher. This page does not invent one.",
    href: "/observations",
  },
  {
    slug: "dwell",
    label: "Dwell",
    status: "empty",
    lede: "A dwell window needs a source. None is attached.",
    href: "/series",
  },
];

export function storedWindowCount() {
  return 0;
}
