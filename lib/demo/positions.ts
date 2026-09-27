export type PositionSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited holding. No position is stored. */
export const positionSlots: PositionSlot[] = [
  {
    slug: "book",
    label: "Book",
    status: "empty",
    lede: "A book position needs a cited market file. None is stored.",
    href: "/markets",
  },
  {
    slug: "inventory",
    label: "Inventory",
    status: "empty",
    lede: "An inventory position needs a lot file. This page does not invent one.",
    href: "/lots",
  },
  {
    slug: "hedge",
    label: "Hedge",
    status: "empty",
    lede: "A hedge position needs a curve. None is attached.",
    href: "/curves",
  },
];

export function storedPositionCount() {
  return 0;
}
