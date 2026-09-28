export type WarehouseSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited store. No warehouse record is stored. */
export const warehouseSlots: WarehouseSlot[] = [
  {
    slug: "shed",
    label: "Shed",
    status: "empty",
    lede: "A shed needs a named site. None is stored.",
    href: "/trade",
  },
  {
    slug: "stock",
    label: "Stock",
    status: "empty",
    lede: "A stock figure needs a lot and a date. None is attached.",
    href: "/lots",
  },
  {
    slug: "dwell",
    label: "Dwell",
    status: "empty",
    lede: "A dwell print needs a sample and a clock time from the publisher. None is stored.",
    href: "/samples",
  },
];

export function storedWarehouseCount() {
  return 0;
}
