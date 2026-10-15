import { dataFileResponse, LICENCE_LINE, TERMS_URL } from "@/lib/api";
import { cmaFundsCsv, loadCmaFunds } from "@/lib/data/cma-mmf";

/** Free CSV (or ?format=xlsx): every Kenyan money market fund and its size, from the CMA's quarterly report. */
export function GET(request: Request) {
  const f = loadCmaFunds();
  const csv = ["# Kenya money market funds by assets under management", `# Source: ${f ? `${f.publisher}, ${f.report} (${f.source})` : "Capital Markets Authority"}. Compiled by Afronomics (afronomicsfeed.com).`, cmaFundsCsv()].join("\n");
  return dataFileResponse(request, csv, { dataset: "kenya-money-market-fund-sizes", title: "Kenya money market funds by size", asOf: f?.as_of ?? new Date().toISOString().slice(0, 10), href: "/rates/kenya/money-market-funds" }, `${LICENCE_LINE} Terms: ${TERMS_URL}`);
}
