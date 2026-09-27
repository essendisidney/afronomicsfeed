export type DatelineSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** Dateline shapes. No story is filed from a place. */
export const datelineSlots: DatelineSlot[] = [
  {
    slug: "nairobi",
    label: "Nairobi",
    status: "empty",
    lede: "The morning file is the Kenya desk. No datelined story is stored here.",
    href: "/today",
  },
  {
    slug: "corridor",
    label: "Corridor file",
    status: "empty",
    lede: "A corridor dateline needs a filed note. None is attached.",
    href: "/corridors",
  },
  {
    slug: "agency",
    label: "Agency file",
    status: "empty",
    lede: "An agency dateline needs a cited door. This slot does not invent one.",
    href: "/agencies",
  },
];

export function filedDatelineCount() {
  return 0;
}
