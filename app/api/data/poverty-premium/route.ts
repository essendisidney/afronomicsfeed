import { csvError, dataFileResponse, LICENCE_LINE, TERMS_URL } from "@/lib/api";
import { loadPremium, premiumCsvFile, premiumMonths } from "@/lib/data/poverty-premium";

/** Free CSV (or ?format=xlsx) of the Kenya Poverty Premium: the latest month, or ?month=YYYY-MM for an earlier one. */
export function GET(request: Request) {
  const month = new URL(request.url).searchParams.get("month") ?? premiumMonths()[0];
  const file = month ? loadPremium(month) : null;
  const body = month ? premiumCsvFile(month) : null;
  if (!month || !file || !body) return csvError("No Poverty Premium file for that month.", 404);
  const csv = [
    `# Kenya Poverty Premium, ${month}: the extra a low-income Kenyan pays, or forgoes, for the same financial need`,
    "# Every figure computed by code from the source in its row (Central Bank of Kenya, Safaricom, mobile lenders, World Bank). Rows with status 'gap' are data we do not hold. Compiled by Afronomics (afronomicsfeed.com). Information, not advice.",
    body,
  ].join("\n");
  return dataFileResponse(
    request,
    csv,
    { dataset: "kenya-poverty-premium", title: `Kenya Poverty Premium, ${month}`, asOf: file.generatedAt.slice(0, 10), href: "/data/poverty-premium" },
    `${LICENCE_LINE} Terms: ${TERMS_URL}`,
  );
}
