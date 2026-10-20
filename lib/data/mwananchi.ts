import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Pain } from "@/lib/mwananchi-core";

/** The Mwananchi engine's catalogue (data/mwananchi/pains.json); see lib/mwananchi-core.ts for the scoring. */
export const loadPains = cache((): Pain[] => {
  const file = path.join(process.cwd(), "data", "mwananchi", "pains.json");
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")).pains as Pain[]) : [];
});
