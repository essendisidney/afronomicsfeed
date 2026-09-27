export type AliasSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** Another name for the same thing. No alias is stored. */
export const aliasSlots: AliasSlot[] = [
  {
    slug: "place",
    label: "Place",
    status: "empty",
    lede: "A place alias needs a cited name and a source. None is stored.",
    href: "/cities",
  },
  {
    slug: "series",
    label: "Series",
    status: "empty",
    lede: "A series alias needs a publisher. This page does not invent one.",
    href: "/series",
  },
  {
    slug: "code",
    label: "Code",
    status: "empty",
    lede: "A code alias needs two cited identifiers. None is attached.",
    href: "/identifiers",
  },
];

export function storedAliasCount() {
  return 0;
}
