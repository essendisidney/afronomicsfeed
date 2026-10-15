import { apiAccess, apiCsv, CSV_KEYED, csvError, readRange, sliceRows } from "@/lib/api";
import { loadTbills, tbillsCsv } from "@/lib/data/kenya-tbills";

export const dynamic = "force-dynamic";

/**
 * Kenya Treasury bill auctions as CSV, with CBK notice links. Without a key: the latest 12 months, up to 100 rows.
 * With a key (Authorization: Bearer afk_…, or a browser download session from /downloads): the full history. Optional from, to, limit.
 */
export async function GET(request: Request) {
  const range = readRange(request);
  if (!range) return csvError("Dates must be YYYY-MM-DD.", 400);
  const file = loadTbills();
  const access = await apiAccess(request, "/data/kenya-tbills", { csv: true });
  const sliced = sliceRows(request, file.rows, (r) => r.value_date, range, access, CSV_KEYED);
  return apiCsv(tbillsCsv({ ...file, rows: sliced.rows }), "afronomics-kenya-tbill-auctions.csv", access, sliced.free, { request, meta: { dataset: "kenya-tbill-auctions", title: "Kenya Treasury bill auctions", href: "/markets/kenya-tbills" } });
}
