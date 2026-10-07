import { rpc } from "@/lib/store";
import { WINDOW_DAYS, type SummaryRow } from "@/lib/reader-reports-core";

/** Medians and middle ranges of what readers reported in the last 30 days (null when the database is unreachable). */
export async function readerSummary(): Promise<SummaryRow[] | null> {
  const secret = process.env.AF_CRON_SECRET;
  if (!secret) return null;
  const result = await rpc("af_reader_report_summary", { p_secret: secret, p_days: WINDOW_DAYS });
  return result.ok && Array.isArray(result.value) ? (result.value as SummaryRow[]) : null;
}
