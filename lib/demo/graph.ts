export type GraphNodeKind =
  | "country"
  | "currency"
  | "agency"
  | "exchange"
  | "industry"
  | "indicator"
  | "corridor"
  | "company"
  | "city"
  | "person"
  | "concept";

export type GraphNode = {
  id: string;
  label: string;
  kind: GraphNodeKind;
  href?: string;
};

export type GraphEdge = {
  id: string;
  from: string;
  rel: string;
  to: string;
  source: string;
  asOf: string | null;
  status: "demo" | "editorial" | "verified";
};

export const graphNodes: GraphNode[] = [
  { id: "kenya", label: "Kenya", kind: "country", href: "/countries/kenya" },
  { id: "kes", label: "KES", kind: "currency", href: "/markets/currencies/usd-kes" },
  { id: "cbk", label: "CBK", kind: "agency", href: "/institutions/cbk" },
  { id: "nse", label: "NSE", kind: "exchange", href: "/institutions/nse" },
  { id: "nairobi", label: "Nairobi", kind: "city", href: "/cities/nairobi" },
  { id: "mombasa", label: "Mombasa", kind: "city", href: "/cities/mombasa" },
  { id: "banking", label: "Banking", kind: "industry", href: "/industries/banking/kenya" },
  { id: "agriculture", label: "Agriculture", kind: "industry", href: "/industries/agriculture/kenya" },
  { id: "energy", label: "Energy", kind: "industry", href: "/industries/energy/kenya" },
  { id: "policy-rate", label: "Policy rate", kind: "indicator", href: "/indicators/policy-rate/kenya" },
  { id: "northern-corridor", label: "Northern Corridor", kind: "corridor", href: "/trade/northern-corridor/kenya" },
  { id: "safaricom", label: "Safaricom", kind: "company", href: "/companies/safaricom" },
  { id: "equity", label: "Equity Group", kind: "company", href: "/companies/equity-group" },
  { id: "governor", label: "CBK governor", kind: "person", href: "/people/central-bank-governor/kenya" },
  { id: "inflation-costs", label: "Inflation / manufacturing costs", kind: "concept" },
];

export const graphEdges: GraphEdge[] = [
  {
    id: "ke-kes",
    from: "kenya",
    rel: "currency",
    to: "kes",
    source: "Editorial scaffold",
    asOf: null,
    status: "editorial",
  },
  {
    id: "ke-cbk",
    from: "kenya",
    rel: "central bank",
    to: "cbk",
    source: "CBK official door",
    asOf: null,
    status: "editorial",
  },
  {
    id: "cbk-policy",
    from: "cbk",
    rel: "policy",
    to: "policy-rate",
    source: "Indicator cell scaffold",
    asOf: null,
    status: "editorial",
  },
  {
    id: "cbk-banks",
    from: "cbk",
    rel: "supervises",
    to: "banking",
    source: "Editorial scaffold",
    asOf: null,
    status: "editorial",
  },
  {
    id: "cbk-governor",
    from: "cbk",
    rel: "role",
    to: "governor",
    source: "Role file — no invented name",
    asOf: null,
    status: "editorial",
  },
  {
    id: "ke-nse",
    from: "kenya",
    rel: "exchange",
    to: "nse",
    source: "NSE official door",
    asOf: null,
    status: "editorial",
  },
  {
    id: "ke-nairobi",
    from: "kenya",
    rel: "capital desk",
    to: "nairobi",
    source: "City file",
    asOf: null,
    status: "editorial",
  },
  {
    id: "ke-mombasa",
    from: "kenya",
    rel: "port city",
    to: "mombasa",
    source: "City / port file",
    asOf: null,
    status: "editorial",
  },
  {
    id: "ke-agri",
    from: "kenya",
    rel: "sector",
    to: "agriculture",
    source: "Country sector tag",
    asOf: null,
    status: "editorial",
  },
  {
    id: "ke-energy",
    from: "kenya",
    rel: "sector",
    to: "energy",
    source: "Country sector tag",
    asOf: null,
    status: "editorial",
  },
  {
    id: "energy-costs",
    from: "energy",
    rel: "exposes",
    to: "inflation-costs",
    source: "Editorial scaffold — not a print",
    asOf: null,
    status: "demo",
  },
  {
    id: "ke-corridor",
    from: "kenya",
    rel: "corridor",
    to: "northern-corridor",
    source: "Trade corridor file",
    asOf: null,
    status: "editorial",
  },
  {
    id: "nse-saf",
    from: "nse",
    rel: "lists",
    to: "safaricom",
    source: "Issuer scaffold",
    asOf: null,
    status: "editorial",
  },
  {
    id: "nse-equity",
    from: "nse",
    rel: "lists",
    to: "equity",
    source: "Issuer scaffold",
    asOf: null,
    status: "editorial",
  },
  {
    id: "banking-equity",
    from: "banking",
    rel: "issuer",
    to: "equity",
    source: "Company sector tag",
    asOf: null,
    status: "editorial",
  },
];

export const graphDesks = [
  {
    slug: "kenya",
    label: "Kenya desk",
    lede: "First populated edges. Every node opens a file or stays blank without a source.",
    nodeIds: graphNodes.map((node) => node.id),
  },
] as const;

export function getGraphNode(id: string) {
  return graphNodes.find((node) => node.id === id);
}

export function getGraphDesk(slug: string) {
  return graphDesks.find((desk) => desk.slug === slug);
}

export function edgesForDesk(slug: string) {
  const desk = getGraphDesk(slug);
  if (!desk) return [];
  const allowed = new Set(desk.nodeIds);
  return graphEdges.filter((edge) => allowed.has(edge.from) && allowed.has(edge.to));
}

export function edgesForNode(nodeId: string) {
  return graphEdges.filter((edge) => edge.from === nodeId || edge.to === nodeId);
}

export function graphFileHref(slug: string) {
  return `/graph/${slug}`;
}
