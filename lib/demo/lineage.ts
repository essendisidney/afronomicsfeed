export type LineageSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A source chain. No link is recorded. */
export const lineageSlots: LineageSlot[] = [
  {
    slug: "publisher",
    label: "Publisher",
    status: "empty",
    lede: "A publisher link needs a named source. None is recorded.",
    href: "/sources",
  },
  {
    slug: "series",
    label: "Series",
    status: "empty",
    lede: "A series link needs a stored series. This page does not invent one.",
    href: "/series",
  },
  {
    slug: "print",
    label: "Print",
    status: "empty",
    lede: "A print link needs a dated observation. None is attached.",
    href: "/observations",
  },
];

export function recordedLineageCount() {
  return 0;
}
