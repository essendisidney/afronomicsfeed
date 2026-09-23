export type ChangelogEntry = {
  slug: string;
  title: string;
  phase: string;
  status: "shipped" | "draft";
  lede: string;
  hrefs: string[];
};

/** Product changelog. Entries describe shipped shells — not invented metrics. */
export const changelogEntries: ChangelogEntry[] = [
  {
    slug: "phase-18",
    title: "Searches, licensing, notifications, corridor desk",
    phase: "18",
    status: "shipped",
    lede: "Saved-search templates, enterprise licence catalogue, offline notification prefs, Ethiopia and Northern Corridor graph desks.",
    hrefs: ["/searches", "/licensing", "/notifications", "/graph/northern-corridor"],
  },
  {
    slug: "phase-19",
    title: "Changelog, audit, reports, Morocco desk",
    phase: "19",
    status: "draft",
    lede: "Product changelog, empty audit log, research report shells, Morocco graph desk.",
    hrefs: ["/changelog", "/audit", "/reports", "/graph/morocco"],
  },
  {
    slug: "phase-20",
    title: "Calendar, partners, Central Corridor, API expand",
    phase: "20",
    status: "draft",
    lede: "Desk calendar, empty partner inventory, Central Corridor graph desk, /api/graph and /api/status.",
    hrefs: ["/calendar", "/partners", "/graph/central-corridor", "/developers"],
  },
  {
    slug: "phase-21",
    title: "Coverage, glossary, CI/Angola/Lobito desks",
    phase: "21",
    status: "draft",
    lede: "Honest coverage board, house glossary, Côte d’Ivoire, Angola and Lobito Corridor desks.",
    hrefs: ["/coverage", "/glossary", "/graph/cote-divoire", "/graph/lobito-corridor"],
  },
  {
    slug: "phase-17",
    title: "Feeds, status, UG/TZ desks",
    phase: "17",
    status: "shipped",
    lede: "Enterprise feed catalogue, honest status board, Uganda and Tanzania corridor desks.",
    hrefs: ["/feeds", "/status", "/graph/uganda", "/graph/tanzania"],
  },
  {
    slug: "phase-16",
    title: "Sources, compare, ingestion",
    phase: "16",
    status: "shipped",
    lede: "Official door registry, featured desk matrix with empty cells, ops job board.",
    hrefs: ["/sources", "/compare", "/ingestion"],
  },
  {
    slug: "phase-15",
    title: "Featured desks, method, usage, packs",
    phase: "15",
    status: "shipped",
    lede: "Ghana and Rwanda desks, method registry, usage meters, briefing packs.",
    hrefs: ["/method/registry", "/account/usage", "/packs", "/graph/ghana"],
  },
];

export function shippedChangelogCount() {
  return changelogEntries.filter((item) => item.status === "shipped").length;
}
