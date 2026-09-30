import { loadFxQuote } from "@/lib/data/fx";
import { loadWire } from "@/lib/data/wire";

/**
 * The archive agent. Once a day it writes what the site saw into Afronomics’ own
 * database: every currency reference rate and every Wire headline. Public APIs
 * only give “latest”; the archive turns that into history nobody else keeps.
 */

type Store = { url: string; key: string };

function store(): Store | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url: url.replace(/\/$/, ""), key } : null;
}

async function upsert(cfg: Store, table: string, conflict: string, rows: unknown[]) {
  if (rows.length === 0) return 0;
  const response = await fetch(`${cfg.url}/rest/v1/${table}?on_conflict=${conflict}`, {
    method: "POST",
    headers: {
      apikey: cfg.key,
      Authorization: `Bearer ${cfg.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${table}: ${response.status} ${(await response.text()).slice(0, 200)}`);
  return rows.length;
}

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
  const cfg = store();
  const report: ArchiveReport = { ranAt, stored: Boolean(cfg), fxRows: 0, wireRows: 0, errors: [] };
  if (!cfg) {
    report.errors.push("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set; nothing archived.");
    return report;
  }

  if (fx) {
    const day = new Date(fx.updated).toISOString().slice(0, 10);
    const rows = Object.entries(fx.rates)
      .filter(([code]) => code !== "USD")
      .map(([code, rate]) => ({ day, base: "USD", code, rate, source: fx.sourceName }));
    try {
      report.fxRows = await upsert(cfg, "fx_daily", "day,base,code", rows);
    } catch (error) {
      report.errors.push(error instanceof Error ? error.message : "fx_daily write failed");
    }
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
  try {
    report.wireRows = await upsert(cfg, "wire_archive", "url", rows);
  } catch (error) {
    report.errors.push(error instanceof Error ? error.message : "wire_archive write failed");
  }
  return report;
}
