import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

/** Nigeria's FGN Savings Bond offers, as read from the DMO's monthly offer document (scripts/nigeria_savings_bond.py). */

export type SavingsBondOffer = {
  offer: string;
  source: string;
  read_at: string;
  bonds: { years: number; due: string | null; rate: number }[];
  opening: string | null;
  closing: string | null;
  settlement: string | null;
  coupon_dates: string | null;
  unit_naira: number | null;
  minimum_naira: number | null;
  maximum_naira: number | null;
};

type SavingsBondFile = {
  source_page: string;
  latest?: SavingsBondOffer;
  history?: { offer: string; source: string; opening: string | null; bonds: { years: number; rate: number }[] }[];
};

const FILE = path.join(process.cwd(), "data", "nigeria", "savings_bond.json");

export const loadSavingsBond = cache((): SavingsBondFile | null => (fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf8")) : null));
