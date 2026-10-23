import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { auctions, demandByCountry, type Auction, type CountryDemand, type RawLine } from "@/lib/waemu-demand-core";

/** WAEMU auction demand from UMOA-Titres results (data/waemu/auctions.json); the arithmetic is lib/waemu-demand-core.ts. */

const FILE = path.join(process.cwd(), "data", "waemu", "auctions.json");

export const WAEMU_COUNTRIES: Record<string, string> = {
  benin: "Benin",
  "burkina-faso": "Burkina Faso",
  "cote-divoire": "Côte d’Ivoire",
  "guinea-bissau": "Guinea-Bissau",
  mali: "Mali",
  niger: "Niger",
  senegal: "Senegal",
  togo: "Togo",
};

export const loadWaemuDemand = cache((): { updated: string | null; countries: CountryDemand[]; all: Auction[] } => {
  if (!fs.existsSync(FILE)) return { updated: null, countries: [], all: [] };
  const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as { read_at?: string; updated?: string; rows?: RawLine[] };
  const all = auctions(raw.rows ?? []);
  return { updated: raw.read_at ?? raw.updated ?? null, countries: demandByCountry(all), all };
});
