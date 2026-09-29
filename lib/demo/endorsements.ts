export type EndorsementSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited mark on a contract. No endorsement is stored. */
export const endorsementSlots: EndorsementSlot[] = [
  {
    slug: "name",
    label: "Name",
    status: "empty",
    lede: "A name needs a contract. None is stored.",
    href: "/contracts",
  },
  {
    slug: "mark",
    label: "Mark",
    status: "empty",
    lede: "A mark needs a stamp. None is attached.",
    href: "/stamps",
  },
  {
    slug: "file",
    label: "File",
    status: "empty",
    lede: "An endorsement file needs a citation. None is stored.",
    href: "/citations",
  },
];

export function storedEndorsementCount() {
  return 0;
}
