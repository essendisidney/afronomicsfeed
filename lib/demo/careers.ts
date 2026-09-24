export type CareerRole = {
  slug: string;
  label: string;
  desk: string;
  status: "open" | "filled" | "empty";
  lede: string;
  href?: string;
};

/** Careers board. Empty means no role is posted — do not invent openings. */
export const careerRoles: CareerRole[] = [
  {
    slug: "kenya-desk",
    label: "Kenya desk editor",
    desk: "editorial",
    status: "empty",
    lede: "Would own the Kenya file. Not posted.",
    href: "/countries/kenya",
  },
  {
    slug: "graph-ops",
    label: "Graph / entity ops",
    desk: "data",
    status: "empty",
    lede: "Would run resolution jobs when the store is live.",
    href: "/graph/resolve",
  },
  {
    slug: "ingestion",
    label: "Ingestion engineer",
    desk: "engineering",
    status: "empty",
    lede: "Fetch → validate → append path. Role not posted.",
    href: "/ingestion",
  },
  {
    slug: "enterprise",
    label: "Enterprise desk",
    desk: "commercial",
    status: "empty",
    lede: "Licensing and feeds. Contact via advisory until a role opens.",
    href: "/advisory",
  },
];

export function openCareerCount() {
  return careerRoles.filter((item) => item.status === "open").length;
}
