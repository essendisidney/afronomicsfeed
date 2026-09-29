export type NominationSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited naming of a window. No nomination is stored. */
export const nominationSlots: NominationSlot[] = [
  {
    slug: "name",
    label: "Name",
    status: "empty",
    lede: "A name needs a contract. None is stored.",
    href: "/contracts",
  },
  {
    slug: "window",
    label: "Window",
    status: "empty",
    lede: "A window needs a period. None is attached.",
    href: "/periods",
  },
  {
    slug: "accept",
    label: "Accept",
    status: "empty",
    lede: "An acceptance needs a release. None is stored.",
    href: "/releases",
  },
];

export function storedNominationCount() {
  return 0;
}
