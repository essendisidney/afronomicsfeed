export type InspectionSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited site visit. No inspection is stored. */
export const inspectionSlots: InspectionSlot[] = [
  {
    slug: "visit",
    label: "Visit",
    status: "empty",
    lede: "A visit needs a named site and a date. None is stored.",
    href: "/releases",
  },
  {
    slug: "finding",
    label: "Finding",
    status: "empty",
    lede: "A finding needs a cited note. None is attached.",
    href: "/footnotes",
  },
  {
    slug: "close",
    label: "Close",
    status: "empty",
    lede: "A close needs a period on the file. None is stored.",
    href: "/periods",
  },
];

export function storedInspectionCount() {
  return 0;
}
