import { apiAccess, apiCsv, CSV_KEYED, csvError, readRange, sliceRows } from "@/lib/api";
import { bondsCsv, getBondMarket, loadBondMarket } from "@/lib/data/sovereign-bonds";

export const dynamic = "force-dynamic";

/**
 * A market's bond auctions as CSV. Without a key: the latest 12 months, up to 100 rows (the `#` lines at the top say
 * so and link the next page). With a key (Authorization: Bearer afk_…): the full history. Optional from, to, limit.
 */
export async function GET(request: Request, { params }: { params: Promise<{ market: string }> }) {
  const { market: slug } = await params;
  const market = getBondMarket(slug);
  if (!market) return csvError("Unknown market", 404);
  const range = readRange(request);
  if (!range) return csvError("Dates must be YYYY-MM-DD.", 400);
  const { rows, updatedAt } = loadBondMarket(market.slug);
  if (rows.length === 0) return csvError("Dataset not yet published", 404);
  const access = await apiAccess(request, `/data/bonds/${market.slug}`);
  const sliced = sliceRows(request, rows, (r) => r.date, range, access, CSV_KEYED);
  return apiCsv(bondsCsv(market, sliced.rows, updatedAt), `afronomics-${market.slug}-bond-auctions.csv`, access, sliced.free);
}
