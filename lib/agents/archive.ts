import { loadFxQuote } from "@/lib/data/fx";
import { loadWire } from "@/lib/data/wire";
import { rpc } from "@/lib/store";

/**
 * The archive agent. Once a day it writes what the site saw into Afronomics’ own
 * database: every currency reference rate and every Wire headline. Public APIs
 * only give “latest”; the archive turns that into history nobody else keeps.
 */

export type ArchiveReport = {
  ranAt: string;
  stored: boolean;
  fxRows: number;
  wireRows: number;
  errors: string[];
};

/**
 * Secret-gated writers (migration 0038): af_archive_fx / af_archive_wire with p_secret. Until that migration is applied
 * the one-argument functions are used; after it, the one-argument ones are no longer callable with the public key, so
 * nobody but this job can write FX rates or headlines into the archive the Morning note and the pack read.
 */
async function archiveRpc(fn: "af_archive_fx" | "af_archive_wire", rows: unknown[]) {
  const secret = process.env.AF_CRON_SECRET ?? "";
  if (secret) {
    const gated = await rpc(fn, { p_rows: rows, p_secret: secret });
    if (gated.ok || !/PGRST202|Could not find the function|^404/.test(gated.reason)) return gated;
  }
  return rpc(fn, { p_rows: rows });
}

export async function runArchive(): Promise<ArchiveReport> {
  const ranAt = new Date().toISOString();
  const [fx, wire] = await Promise.all([loadFxQuote(), loadWire()]);
  const report: ArchiveReport = { ranAt, stored: true, fxRows: 0, wireRows: 0, errors: [] };

  if (fx) {
    const day = new Date(fx.updated).toISOString().slice(0, 10);
    const rows = Object.entries(fx.rates)
      .filter(([code]) => code !== "USD")
      .map(([code, rate]) => ({ day, code, rate, source: fx.sourceName }));
    const result = await archiveRpc("af_archive_fx", rows);
    if (result.ok) report.fxRows = Number(result.value) || 0;
    else report.errors.push(`fx: ${result.reason}`);
  }

  const rows = wire.map((item) => ({
    url: item.url,
    title: item.title,
    publisher: item.publisher,
    published_at: item.publishedAt,
    summary: item.summary,
    countries: item.countries.map((country) => country.iso),
    desks: item.desks,
  }));
  const result = await archiveRpc("af_archive_wire", rows);
  if (result.ok) report.wireRows = Number(result.value) || 0;
  else report.errors.push(`wire: ${result.reason}`);
  report.stored = report.errors.length === 0;
  return report;
}
