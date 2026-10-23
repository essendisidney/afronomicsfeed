import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { standing, type Citation } from "./citations-core";

const FILE = path.join(process.cwd(), "data", "citations.json");

/** The whole log as written (data/citations.json), withdrawals included. A missing or unreadable file is an empty log. */
export const loadCitations = cache((): { updatedAt: string | null; entries: Citation[] } => {
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, "utf8")) as { updated_at?: string | null; entries?: Citation[] };
    return { updatedAt: raw.updated_at ?? null, entries: Array.isArray(raw.entries) ? raw.entries : [] };
  } catch {
    return { updatedAt: null, entries: [] };
  }
});

/** The entries that stand, newest first. */
export const standingCitations = () => standing(loadCitations().entries);
