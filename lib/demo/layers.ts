export type IntelligenceLayer = {
  slug: string;
  label: string;
  order: number;
  state: "live" | "scaffold" | "offline";
  lede: string;
  hrefs: string[];
};

/** NEWS → DATA → CONTEXT → SIGNALS → DECISIONS. Honest surface status. */
export const intelligenceLayers: IntelligenceLayer[] = [
  {
    slug: "news",
    label: "News",
    order: 1,
    state: "live",
    lede: "Morning file, briefs and Markdown desk. Primary journalism first.",
    hrefs: ["/today", "/brief", "/archive"],
  },
  {
    slug: "data",
    label: "Data",
    order: 2,
    state: "scaffold",
    lede: "Markets, indicators and datasets. Cells stay blank until cited.",
    hrefs: ["/data", "/markets", "/indicators/policy-rate"],
  },
  {
    slug: "context",
    label: "Context",
    order: 3,
    state: "scaffold",
    lede: "Country terminals, graph desks, trade corridors and industries.",
    hrefs: ["/countries", "/graph", "/trade", "/regions"],
  },
  {
    slug: "signals",
    label: "Signals",
    order: 4,
    state: "scaffold",
    lede: "Published signal files with fact / interpretation separation.",
    hrefs: ["/signals", "/opinion"],
  },
  {
    slug: "decisions",
    label: "Decisions",
    order: 5,
    state: "offline",
    lede: "Watches, alerts, packs and exports. Delivery requires a live seat.",
    hrefs: ["/watchlists", "/alerts", "/packs", "/exports"],
  },
];

export function layersByState(state: IntelligenceLayer["state"]) {
  return intelligenceLayers.filter((layer) => layer.state === state);
}
