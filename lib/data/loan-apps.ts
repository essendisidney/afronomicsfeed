import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { lenderSlug } from "@/lib/data/lender-slug";

export { LOAN_APPS, lenderHref, lenderSlug } from "@/lib/data/lender-slug";

/** Kenya's licensed digital credit providers, read from the CBK's monthly directory by scripts/kenya_dcp.py. */
export type Lender = { no: number; name: string; postal: string; phone: string; email: string; address: string; licensed: string | null };
export type LenderFile = {
  source: string;
  source_posted: string;
  updated: string | null;
  read_at: string;
  lenders: Lender[];
  added_last: string[];
  removed: { name: string; last_listed: string | null; dropped_by: string | null }[];
};

const FILE = path.join(process.cwd(), "data", "kenya", "dcp_directory.json");

export const loadLenders = cache((): LenderFile | null => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : null));

/** The part of an email address that often names the app (zashloan.com), unless it is a free mail service. */
export function lenderDomain(email: string) {
  const d = email.split("@")[1]?.toLowerCase().trim() ?? "";
  return /^(gmail|yahoo|outlook|hotmail|icloud|proton|protonmail|live)\./.test(d) ? "" : d;
}

/** A lender on the latest directory, or one that has dropped off it since we started reading, by page address. */
export function lenderBySlug(slug: string) {
  const f = loadLenders();
  if (!f) return null;
  const listed = f.lenders.find((l) => lenderSlug(l.name) === slug);
  if (listed) return { file: f, lender: listed, removed: null };
  const gone = f.removed.find((r) => lenderSlug(r.name) === slug);
  return gone ? { file: f, lender: null, removed: gone } : null;
}
