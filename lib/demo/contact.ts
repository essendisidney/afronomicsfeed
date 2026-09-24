export type ContactDoor = {
  slug: string;
  label: string;
  kind: "advisory" | "press" | "support" | "careers" | "partners" | "email";
  status: "open" | "empty" | "offline";
  lede: string;
  href?: string;
};

/** Contact doors. Empty inboxes stay empty — no fake form delivery. */
export const contactDoors: ContactDoor[] = [
  {
    slug: "advisory",
    label: "Institutional advisory",
    kind: "advisory",
    status: "open",
    lede: "Desk contact for institutions. Not a ticket queue.",
    href: "/advisory",
  },
  {
    slug: "press",
    label: "Press",
    kind: "press",
    status: "open",
    lede: "Media kit and reporter doors.",
    href: "/press",
  },
  {
    slug: "support",
    label: "Product support",
    kind: "support",
    status: "open",
    lede: "Open help doors. Ticket runner offline.",
    href: "/support",
  },
  {
    slug: "partners",
    label: "Partners",
    kind: "partners",
    status: "open",
    lede: "Partner inventory stays empty until listed.",
    href: "/partners",
  },
  {
    slug: "careers",
    label: "Careers",
    kind: "careers",
    status: "open",
    lede: "Role shapes only. No open posts invented.",
    href: "/careers",
  },
  {
    slug: "general-email",
    label: "General inbox",
    kind: "email",
    status: "empty",
    lede: "Public address not published yet.",
  },
];

export function openContactCount() {
  return contactDoors.filter((item) => item.status === "open").length;
}
