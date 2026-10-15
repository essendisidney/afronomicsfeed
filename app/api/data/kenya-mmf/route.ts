import { dataFileResponse, LICENCE_LINE, TERMS_URL } from "@/lib/api";
import { fundHistoryCsv } from "@/lib/data/kenya-rates";

/** Free CSV (or ?format=xlsx) of every Kenya money market fund yield Afronomics has read, one row per fund per day. */
export function GET(request: Request) {
  const csv = ["# Kenya money market fund yields, one row per fund per day", "# Source: each fund manager's published daily and effective annual yields; the source column links each row. Compiled by Afronomics (afronomicsfeed.com). Yields before withholding tax.", fundHistoryCsv()].join("\n");
  return dataFileResponse(request, csv, { dataset: "kenya-money-market-funds", title: "Kenya money market fund yields", asOf: latest(csv), href: "/rates/kenya/money-market-funds" }, `${LICENCE_LINE} Terms: ${TERMS_URL}`);
}

const latest = (csv: string) => (csv.match(/^\d{4}-\d{2}-\d{2}/gm) ?? []).sort().at(-1) ?? new Date().toISOString().slice(0, 10);
