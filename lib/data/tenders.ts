import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Tender } from "@/lib/tenders-core";

export type TenderFile = {
  source: string;
  financial_year: string;
  published: string | null;
  read_at: string;
  releases_in_file: number;
  tenders: Tender[];
};

const FILE = path.join(process.cwd(), "data", "kenya", "tenders.json");

/** Open Kenyan government tenders, read by scripts/kenya_tenders.py; tenders past their closing time are dropped. */
export const loadTenders = cache((): TenderFile | null => {
  if (!fs.existsSync(FILE)) return null;
  const f = JSON.parse(fs.readFileSync(FILE, "utf8")) as TenderFile;
  const now = Date.now();
  return { ...f, tenders: f.tenders.filter((t) => Date.parse(t.closes) >= now) };
});

/** The time a request is answered at (the tenders page is rendered per request, so "closes in N days" is current). */
export const requestTime = () => Date.now();
