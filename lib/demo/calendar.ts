export type CalendarSlot = {
  slug: string;
  label: string;
  kind: "mpc" | "earnings" | "policy" | "desk" | "trade";
  when: string | null;
  status: "empty" | "scheduled";
  lede: string;
  href: string;
};

/** Desk calendar. Dates stay null until a primary notice is cited. */
export const calendarSlots: CalendarSlot[] = [
  {
    slug: "cbk-mpc",
    label: "CBK MPC",
    kind: "mpc",
    when: null,
    status: "empty",
    lede: "Next meeting date unpublished until CBK posts it.",
    href: "/agencies/central-bank/kenya",
  },
  {
    slug: "cbn-mpc",
    label: "CBN MPC",
    kind: "mpc",
    when: null,
    status: "empty",
    lede: "Nigeria policy window. Date cell blank.",
    href: "/agencies/central-bank/nigeria",
  },
  {
    slug: "sarb-mpc",
    label: "SARB MPC",
    kind: "mpc",
    when: null,
    status: "empty",
    lede: "South Africa policy window. Date cell blank.",
    href: "/agencies/central-bank/south-africa",
  },
  {
    slug: "kenya-morning-pack",
    label: "Kenya morning pack",
    kind: "desk",
    when: null,
    status: "empty",
    lede: "Assembly cadence. Delivery queue offline.",
    href: "/packs",
  },
  {
    slug: "nse-issuer-window",
    label: "NSE issuer window",
    kind: "earnings",
    when: null,
    status: "empty",
    lede: "Official exchange door only. No mirrored tape.",
    href: "/institutions/nse",
  },
  {
    slug: "northern-corridor-watch",
    label: "Northern Corridor watch",
    kind: "trade",
    when: null,
    status: "empty",
    lede: "Disruption series not connected.",
    href: "/graph/northern-corridor",
  },
];

export function scheduledCalendarCount() {
  return calendarSlots.filter((item) => item.status === "scheduled").length;
}
