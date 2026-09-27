export type ReleaseSlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** Release shapes. No date is scheduled. */
export const releaseSlots: ReleaseSlot[] = [
  {
    slug: "official-print",
    label: "Official print",
    status: "empty",
    lede: "A statistical release needs an agency and a date. None is scheduled.",
    href: "/sources",
  },
  {
    slug: "market-close",
    label: "Market close",
    status: "empty",
    lede: "An exchange close needs a cited session. This slot stores no clock time.",
    href: "/markets",
  },
  {
    slug: "desk-note",
    label: "Desk note",
    status: "empty",
    lede: "The calendar stays the door. No sample release is filed here.",
    href: "/calendar",
  },
];

export function scheduledReleaseCount() {
  return 0;
}
