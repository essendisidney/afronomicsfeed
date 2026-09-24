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
    slug: "phase-22",
    title: "Onboarding, webhooks, SN/MZ, Maputo Corridor",
    phase: "22",
    status: "draft",
    lede: "New-seat path, webhook catalogue, Senegal and Mozambique desks, Maputo Corridor graph.",
    hrefs: ["/onboarding", "/webhooks", "/graph/senegal", "/graph/maputo-corridor"],
  },
  {
    slug: "phase-23",
    title: "Regions, runbooks, Zambia / Lobito span",
    phase: "23",
    status: "draft",
    lede: "Regional hubs, desk SOP shells, Zambia desk, Lobito Corridor spans Angola and Zambia.",
    hrefs: ["/regions", "/runbooks", "/graph/zambia", "/graph/lobito-corridor"],
  },
  {
    slug: "phase-24",
    title: "Layers, press, Tunisia desk",
    phase: "24",
    status: "draft",
    lede: "NEWS→DECISIONS layer map, media kit shells, Tunisia graph desk.",
    hrefs: ["/layers", "/press", "/graph/tunisia"],
  },
  {
    slug: "phase-25",
    title: "Go-live gates + LinkedIn social desk",
    phase: "25",
    status: "draft",
    lede: "Honest blockers before official prints; LinkedIn share intents and company URL hook.",
    hrefs: ["/golive", "/social"],
  },
  {
    slug: "phase-26",
    title: "Embeds, Algeria desk, LinkedIn cross-post",
    phase: "26",
    status: "draft",
    lede: "Widget catalogue with zero issued keys; Algeria graph desk; LinkedIn cross-post runbook.",
    hrefs: ["/embeds", "/graph/algeria", "/runbooks"],
  },
  {
    slug: "phase-27",
    title: "Security trust + Botswana desk",
    phase: "27",
    status: "draft",
    lede: "Honest control catalogue with no fake compliance badges; Botswana graph desk.",
    hrefs: ["/security", "/graph/botswana"],
  },
  {
    slug: "phase-28",
    title: "Integrations + Cameroon desk",
    phase: "28",
    status: "draft",
    lede: "Slack/Teams/email delivery catalogue with zero connections; Cameroon graph desk.",
    hrefs: ["/integrations", "/graph/cameroon"],
  },
  {
    slug: "phase-29",
    title: "SLA catalogue + Namibia desk",
    phase: "29",
    status: "draft",
    lede: "Service commitment shells with no fake uptime %; Namibia graph desk.",
    hrefs: ["/sla", "/graph/namibia"],
  },
  {
    slug: "phase-30",
    title: "Brand kit + Trans-Kalahari corridor",
    phase: "30",
    status: "draft",
    lede: "Identity catalogue without a fake logo pack; Trans-Kalahari corridor desk.",
    hrefs: ["/brand", "/graph/trans-kalahari", "/trade/trans-kalahari"],
  },
  {
    slug: "phase-31",
    title: "Roadmap, accessibility, Libya, Beira",
    phase: "31",
    status: "draft",
    lede: "Public roadmap and a11y posture; Libya and Zimbabwe desks; Beira Corridor.",
    hrefs: ["/roadmap", "/accessibility", "/graph/libya", "/graph/beira-corridor"],
  },
  {
    slug: "phase-32",
    title: "SDK catalogue + Mauritius desk",
    phase: "32",
    status: "draft",
    lede: "Client SDK shells with zero published packages; Mauritius graph desk.",
    hrefs: ["/sdk", "/graph/mauritius"],
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
