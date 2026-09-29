export type DutySlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A cited customs assessment. No duty amount is stored. */
export const dutySlots: DutySlot[] = [
  {
    slug: "schedule",
    label: "Schedule",
    status: "empty",
    lede: "A schedule needs a named customs authority. None is stored.",
    href: "/releases",
  },
  {
    slug: "assessment",
    label: "Assessment",
    status: "empty",
    lede: "An assessment needs a cited notice. None is attached.",
    href: "/customs",
  },
  {
    slug: "payment",
    label: "Payment",
    status: "empty",
    lede: "A payment needs a cited receipt. None is stored.",
    href: "/observations",
  },
];

export function storedDutyCount() {
  return 0;
}
