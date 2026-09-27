export type ParcelSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited shipment. No parcel is stored. */
export const parcelSlots: ParcelSlot[] = [
  {
    slug: "shipment",
    label: "Shipment",
    status: "empty",
    lede: "A shipment parcel needs a cited movement. None is stored.",
    href: "/trade",
  },
  {
    slug: "document",
    label: "Document",
    status: "empty",
    lede: "A document parcel needs a publisher. This page does not invent one.",
    href: "/customs",
  },
  {
    slug: "route",
    label: "Route",
    status: "empty",
    lede: "A route parcel needs a source. None is attached.",
    href: "/corridors",
  },
];

export function storedParcelCount() {
  return 0;
}
