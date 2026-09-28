export type ClearanceSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited customs decision. No clearance is stored. */
export const clearanceSlots: ClearanceSlot[] = [
  {
    slug: "notice",
    label: "Notice",
    status: "empty",
    lede: "A clearance notice needs a filing door. None is stored.",
    href: "/releases",
  },
  {
    slug: "exam",
    label: "Exam",
    status: "empty",
    lede: "An exam needs a named post and a date. None is attached.",
    href: "/customs",
  },
  {
    slug: "release",
    label: "Release",
    status: "empty",
    lede: "A release needs a cited decision. None is stored.",
    href: "/borders",
  },
];

export function storedClearanceCount() {
  return 0;
}
