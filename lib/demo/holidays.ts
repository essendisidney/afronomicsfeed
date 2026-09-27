export type HolidaySlot = {
  slug: string;
  label: string;
  status: "empty";
  lede: string;
  href: string;
};

/** A day a market would close. No date is stored. */
export const holidaySlots: HolidaySlot[] = [
  {
    slug: "exchange",
    label: "Exchange",
    status: "empty",
    lede: "An exchange holiday needs a publisher and a date. None is stored.",
    href: "/markets",
  },
  {
    slug: "fiscal",
    label: "Fiscal",
    status: "empty",
    lede: "A fiscal holiday needs a gazette. This page does not invent one.",
    href: "/calendar",
  },
  {
    slug: "public",
    label: "Public",
    status: "empty",
    lede: "A public holiday needs a cited notice. None is attached.",
    href: "/sessions",
  },
];

export function storedHolidayCount() {
  return 0;
}
