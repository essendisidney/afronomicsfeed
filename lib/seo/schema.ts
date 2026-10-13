import { billMarkets, type BillMarket } from "@/lib/data/sovereign-bills";
import { bondMarkets, type BondMarket } from "@/lib/data/sovereign-bonds";
import { site } from "@/lib/site";
import { billSpan, billUpdated, bondSpan, bondUpdated, newest } from "./freshness";

/**
 * schema.org structured data for the site (Organization, WebSite) and for the auction datasets (Dataset), as read by
 * search engines, Google Dataset Search and AI answer engines. Every field is computed from the data files; nothing
 * here is claimed that the site does not show.
 */

const u = (p: string) => `${site.url}${p}`;
const ORG_ID = u("/#organization");
const SITE_ID = u("/#website");
/** The open-data terms: free reuse with the credit "Source: Afronomics" and a link. */
export const DATA_LICENSE_URL = u("/developers#terms");

export const organizationRef = { "@type": "Organization", "@id": ORG_ID, name: site.name, url: site.url } as const;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": ORG_ID,
    name: site.name,
    alternateName: site.legalName,
    url: site.url,
    logo: { "@type": "ImageObject", url: u("/icons/icon-512.png"), width: 512, height: 512 },
    description: site.description,
    email: site.contactEmail,
    sameAs: [site.linkedinUrl, site.telegramUrl],
    parentOrganization: { "@type": "Organization", name: site.houseName, url: site.houseUrl },
    publishingPrinciples: u("/method"),
    correctionsPolicy: u("/corrections"),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

const catalog = { "@type": "DataCatalog", name: `${site.name} data`, url: u("/data") };
const coverage = (first: string | null, last: string | null) => (first && last ? `${first}/${last}` : undefined);
const iso = (d: Date | null) => d?.toISOString();
const prop = (name: string, description: string, unitText?: string) => ({ "@type": "PropertyValue", name, description, ...(unitText ? { unitText } : {}) });

const billVariables = (m: Pick<BillMarket, "currency" | "rateNote">) => [
  prop("rate", `Treasury bill rate: the ${m.rateNote}`, "percent per annum"),
  prop("tenor", "Bill tenor: 91, 182 or 364 days", "days"),
  prop("offered", "Amount offered at the auction", `${m.currency} millions`),
  prop("received", "Bids received", `${m.currency} millions`),
  prop("accepted", "Amount accepted", `${m.currency} millions`),
];

const bondVariables = (m: Pick<BondMarket, "currency" | "rateNote">) => [
  prop("rate", `Bond auction rate: ${m.rateNote}`, "percent per annum"),
  prop("tenor_years", "Bond tenor", "years"),
  prop("coupon", "Coupon rate", "percent per annum"),
  prop("offered_m", "Amount offered", `${m.currency} millions`),
  prop("received_m", "Bids received", `${m.currency} millions`),
  prop("accepted_m", "Amount accepted", `${m.currency} millions`),
  prop("bid_cover", "Bids received divided by the amount accepted"),
  prop("isin", "ISIN of the bond line, where the publisher gives one"),
];

const csv = (path: string, name: string) => ({ "@type": "DataDownload", name, encodingFormat: "text/csv", contentUrl: u(path) });
const json = (path: string, name: string) => ({ "@type": "DataDownload", name, encodingFormat: "application/json", contentUrl: u(path) });

/** The page a market's Treasury bill results live on: Kenya keeps its own long-standing page. */
export const billPagePath = (slug: BillMarket["slug"]) => (slug === "kenya" ? "/markets/kenya-tbills" : `/markets/tbills/${slug}`);

