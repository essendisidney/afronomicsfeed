export type CitationSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** Citation shapes. No example print is stored. */
export const citationSlots: CitationSlot[] = [
  {
    slug: "primary",
    label: "Primary document",
    status: "empty",
    lede: "A citation needs a publisher, title and date. None is stored as a sample print.",
    href: "/method",
  },
  {
    slug: "official-door",
    label: "Official door",
    status: "empty",
    lede: "Agency doors live on the source registry. This slot does not copy a figure.",
    href: "/sources",
  },
  {
    slug: "as-of",
    label: "As-of stamp",
    status: "empty",
    lede: "No observation date is invented to fill a cell.",
    href: "/method/registry",
  },
];

export function filledCitationCount() {
  return 0;
}
