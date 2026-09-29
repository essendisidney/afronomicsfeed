export type QuotaSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited quantity limit. No fill is stored. */
export const quotaSlots: QuotaSlot[] = [
  {
    slug: "allocation",
    label: "Allocation",
    status: "empty",
    lede: "An allocation needs a named authority. None is stored.",
    href: "/releases",
  },
  {
    slug: "fill",
    label: "Fill",
    status: "empty",
    lede: "A fill needs a cited customs notice. None is attached.",
    href: "/observations",
  },
  {
    slug: "remainder",
    label: "Remainder",
    status: "empty",
    lede: "A remainder needs a period on the file. None is stored.",
    href: "/periods",
  },
];

export function storedQuotaCount() {
  return 0;
}
