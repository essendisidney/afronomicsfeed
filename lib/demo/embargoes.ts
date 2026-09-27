export type EmbargoSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A hold before a print. No embargo is stored. */
export const embargoSlots: EmbargoSlot[] = [
  {
    slug: "release",
    label: "Release",
    status: "empty",
    lede: "A release hold needs a publisher and a time. None is stored.",
    href: "/releases",
  },
  {
    slug: "print",
    label: "Print",
    status: "empty",
    lede: "A print hold needs a cited vintage. This page does not invent one.",
    href: "/vintages",
  },
  {
    slug: "note",
    label: "Note",
    status: "empty",
    lede: "A note hold needs a source. None is attached.",
    href: "/notices",
  },
];

export function storedEmbargoCount() {
  return 0;
}
