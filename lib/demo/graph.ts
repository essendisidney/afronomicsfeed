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
  { id: "nigeria", label: "Nigeria", kind: "country", href: "/countries/nigeria" },
  { id: "ngn", label: "NGN", kind: "currency", href: "/markets/currencies/usd-ngn" },
  { id: "cbn", label: "CBN", kind: "agency", href: "/agencies/central-bank/nigeria" },
  { id: "ngx", label: "NGX", kind: "exchange", href: "/markets/exchanges/ngx-asi" },
  { id: "lagos", label: "Lagos", kind: "city", href: "/cities/lagos" },
  { id: "mtn-nigeria", label: "MTN Nigeria", kind: "company", href: "/companies/mtn-nigeria" },
  { id: "ng-banking", label: "Banking · Nigeria", kind: "industry", href: "/industries/banking/nigeria" },
  { id: "ng-policy-rate", label: "Policy rate · Nigeria", kind: "indicator", href: "/indicators/policy-rate/nigeria" },
  { id: "south-africa", label: "South Africa", kind: "country", href: "/countries/south-africa" },
  { id: "zar", label: "ZAR", kind: "currency", href: "/markets/currencies/usd-zar" },
  { id: "sarb", label: "SARB", kind: "agency", href: "/agencies/central-bank/south-africa" },
  { id: "jse", label: "JSE", kind: "exchange", href: "/markets/exchanges/jse-alsi" },
  { id: "johannesburg", label: "Johannesburg", kind: "city", href: "/cities/johannesburg" },
  { id: "standard-bank", label: "Standard Bank", kind: "company", href: "/companies/standard-bank" },
  { id: "za-banking", label: "Banking · South Africa", kind: "industry", href: "/industries/banking/south-africa" },
  { id: "egypt", label: "Egypt", kind: "country", href: "/countries/egypt" },
  { id: "egp", label: "EGP", kind: "currency", href: "/markets/currencies/usd-egp" },
  { id: "cbe", label: "CBE", kind: "agency", href: "/agencies/central-bank/egypt" },
  { id: "egx", label: "EGX", kind: "exchange", href: "/markets/exchanges/egx-30" },
  { id: "cairo", label: "Cairo", kind: "city", href: "/cities/cairo" },
  { id: "eg-energy", label: "Energy · Egypt", kind: "industry", href: "/industries/energy/egypt" },
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
  {
    id: "ng-ngn",
    from: "nigeria",
    rel: "currency",
    to: "ngn",
    source: "Editorial scaffold",
    asOf: null,
    status: "editorial",
  },
  {
    id: "ng-cbn",
    from: "nigeria",
    rel: "central bank",
    to: "cbn",
    source: "CBN official door",
    asOf: null,
    status: "editorial",
  },
  {
    id: "cbn-policy",
    from: "cbn",
    rel: "policy",
    to: "ng-policy-rate",
    source: "Indicator cell scaffold",
    asOf: null,
    status: "editorial",
  },
  {
    id: "ng-ngx",
    from: "nigeria",
    rel: "exchange",
    to: "ngx",
    source: "NGX official door",
    asOf: null,
    status: "editorial",
  },
  {
    id: "ng-lagos",
    from: "nigeria",
    rel: "commercial desk",
    to: "lagos",
    source: "City file",
    asOf: null,
    status: "editorial",
  },
  {
    id: "ngx-mtn",
    from: "ngx",
    rel: "lists",
    to: "mtn-nigeria",
    source: "Issuer scaffold",
    asOf: null,
    status: "editorial",
  },
  {
    id: "ng-banking",
    from: "nigeria",
    rel: "sector",
    to: "ng-banking",
    source: "Country sector tag",
    asOf: null,
    status: "editorial",
  },
  {
    id: "za-zar",
    from: "south-africa",
    rel: "currency",
    to: "zar",
    source: "Editorial scaffold",
    asOf: null,
    status: "editorial",
  },
  {
    id: "za-sarb",
    from: "south-africa",
    rel: "central bank",
    to: "sarb",
    source: "SARB official door",
    asOf: null,
    status: "editorial",
  },
  {
    id: "za-jse",
    from: "south-africa",
    rel: "exchange",
    to: "jse",
    source: "JSE official door",
    asOf: null,
    status: "editorial",
  },
  {
    id: "za-jhb",
    from: "south-africa",
    rel: "markets desk",
    to: "johannesburg",
    source: "City file",
    asOf: null,
    status: "editorial",
  },
  {
    id: "jse-sbk",
    from: "jse",
    rel: "lists",
    to: "standard-bank",
    source: "Issuer scaffold",
    asOf: null,
    status: "editorial",
  },
  {
    id: "za-banking",
    from: "south-africa",
    rel: "sector",
    to: "za-banking",
    source: "Country sector tag",
    asOf: null,
    status: "editorial",
  },
  {
    id: "eg-egp",
    from: "egypt",
    rel: "currency",
    to: "egp",
    source: "Editorial scaffold",
    asOf: null,
    status: "editorial",
  },
  {
    id: "eg-cbe",
    from: "egypt",
    rel: "central bank",
    to: "cbe",
    source: "CBE official door",
    asOf: null,
    status: "editorial",
  },
  {
    id: "eg-egx",
    from: "egypt",
    rel: "exchange",
    to: "egx",
    source: "EGX official door",
    asOf: null,
    status: "editorial",
  },
  {
    id: "eg-cairo",
    from: "egypt",
    rel: "capital desk",
    to: "cairo",
    source: "City file",
    asOf: null,
    status: "editorial",
  },
  {
    id: "eg-energy",
    from: "egypt",
    rel: "sector",
    to: "eg-energy",
    source: "Country sector tag",
    asOf: null,
    status: "editorial",
  },
];

export const graphDesks = [
  {
    slug: "kenya",
    label: "Kenya desk",
    lede: "First populated edges. Every node opens a file or stays blank without a source.",
    nodeIds: [
      "kenya",
      "kes",
      "cbk",
      "nse",
      "nairobi",
      "mombasa",
      "banking",
      "agriculture",
      "energy",
      "policy-rate",
      "northern-corridor",
      "safaricom",
      "equity",
      "governor",
      "inflation-costs",
    ],
  },
  {
    slug: "nigeria",
    label: "Nigeria desk",
    lede: "CBN, NGX, Lagos and issuer scaffolds. No invented prints.",
    nodeIds: ["nigeria", "ngn", "cbn", "ngx", "lagos", "mtn-nigeria", "ng-banking", "ng-policy-rate"],
  },
  {
    slug: "south-africa",
    label: "South Africa desk",
    lede: "SARB, JSE and Johannesburg markets desk. Amounts stay blank until cited.",
    nodeIds: ["south-africa", "zar", "sarb", "jse", "johannesburg", "standard-bank", "za-banking"],
  },
  {
    slug: "egypt",
    label: "Egypt desk",
    lede: "CBE, EGX and Cairo. Energy sector tagged from the country file.",
    nodeIds: ["egypt", "egp", "cbe", "egx", "cairo", "eg-energy"],
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
  const allowed = new Set<string>(desk.nodeIds);
  return graphEdges.filter((edge) => allowed.has(edge.from) && allowed.has(edge.to));
}

export function edgesForNode(nodeId: string) {
  return graphEdges.filter((edge) => edge.from === nodeId || edge.to === nodeId);
}

export function graphFileHref(slug: string) {
  return `/graph/${slug}`;
}
