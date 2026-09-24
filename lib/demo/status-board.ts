export type SystemSurface = {
  id: string;
  label: string;
  state: "live" | "scaffold" | "offline";
  note: string;
  href?: string;
};

/** Honest product status. Never invent a green light for a dark store. */
export const systemSurfaces: SystemSurface[] = [
  {
    id: "editorial-md",
    label: "Filesystem Markdown desk",
    state: "live",
    note: "Kenya desk articles and briefs ship from /content.",
    href: "/today",
  },
  {
    id: "country-terminals",
    label: "Country terminals",
    state: "live",
    note: "54 shells. Observation cells stay blank until sourced.",
    href: "/countries",
  },
  {
    id: "graph-desks",
    label: "Graph desks",
    state: "scaffold",
    note: "Featured desks are editorial. Resolution jobs are not scheduled.",
    href: "/graph",
  },
  {
    id: "ask-rag",
    label: "Ask / RAG index",
    state: "offline",
    note: "Corpus slots exist. Embeddings and retrieval are not connected.",
    href: "/ask/corpus",
  },
  {
    id: "auth-billing",
    label: "Auth + billing",
    state: "offline",
    note: "Every visitor is Free. Checkout stubs only.",
    href: "/account",
  },
  {
    id: "api-keys",
    label: "API keys",
    state: "offline",
    note: "Catalogue is public. Keys are not issued.",
    href: "/developers",
  },
  {
    id: "exports",
    label: "Export mint",
    state: "offline",
    note: "Packages are product shape. No CSV is minted.",
    href: "/exports",
  },
  {
    id: "ingestion",
    label: "Ingestion runner",
    state: "offline",
    note: "Ops board lists stubs. No cron against a live queue.",
    href: "/ingestion",
  },
  {
    id: "feeds",
    label: "Enterprise feeds",
    state: "offline",
    note: "Catalogue only. No licensed delivery.",
    href: "/feeds",
  },
  {
    id: "notifications",
    label: "Notification delivery",
    state: "offline",
    note: "Channels listed. Nothing is pushed.",
    href: "/notifications",
  },
  {
    id: "licensing",
    label: "Enterprise licensing",
    state: "offline",
    note: "Catalogue only. No fake quotes.",
    href: "/licensing",
  },
  {
    id: "audit",
    label: "Editorial audit log",
    state: "offline",
    note: "Action kinds listed. Event store empty.",
    href: "/audit",
  },
  {
    id: "reports",
    label: "Research reports",
    state: "scaffold",
    note: "Memo shells. Published count is zero.",
    href: "/reports",
  },
  {
    id: "calendar",
    label: "Desk calendar",
    state: "offline",
    note: "Slots listed. Dates blank until cited.",
    href: "/calendar",
  },
  {
    id: "partners",
    label: "Partner inventory",
    state: "offline",
    note: "Sponsor surfaces empty. Editorial separate.",
    href: "/partners",
  },
  {
    id: "coverage",
    label: "Coverage board",
    state: "scaffold",
    note: "Honest scaffold counts. No vanity score.",
    href: "/coverage",
  },
  {
    id: "webhooks",
    label: "Webhook delivery",
    state: "offline",
    note: "Catalogue only. Nothing armed.",
    href: "/webhooks",
  },
  {
    id: "onboarding",
    label: "Seat onboarding",
    state: "scaffold",
    note: "Steps open. Progress store empty.",
    href: "/onboarding",
  },
  {
    id: "regions",
    label: "Regional hubs",
    state: "scaffold",
    note: "Five region indexes. No regional scoreboard.",
    href: "/regions",
  },
  {
    id: "runbooks",
    label: "Desk runbooks",
    state: "scaffold",
    note: "SOP shells. Empty until steps are filed.",
    href: "/runbooks",
  },
  {
    id: "layers",
    label: "Intelligence layers",
    state: "scaffold",
    note: "NEWS→DECISIONS map. Decisions layer offline.",
    href: "/layers",
  },
  {
    id: "press",
    label: "Press kit",
    state: "scaffold",
    note: "Media assets mostly empty. No KPI PDF.",
    href: "/press",
  },
  {
    id: "golive",
    label: "Go-live gates",
    state: "scaffold",
    note: "Blocked gates listed. No fake green lights.",
    href: "/golive",
  },
  {
    id: "social",
    label: "LinkedIn / social",
    state: "scaffold",
    note: "Company page linked. Share intents live. No post scheduler.",
    href: "/social",
  },
  {
    id: "embeds",
    label: "Embed widgets",
    state: "scaffold",
    note: "Catalogue only. No iframe or white-label key issued.",
    href: "/embeds",
  },
  {
    id: "security",
    label: "Security / trust",
    state: "scaffold",
    note: "Control list published. SOC 2 and pen-test remain empty.",
    href: "/security",
  },
  {
    id: "integrations",
    label: "Integrations",
    state: "scaffold",
    note: "Catalogue only. No Slack, Teams or Zap connected.",
    href: "/integrations",
  },
  {
    id: "sla",
    label: "SLA commitments",
    state: "scaffold",
    note: "Shapes only. No contracted uptime percentage.",
    href: "/sla",
  },
  {
    id: "brand",
    label: "Brand kit",
    state: "scaffold",
    note: "Live names on site. Download packs empty.",
    href: "/brand",
  },
  {
    id: "roadmap",
    label: "Public roadmap",
    state: "scaffold",
    note: "Derived from changelog + gates. No fake dates.",
    href: "/roadmap",
  },
  {
    id: "accessibility",
    label: "Accessibility",
    state: "scaffold",
    note: "Honest posture. WCAG claim untested.",
    href: "/accessibility",
  },
  {
    id: "sdk",
    label: "SDK catalogue",
    state: "scaffold",
    note: "Catalogue only. No npm/PyPI publish.",
    href: "/sdk",
  },
];

export function surfacesByState(state: SystemSurface["state"]) {
  return systemSurfaces.filter((item) => item.state === state);
}
