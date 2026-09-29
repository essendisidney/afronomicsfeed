export type SealSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited closure on a unit. No seal is stored. */
export const sealSlots: SealSlot[] = [
  {
    slug: "apply",
    label: "Apply",
    status: "empty",
    lede: "An application needs a release. None is stored.",
    href: "/releases",
  },
  {
    slug: "break",
    label: "Break",
    status: "empty",
    lede: "A break needs a border record. None is attached.",
    href: "/borders",
  },
  {
    slug: "record",
    label: "Record",
    status: "empty",
    lede: "A seal record needs a citation. None is stored.",
    href: "/citations",
  },
];

export function storedSealCount() {
  return 0;
}
