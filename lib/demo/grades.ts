export type GradeSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited specification. No grade is stored. */
export const gradeSlots: GradeSlot[] = [
  {
    slug: "commodity",
    label: "Commodity",
    status: "empty",
    lede: "A commodity grade needs a cited specification. None is stored.",
    href: "/baskets",
  },
  {
    slug: "contract",
    label: "Contract",
    status: "empty",
    lede: "A contract grade needs a publisher. This page does not invent one.",
    href: "/series",
  },
  {
    slug: "assay",
    label: "Assay",
    status: "empty",
    lede: "An assay needs a source. None is attached.",
    href: "/constituents",
  },
];

export function storedGradeCount() {
  return 0;
}
