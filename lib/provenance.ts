import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * Provenance of every auction dataset the site serves (founder-strategy-pack.md section G3): the file's SHA-256, its
 * row count, the newest date in it, when the reader last updated it, and how many rows carry their own source link.
 * Computed when the site is built, so it describes exactly the data deployed. Served at /api/v1/provenance.
 */

export type FileProvenance = {
  file: string;
  dataset: string | null;
  publisher: string | null;
  sha256: string;
  rows: number;
  rows_with_source: number;
  newest_date: string | null;
  updated_at: string | null;
};

const RATE_KEYS = ["weighted_avg_rate", "stop_rate", "rate", "yield"];
const DATE_KEYS = ["value_date", "auction_date", "settlement_date", "issue_date"];

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? (e.name === "quality" ? [] : walk(p)) : e.name.endsWith(".json") ? [p] : [];
  });
}

export function provenance(root = process.cwd()): FileProvenance[] {
  const out: FileProvenance[] = [];
  for (const file of walk(path.join(root, "data")).sort()) {
    const raw = fs.readFileSync(file);
    let d: { rows?: Record<string, unknown>[]; dataset?: string; publisher?: string; updated_at?: string; updated?: string };
    try {
      d = JSON.parse(raw.toString("utf8"));
    } catch {
      continue;
    }
    const rows = Array.isArray(d?.rows) ? d.rows : null;
    if (!rows?.length || typeof rows[0] !== "object" || !("source" in rows[0]) || !RATE_KEYS.some((k) => k in rows[0])) continue;
    let newest: string | null = null;
    let withSource = 0;
    for (const r of rows) {
      if (typeof r.source === "string" && /^https?:\/\//.test(r.source)) withSource += 1;
      const dk = DATE_KEYS.find((k) => typeof r[k] === "string");
      const dt = dk ? String(r[dk]).slice(0, 10) : null;
      if (dt && /^\d{4}-\d{2}-\d{2}$/.test(dt) && (!newest || dt > newest)) newest = dt;
    }
    out.push({
      file: path.relative(root, file).split(path.sep).join("/"),
      dataset: typeof d.dataset === "string" ? d.dataset : null,
      publisher: typeof d.publisher === "string" ? d.publisher : null,
      sha256: createHash("sha256").update(raw).digest("hex"),
      rows: rows.length,
      rows_with_source: withSource,
      newest_date: newest,
      updated_at: d.updated_at ?? d.updated ?? null,
    });
  }
  return out;
}
