export type CreditLine = {
  slug: string;
  label: string;
  kind: "house" | "stack" | "design" | "data";
  status: "live" | "acknowledged";
  lede: string;
  href?: string;
};

/** Product and stack credits. No invented vendor partnerships. */
export const creditLines: CreditLine[] = [
  {
    slug: "pesara",
    label: "Pesara",
    kind: "house",
    status: "live",
    lede: "Afronomics Feed is a product of Pesara.",
    href: "/about",
  },
  {
    slug: "next",
    label: "Next.js",
    kind: "stack",
    status: "acknowledged",
    lede: "App Router host for the terminal.",
  },
  {
    slug: "vercel",
    label: "Vercel",
    kind: "stack",
    status: "acknowledged",
    lede: "Production hosting. No invented SLA from the host alone.",
    href: "/sla",
  },
  {
    slug: "typography",
    label: "Site typography",
    kind: "design",
    status: "live",
    lede: "Display and mono faces loaded for the desk chrome.",
    href: "/brand",
  },
  {
    slug: "official-doors",
    label: "Official source doors",
    kind: "data",
    status: "acknowledged",
    lede: "Cited prints will credit primary doors. Registry is partial.",
    href: "/sources",
  },
];

export function liveCreditCount() {
  return creditLines.filter((item) => item.status === "live").length;
}
