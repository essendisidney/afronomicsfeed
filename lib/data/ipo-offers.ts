import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Offer } from "@/lib/ipo-calc";

/** Open share offers, with terms copied from our Receipts into data/ipo/offers.json. */
export const loadIpoOffers = cache((): Offer[] => (JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "ipo", "offers.json"), "utf8")) as { offers: Offer[] }).offers);