/** One African market's Treasury bill auction results (/markets/tbills/{country}, and /markets/kenya-tbills). */
export function tbillDatasetJsonLd(market: BillMarket) {
  const { first, last } = billSpan(market.slug);
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${market.country} Treasury bill auction results`,
    description: `Every ${market.publisher} Treasury bill auction compiled by ${site.name}: 91-, 182- and 364-day rates (${market.rateNote}), amounts offered, bids received and amounts accepted, with a link to the publisher's own notice for each result.`,
    url: u(billPagePath(market.slug)),
    keywords: [`${market.country} Treasury bills`, "T-bill auction results", "government securities", "interest rates", market.currency, "Africa"],
    creator: organizationRef,
    publisher: organizationRef,
    isBasedOn: market.sourcePage,
    license: DATA_LICENSE_URL,
    isAccessibleForFree: true,
    temporalCoverage: coverage(first, last),
    spatialCoverage: { "@type": "Place", name: market.country },
    dateModified: iso(billUpdated(market.slug)),
    variableMeasured: billVariables(market),
    includedInDataCatalog: catalog,
    distribution: [
      csv(`/api/data/tbills/${market.slug}`, `${market.country} Treasury bill auctions (CSV; latest 12 months free, full history with a key)`),
      json(`/api/v1/tbills/${market.slug}`, `${market.country} Treasury bill auctions (JSON API; latest 12 months free, full history with a key)`),
    ],
  };
}

/**
 * One market's government bond auction results (the /markets/bonds/{market} pages and /markets/kenya-bonds), or one
 * issuing country inside a pooled market (/markets/bonds/waemu/{issuer}) when `issuer` is given with its rows' span.
 */
