export type ConsignmentSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited movement of goods. No consignment is stored. */
export const consignmentSlots: ConsignmentSlot[] = [
  {
    slug: "booking",
    label: "Booking",
    status: "empty",
    lede: "A booking needs a named contract. None is stored.",
    href: "/contracts",
  },
  {
    slug: "lot",
    label: "Lot",
    status: "empty",
    lede: "A lot needs a named parcel. None is attached.",
    href: "/lots",
  },
  {
    slug: "delivery",
    label: "Delivery",
    status: "empty",
    lede: "A delivery needs a cited border post. None is stored.",
    href: "/borders",
  },
];

export function storedConsignmentCount() {
  return 0;
}
