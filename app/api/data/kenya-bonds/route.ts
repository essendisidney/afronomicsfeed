import { apiAccess, apiCsv, CSV_KEYED, csvError, readRange, sliceRows } from "@/lib/api";
import { bondsCsv, loadBonds } from "@/lib/data/kenya-bonds";

export const dynamic = "force-dynamic";

/**
 * Kenya Treasury bond auction results as CSV, with CBK notice links. Without a key: the latest 12 months, up to 100
 * rows. With a key (Authorization: Bearer afk_…, or a browser download session from /downloads): the full history. Optional from, to, limit.
 */
export async function GET(request: Request) {
  const range = readRange(request);
  if (!range) return csvError("Dates must be YYYY-MM-DD.", 400);
  const file = loadBonds();
  const access = await apiAccess(request, "/data/kenya-bonds", { csv: true });
  const sliced = sliceRows(request, file.rows, (r) => r.value_date, range, access, CSV_KEYED);
  return apiCsv(bondsCsv({ ...file, rows: sliced.rows }), "afronomics-kenya-bond-auctions.csv", access, sliced.free, { request, meta: { dataset: "kenya-bond-auctions", title: "Kenya government bond auctions", href: "/markets/kenya-bonds" } });
}