export function bondDatasetJsonLd(
  market: BondMarket,
  path = `/markets/bonds/${market.slug}`,
  issuer?: { name: string; first: string | null; last: string | null },
) {
  const { first, last } = issuer ?? bondSpan(market.slug);
  const place = issuer ? issuer.name : market.slug === "waemu" ? "WAEMU" : market.country;
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${issuer ? `${issuer.name} (WAEMU)` : market.country} government bond auction results`,
    description: `Every ${market.publisher} government bond auction${issuer ? ` for ${issuer.name}` : ""} compiled by ${site.name}: rate (${market.rateNote}), tenor, coupon, amounts offered, bids received and accepted, and bid-to-cover, with the source for each result.`,
    url: u(path),
    keywords: [`${place} government bonds`, `${place} bond auction results`, "local-currency debt", market.currency, "Africa"],
    creator: organizationRef,
    publisher: organizationRef,
    isBasedOn: market.sourcePage,
    license: DATA_LICENSE_URL,
    isAccessibleForFree: true,
    temporalCoverage: coverage(first, last),
    spatialCoverage: { "@type": "Place", name: issuer ? issuer.name : market.country },
    dateModified: iso(bondUpdated(market.slug)),
    variableMeasured: bondVariables(market),
    includedInDataCatalog: catalog,
    distribution: [
      csv(`/api/data/bonds/${market.slug}`, `${place} government bond auctions (CSV; latest 12 months free, full history with a key)`),
      json(
        `/api/v1/bonds/${market.slug}${issuer ? `?issue=${encodeURIComponent(issuer.name)}` : ""}`,
        `${place} government bond auctions (JSON API; latest 12 months free, full history with a key)`,
      ),
    ],
  };
}

/**
 * One dated bond auction (/markets/bonds/{market}/{date}, /markets/bonds/waemu/{issuer}/{date},
 * /markets/kenya-bonds/{date}): the lines sold that day, as a Dataset that is part of the market's own Dataset.
 */
export function bondAuctionDatasetJsonLd(
  market: BondMarket,
  a: {
    path: string;
    date: string;
    name: string;
    description: string;
    place: string;
    sources: string[];
    marketPath: string;
    issuer?: string | null;
  },
) {
  const apiQuery = `?from=${a.date}&to=${a.date}${a.issuer ? `&issue=${encodeURIComponent(a.issuer)}` : ""}`;
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: a.name,
    description: a.description,
    url: u(a.path),
    keywords: [`${a.place} government bonds`, `${a.place} bond auction results`, "local-currency debt", market.currency, "Africa"],
    creator: organizationRef,
    publisher: organizationRef,
    isBasedOn: a.sources.length ? a.sources : market.sourcePage,
    isPartOf: {
      "@type": "Dataset",
      name: `${a.issuer ? `${a.issuer} (WAEMU)` : market.country} government bond auction results`,
      url: u(a.marketPath),
    },
    license: DATA_LICENSE_URL,
    isAccessibleForFree: true,
    temporalCoverage: a.date,
    spatialCoverage: { "@type": "Place", name: a.issuer ?? market.country },
    variableMeasured: bondVariables(market),
    includedInDataCatalog: catalog,
    distribution: [
      csv(
        market.slug === "kenya" ? "/api/data/kenya-bonds" : `/api/data/bonds/${market.slug}`,
        `${a.place} government bond auctions (CSV; latest 12 months free, full history with a key)`,
      ),
      json(`/api/v1/bonds/${market.slug}${apiQuery}`, `${a.place} bond auction of ${a.date} (JSON API; latest 12 months free, full history with a key)`),
    ],
  };
}

/** A hub page that lists several datasets (/markets/bonds, /markets/tbills): a DataCatalog naming each one. */
export function dataCatalogJsonLd(name: string, path: string, description: string, datasets: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "DataCatalog",
    name,
    description,
    url: u(path),
    creator: organizationRef,
    publisher: organizationRef,
    license: DATA_LICENSE_URL,
    isAccessibleForFree: true,
    dataset: datasets.map((d) => ({ "@type": "Dataset", name: d.name, url: u(d.path) })),
  };
}

/** The frontier local-debt product: every bill and bond market in one Dataset (the /data/frontier-local-debt page). */
export function frontierDebtDatasetJsonLd() {
  const bills = billMarkets.map((m) => ({ m, ...billSpan(m.slug) })).filter((x) => x.first);
  const bonds = bondMarkets.map((m) => ({ m, ...bondSpan(m.slug) })).filter((x) => x.first);
  const firsts = [...bills, ...bonds].map((x) => x.first!).sort();
  const lasts = [...bills, ...bonds].map((x) => x.last!).sort();
  const places = [...new Set([...bills.map((x) => x.m.country), ...bonds.map((x) => x.m.country)])];
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "African local-currency government debt: primary auction results",
    description: `Primary Treasury bill and government bond auction results from African central banks and debt offices, compiled by ${site.name} from each publisher's own notices: rates, tenors, amounts offered, bids received and accepted, for ${bills.length} Treasury bill markets and ${bonds.length} bond markets.`,
    url: u("/data/frontier-local-debt"),
    keywords: ["frontier markets", "local-currency government bonds", "Treasury bills", "auction results", "GBI-EM", "Africa"],
    creator: organizationRef,
    publisher: organizationRef,
    isBasedOn: [...bills.map((x) => x.m.sourcePage), ...bonds.map((x) => x.m.sourcePage)].filter((v, i, a) => a.indexOf(v) === i),
    license: DATA_LICENSE_URL,
    isAccessibleForFree: true,
    temporalCoverage: coverage(firsts[0] ?? null, lasts.at(-1) ?? null),
    spatialCoverage: places.map((name) => ({ "@type": "Place", name })),
    dateModified: iso(newest(...bills.map((x) => billUpdated(x.m.slug)), ...bonds.map((x) => bondUpdated(x.m.slug)))),
    variableMeasured: [
      prop("rate", "Auction rate as each publisher reports it (stop, weighted average or cut-off)", "percent per annum"),
      prop("tenor", "Tenor of the bill (days) or bond (years)"),
      prop("offered", "Amount offered", "local currency, millions"),
      prop("received", "Bids received", "local currency, millions"),
      prop("accepted", "Amount accepted", "local currency, millions"),
      prop("bid_cover", "Bids received divided by the amount accepted (bonds)"),
    ],
    includedInDataCatalog: catalog,
    distribution: [
      json("/api/v1/tbills", "Treasury bill markets: latest results and coverage (JSON API)"),
      json("/api/v1/bonds", "Government bond markets: latest auctions and coverage (JSON API)"),
      ...bills.map((x) => csv(`/api/data/tbills/${x.m.slug}`, `${x.m.country} Treasury bill auctions (CSV)`)),
      ...bonds.map((x) => csv(`/api/data/bonds/${x.m.slug}`, `${x.m.country} government bond auctions (CSV)`)),
    ],
  };
}
