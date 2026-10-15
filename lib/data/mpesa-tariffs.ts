import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { Tariffs } from "@/lib/mpesa-calc";

/** Safaricom's M-PESA consumer charges and Fuliza fees, copied by hand into data/kenya/mpesa_tariffs.json. */
export const loadMpesaTariffs = cache((): Tariffs => JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "kenya", "mpesa_tariffs.json"), "utf8")) as Tariffs);
