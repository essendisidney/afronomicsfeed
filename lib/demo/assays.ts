export type AssaySlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited laboratory result. No assay is stored. */
export const assaySlots: AssaySlot[] = [
  {
    slug: "sample",
    label: "Sample",
    status: "empty",
    lede: "A sample needs a named lot. None is stored.",
    href: "/samples",
  },
  {
    slug: "result",
    label: "Result",
    status: "empty",
    lede: "A result needs a cited laboratory. None is attached.",
    href: "/observations",
  },
  {
    slug: "certificate",
    label: "Certificate",
    status: "empty",
    lede: "A certificate needs a named authority. None is stored.",
    href: "/certificates",
  },
];

export function storedAssayCount() {
  return 0;
}
