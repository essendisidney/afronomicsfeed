/**
 * The source registry (founder-strategy-pack.md section G1): every upstream publisher a paid product draws on, what we
 * take from it and on what terms. A source whose permission is "needed" or "asked" does not go into a paid product,
 * except as attributed facts in reporting. Served at /api/v1/sources. Terms checked 28 Oct 2026 (appendix B).
 */
export type Permission = "not_needed" | "attribution" | "asked" | "needed" | "excluded";

export type Source = {
  id: string;
  publisher: string;
  what: string;
  url: string;
  format: "pdf" | "html" | "excel" | "csv" | "json";
  frequency: string;
  terms: string;
  permission: Permission;
  inPaidProducts: boolean;
};

export const SOURCES: Source[] = [
  { id: "cbk-auctions", publisher: "Central Bank of Kenya", what: "Treasury bill and bond auction results", url: "https://www.centralbank.go.ke/securities/", format: "pdf", frequency: "weekly (bills), monthly (bonds)", terms: "No open licence; facts reported with attribution. Written permission for bulk redistribution through the paid API not yet requested (founder action, strategy pack section N).", permission: "attribution", inPaidProducts: true },
  { id: "cbk-rates", publisher: "Central Bank of Kenya", what: "Bank deposit and lending averages, policy rate", url: "https://www.centralbank.go.ke/rates/", format: "excel", frequency: "monthly", terms: "As above.", permission: "attribution", inPaidProducts: true },
  { id: "cma-cis", publisher: "Capital Markets Authority", what: "Collective investment schemes quarterly report", url: "https://www.cma.or.ke", format: "pdf", frequency: "quarterly", terms: "Public report; cited as context with attribution. No ranking of named managers (D-028).", permission: "attribution", inPaidProducts: true },
  { id: "fund-yields", publisher: "Fund managers", what: "Published money market and fixed-income fund yields", url: "https://www.afronomicsfeed.com/rates/kenya/money-market-funds", format: "html", frequency: "daily to monthly", terms: "Published facts with source and date; listed A to Z, never ranked.", permission: "attribution", inPaidProducts: true },
  { id: "sasra", publisher: "SACCO Societies Regulatory Authority", what: "Licence list and annual supervision report", url: "https://www.sasra.go.ke", format: "pdf", frequency: "yearly", terms: "Public; attributed. Industry figures only in published products.", permission: "attribution", inPaidProducts: true },
  { id: "rba", publisher: "Retirement Benefits Authority", what: "Industry briefs on pension assets", url: "https://www.rba.go.ke", format: "pdf", frequency: "half-yearly", terms: "Public; attributed.", permission: "attribution", inPaidProducts: true },
  { id: "nse", publisher: "Nairobi Securities Exchange", what: "Equity prices", url: "https://www.nse.co.ke/dataservices/", format: "html", frequency: "daily", terms: "Redistribution in any medium needs an NSE distribution licence. Not shown until licensed.", permission: "excluded", inPaidProducts: false },
  { id: "bou", publisher: "Bank of Uganda", what: "Treasury bill and bond auction results", url: "https://www.bou.or.ug", format: "pdf", frequency: "fortnightly", terms: "Reproduction needs written permission. Not in the paid regional pack until granted.", permission: "needed", inPaidProducts: false },
  { id: "cbn", publisher: "Central Bank of Nigeria", what: "Treasury bill results", url: "https://www.cbn.gov.ng/Legal.html", format: "html", frequency: "fortnightly", terms: "Copying allowed with CBN named as the source and the content unaltered.", permission: "attribution", inPaidProducts: true },
  { id: "worldbank-cpi", publisher: "World Bank", what: "Consumer price inflation, annual", url: "https://data.worldbank.org", format: "json", frequency: "yearly", terms: "CC BY 4.0.", permission: "attribution", inPaidProducts: true },
];
