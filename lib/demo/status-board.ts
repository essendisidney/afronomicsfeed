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
];

export function surfacesByState(state: SystemSurface["state"]) {
  return systemSurfaces.filter((item) => item.state === state);
}
