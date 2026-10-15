import { apiAccess, apiCsv, CSV_KEYED, csvError, readRange, sliceRows } from "@/lib/api";
import { billsCsv, getBillMarket, loadBillMarket } from "@/lib/data/sovereign-bills";

export const dynamic = "force-dynamic";

/**
 * A market's Treasury bill auctions as CSV. Without a key: the latest 12 months, up to 100 rows (the `#` lines at the
 * top say so and link the next page). With a key (Authorization: Bearer afk_…, or a browser download session from /downloads): the full history. Optional from, to, limit.
 */
export async function GET(request: Request, { params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const market = getBillMarket(country);
  if (!market) return csvError("Unknown market", 404);
  const range = readRange(request);
  if (!range) return csvError("Dates must be YYYY-MM-DD.", 400);
  const { rows, updatedAt } = loadBillMarket(market.slug);
  if (rows.length === 0) return csvError("Dataset not yet published", 404);
  const access = await apiAccess(request, `/data/tbills/${market.slug}`, { csv: true });
  const sliced = sliceRows(request, rows, (r) => r.date, range, access, CSV_KEYED);
  return apiCsv(billsCsv(market, sliced.rows, updatedAt), `afronomics-${market.slug}-tbills.csv`, access, sliced.free, { request, meta: { dataset: `${market.slug}-tbill-auctions`, title: `${market.country} Treasury bill auctions`, href: market.href } });
}
