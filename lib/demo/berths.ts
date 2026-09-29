export type BerthSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited place a call would use. No berth is stored. */
export const berthSlots: BerthSlot[] = [
  {
    slug: "call",
    label: "Call",
    status: "empty",
    lede: "A call needs a corridor file. None is stored.",
    href: "/trade",
  },
  {
    slug: "window",
    label: "Window",
    status: "empty",
    lede: "A window needs a period file. None is attached.",
    href: "/windows",
  },
  {
    slug: "record",
    label: "Record",
    status: "empty",
    lede: "A berth record needs a citation. None is stored.",
    href: "/citations",
  },
];

export function storedBerthCount() {
  return 0;
}
