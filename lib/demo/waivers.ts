export type WaiverSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited release of a condition. No waiver is stored. */
export const waiverSlots: WaiverSlot[] = [
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
    lede: "A window needs a window file. None is attached.",
    href: "/windows",
  },
  {
    slug: "file",
    label: "File",
    status: "empty",
    lede: "A waiver file needs a citation. None is stored.",
    href: "/citations",
  },
];

export function storedWaiverCount() {
  return 0;
}
