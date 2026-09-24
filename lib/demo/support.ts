export type SupportChannel = {
  slug: string;
  label: string;
  kind: "email" | "advisory" | "status" | "docs" | "ticket";
  status: "open" | "empty" | "offline";
  lede: string;
  href?: string;
};

/** Support doors. Empty ticket queues stay empty — no fake SLAs on response. */
export const supportChannels: SupportChannel[] = [
  {
    slug: "advisory",
    label: "Institutional advisory",
    kind: "advisory",
    status: "open",
    lede: "Contact path for institutional desks. Not a ticket queue.",
    href: "/advisory",
  },
  {
    slug: "status",
    label: "System status",
    kind: "status",
    status: "open",
    lede: "Honest live / scaffold / offline board.",
    href: "/status",
  },
  {
    slug: "docs",
    label: "Developers + method",
    kind: "docs",
    status: "open",
    lede: "Public API catalogue and house method.",
    href: "/developers",
  },
  {
    slug: "sla",
    label: "SLA catalogue",
    kind: "docs",
    status: "open",
    lede: "Commitment shapes. No invented uptime %.",
    href: "/sla",
  },
  {
    slug: "ticket",
    label: "Ticket queue",
    kind: "ticket",
    status: "offline",
    lede: "No helpdesk runner. Do not invent a ticket ID.",
  },
  {
    slug: "support-email",
    label: "Support inbox",
    kind: "email",
    status: "empty",
    lede: "Public support address not published yet.",
  },
];

export function openSupportCount() {
  return supportChannels.filter((item) => item.status === "open").length;
}
