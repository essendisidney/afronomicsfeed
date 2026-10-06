import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

/**
 * The cost of sending money to African countries, corridor by corridor, from the World Bank's Remittance Prices
 * Worldwide survey (scripts/remittance_prices.py). Cost = fee plus exchange-rate margin, as a % of sending the
 * equivalent of USD 200.
 */

export type Corridor = {
  src: string;
  src_name: string;
  dst: string;
  dst_name: string;
  services: number;
  avg_cost_pct: number;
  prev_avg_cost_pct?: number | null;
  cheapest: { firm: string; type: string; cost_pct: number };
  dearest_pct: number;
  by_type: Record<string, number>;
};

type File = { publisher: string; source: string; source_page: string; period: string; previous_period: string | null; corridors: Corridor[] };

const FILE = path.join(process.cwd(), "data", "remittances", "corridors.json");

export const loadRemittances = cache((): File | null => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : null));

/** The UN's Sustainable Development Goal target for the cost of sending remittances (SDG 10.c). */
export const SDG_TARGET = 3;

export function byDestination() {
  const f = loadRemittances();
  const map = new Map<string, { dst: string; name: string; corridors: Corridor[]; avg: number }>();
  for (const c of f?.corridors ?? []) {
    const d = map.get(c.dst) ?? { dst: c.dst, name: c.dst_name, corridors: [], avg: 0 };
    d.corridors.push(c);
    map.set(c.dst, d);
  }
  for (const d of map.values()) {
    d.corridors.sort((a, b) => a.avg_cost_pct - b.avg_cost_pct);
    d.avg = d.corridors.reduce((n, c) => n + c.avg_cost_pct, 0) / d.corridors.length;
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}
