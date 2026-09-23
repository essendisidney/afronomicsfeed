import { site } from "./site";

export type InstitutionSlug = "cbk" | "cma" | "nse" | "treasury" | "sasra" | "ira";
export type TopicSlug =
  | "mpc"
  | "bank-supervision"
  | "capital-markets-conduct"
  | "treasury-bills"
  | "listed-banks"
  | "money-markets"
  | "saccos"
  | "insurance"
  | "nse-disclosures";

export type Institution = {
  slug: InstitutionSlug;
  name: string;
  short: string;
  mandate: string;
  url: string;
  topics: TopicSlug[];
};

export type Topic = {
  slug: TopicSlug;
  name: string;
  summary: string;
  institutions: InstitutionSlug[];
};

export const institutions: Institution[] = [
  {
    slug: "cbk",
    name: "Central Bank of Kenya",
    short: "CBK",
    mandate: "Monetary policy, bank supervision, and payment-system matters within its published remit.",
    url: site.cbkUrl,
    topics: ["mpc", "bank-supervision", "treasury-bills", "money-markets"],
  },
  {
    slug: "cma",
    name: "Capital Markets Authority",
    short: "CMA",
    mandate: "Licensing, conduct, disclosure, and enforcement in Kenya’s capital markets.",
    url: site.cmaUrl,
    topics: ["capital-markets-conduct", "nse-disclosures", "listed-banks"],
  },
  {
    slug: "nse",
    name: "Nairobi Securities Exchange",
    short: "NSE",
    mandate: "Listing and trading venue for equities and listed fixed income. The official tape lives here.",
    url: site.nseTapeUrl,
    topics: ["nse-disclosures", "listed-banks"],
  },
  {
    slug: "treasury",
    name: "The National Treasury",
    short: "Treasury",
    mandate: "Sovereign issuer and fiscal authority. Auction operations are typically visible through CBK publications.",
    url: "https://www.treasury.go.ke/",
    topics: ["treasury-bills", "money-markets"],
  },
  {
    slug: "sasra",
    name: "Sacco Societies Regulatory Authority",
    short: "SASRA",
    mandate: "Supervision of sacco societies under its published mandate, including deposit-taking saccos.",
    url: site.sasraUrl,
    topics: ["saccos"],
  },
  {
    slug: "ira",
    name: "Insurance Regulatory Authority",
    short: "IRA",
    mandate: "Insurance licensing, solvency publications, and conduct in that domain.",
    url: site.iraUrl,
    topics: ["insurance"],
  },
];

export const topics: Topic[] = [
  {
    slug: "mpc",
    name: "Monetary Policy Committee",
    summary: "How to read MPC statements as primary documents — rate line, diagnostics, operations.",
    institutions: ["cbk"],
  },
  {
    slug: "bank-supervision",
    name: "Bank supervision",
    summary: "Prudential circulars and the CBK Bank Supervision file.",
    institutions: ["cbk"],
  },
  {
    slug: "capital-markets-conduct",
    name: "Capital-markets conduct",
    summary: "CMA notices: parties, conduct, statutory hook, remedy.",
    institutions: ["cma"],
  },
  {
    slug: "treasury-bills",
    name: "Treasury bills",
    summary: "Auction sequence and why a remembered yield is not a print.",
    institutions: ["cbk", "treasury"],
  },
  {
    slug: "listed-banks",
    name: "Listed banks",
    summary: "Results-week disclosures — capital, credit, funding, costs.",
    institutions: ["nse", "cma", "cbk"],
  },
  {
    slug: "money-markets",
    name: "Money markets",
    summary: "Who sets the policy rate, who issues paper, and who operates the venue.",
    institutions: ["cbk", "treasury", "nse"],
  },
  {
    slug: "saccos",
    name: "Saccos",
    summary: "The SASRA perimeter beyond commercial-bank licences.",
    institutions: ["sasra"],
  },
  {
    slug: "insurance",
    name: "Insurance",
    summary: "IRA documents that a bank-only desk will miss.",
    institutions: ["ira"],
  },
  {
    slug: "nse-disclosures",
    name: "NSE disclosures",
    summary: "Issuer announcements on the exchange — not the live tape.",
    institutions: ["nse", "cma"],
  },
];

export function getInstitution(slug: string) {
  return institutions.find((item) => item.slug === slug);
}

export function getTopic(slug: string) {
  return topics.find((item) => item.slug === slug);
}

export const institutionSlugs = institutions.map((item) => item.slug);
export const topicSlugs = topics.map((item) => item.slug);
