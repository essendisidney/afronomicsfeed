// The monthly Kenya Poverty Premium file (docs/rebuild/upgrade-U3-plan.md). Reads the data files the repository
// already holds, computes every line with lib/poverty-premium.ts and writes data/kenya/poverty_premium/YYYY-MM.json
// and .csv. A month's file, once written, is kept: rerunning the same month changes nothing unless --force is given
// (a correction), so a cited figure does not move under the reader.
//
//   node --experimental-strip-types scripts/poverty_premium.mjs [--month YYYY-MM] [--force]
//
// No network access: it reads only files in data/. The month defaults to the current month in Nairobi.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { buildPremium, premiumCsv } = await import(pathToFileURL(path.join(ROOT, "lib", "poverty-premium.ts")).href);

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};
const force = args.includes("--force");
const nairobiMonth = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit" }).format(new Date()).slice(0, 7);
const month = flag("--month") ?? nairobiMonth;
if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
  console.error(`Bad month: ${month}`);
  process.exit(2);
}

const read = (...p) => JSON.parse(fs.readFileSync(path.join(ROOT, "data", ...p), "utf8"));
const rates = read("kenya", "rates.json");
const inputs = {
  bankRates: rates.bank_rates,
  tbills: read("kenya", "tbill_auctions.json"),
  mmf: rates.money_market_funds,
  mobileLoans: read("kenya", "mobile_loans.json").rows,
  mpesa: read("kenya", "mpesa_tariffs.json"),
  corridors: read("remittances", "corridors.json"),
};

const outDir = path.join(ROOT, "data", "kenya", "poverty_premium");
const jsonPath = path.join(outDir, `${month}.json`);
if (fs.existsSync(jsonPath) && !force) {
  console.log(`${path.relative(ROOT, jsonPath)} already exists; kept (use --force to correct it).`);
  process.exit(0);
}

const file = buildPremium(inputs, { month, generatedAt: new Date().toISOString().replace(/\.\d{3}Z$/, "Z") });
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(jsonPath, JSON.stringify(file, null, 1) + "\n");
fs.writeFileSync(path.join(outDir, `${month}.csv`), premiumCsv(file));

for (const l of file.lines) {
  if (l.status === "gap") console.log(`  ${l.need.padEnd(14)} ${l.title}: GAP`);
  else console.log(`  ${l.need.padEnd(14)} ${l.title}: ${l.currency} ${l.premium} (${l.low.rate}% vs ${l.best.rate}%)`);
}
console.log(`Wrote ${path.relative(ROOT, jsonPath)} and .csv`);
