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

export async function runArchive(): Promise<ArchiveReport> {
  const ranAt = new Date().toISOString();
  const [fx, wire] = await Promise.all([loadFxQuote(), loadWire()]);
  const report: ArchiveReport = { ranAt, stored: true, fxRows: 0, wireRows: 0, errors: [] };

  if (fx) {
    const day = new Date(fx.updated).toISOString().slice(0, 10);
    const rows = Object.entries(fx.rates)
      .filter(([code]) => code !== "USD")
      .map(([code, rate]) => ({ day, code, rate, source: fx.sourceName }));
    const result = await rpc("af_archive_fx", { p_rows: rows });
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
  const result = await rpc("af_archive_wire", { p_rows: rows });
  if (result.ok) report.wireRows = Number(result.value) || 0;
  else report.errors.push(`wire: ${result.reason}`);
  report.stored = report.errors.length === 0;
  return report;
}
