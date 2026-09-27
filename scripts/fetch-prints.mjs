import fs from "node:fs";

const countries = [
  ["algeria", "Algeria", "DZ"],
  ["angola", "Angola", "AO"],
  ["benin", "Benin", "BJ"],
  ["botswana", "Botswana", "BW"],
  ["burkina-faso", "Burkina Faso", "BF"],
  ["burundi", "Burundi", "BI"],
  ["cabo-verde", "Cabo Verde", "CV"],
  ["cameroon", "Cameroon", "CM"],
  ["central-african-republic", "Central African Republic", "CF"],
  ["chad", "Chad", "TD"],
  ["comoros", "Comoros", "KM"],
  ["congo", "Congo", "CG"],
  ["cote-divoire", "Côte d’Ivoire", "CI"],
  ["djibouti", "Djibouti", "DJ"],
  ["dr-congo", "DR Congo", "CD"],
  ["egypt", "Egypt", "EG"],
  ["equatorial-guinea", "Equatorial Guinea", "GQ"],
  ["eritrea", "Eritrea", "ER"],
  ["eswatini", "Eswatini", "SZ"],
  ["ethiopia", "Ethiopia", "ET"],
  ["gabon", "Gabon", "GA"],
  ["gambia", "Gambia", "GM"],
  ["ghana", "Ghana", "GH"],
  ["guinea", "Guinea", "GN"],
  ["guinea-bissau", "Guinea-Bissau", "GW"],
  ["kenya", "Kenya", "KE"],
  ["lesotho", "Lesotho", "LS"],
  ["liberia", "Liberia", "LR"],
  ["libya", "Libya", "LY"],
  ["madagascar", "Madagascar", "MG"],
  ["malawi", "Malawi", "MW"],
  ["mali", "Mali", "ML"],
  ["mauritania", "Mauritania", "MR"],
  ["mauritius", "Mauritius", "MU"],
  ["morocco", "Morocco", "MA"],
  ["mozambique", "Mozambique", "MZ"],
  ["namibia", "Namibia", "NA"],
  ["niger", "Niger", "NE"],
  ["nigeria", "Nigeria", "NG"],
  ["rwanda", "Rwanda", "RW"],
  ["sao-tome-and-principe", "São Tomé and Príncipe", "ST"],
  ["senegal", "Senegal", "SN"],
  ["seychelles", "Seychelles", "SC"],
  ["sierra-leone", "Sierra Leone", "SL"],
  ["somalia", "Somalia", "SO"],
  ["south-africa", "South Africa", "ZA"],
  ["south-sudan", "South Sudan", "SS"],
  ["sudan", "Sudan", "SD"],
  ["tanzania", "Tanzania", "TZ"],
  ["togo", "Togo", "TG"],
  ["tunisia", "Tunisia", "TN"],
  ["uganda", "Uganda", "UG"],
  ["zambia", "Zambia", "ZM"],
  ["zimbabwe", "Zimbabwe", "ZW"],
];

const byIso = new Map(countries.map(([slug, name, iso]) => [iso, { slug, name, iso }]));
const series = [
  ["inflation", "FP.CPI.TOTL.ZG"],
  ["gdp", "NY.GDP.MKTP.CD"],
  ["fdi", "BX.KLT.DINV.CD.WD"],
  ["public-debt", "GC.DOD.TOTL.GD.ZS"],
];

function parse(body, indicatorSlug, code) {
  if (!Array.isArray(body) || !Array.isArray(body[1])) return [];
  const prints = [];
  for (const row of body[1]) {
    if (typeof row.value !== "number" || !Number.isFinite(row.value)) continue;
    if (!row.date || !/^\d{4}$/.test(row.date)) continue;
    const iso = row.country?.id?.toUpperCase();
    const country = iso ? byIso.get(iso) : undefined;
    if (!country) continue;
    const seriesName = row.indicator?.value?.trim() || code;
    const unitMatch = seriesName.match(/\(([^)]+)\)\s*$/);
    prints.push({
      indicatorSlug,
      countrySlug: country.slug,
      countryName: country.name,
      iso,
      year: row.date,
      observationDate: `${row.date}-01-01`,
      value: row.value,
      unit: unitMatch?.[1] ?? seriesName,
      seriesCode: code,
      seriesName,
    });
  }
  return prints;
}

async function fetchOne(iso, indicatorSlug, code) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 12000);
  try {
    const url = `https://api.worldbank.org/v2/country/${iso}/indicator/${code}?format=json&mrnev=1`;
    const response = await fetch(url, { signal: ac.signal, headers: { Accept: "application/json" } });
    if (!response.ok) return [];
    return parse(await response.json(), indicatorSlug, code);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

const jobs = countries.flatMap(([, , iso]) => series.map(([indicatorSlug, code]) => ({ iso, indicatorSlug, code })));
const collected = [];
for (let index = 0; index < jobs.length; index += 8) {
  const slice = jobs.slice(index, index + 8);
  const batches = await Promise.all(slice.map((job) => fetchOne(job.iso, job.indicatorSlug, job.code)));
  collected.push(...batches.flat());
}

const best = new Map();
for (const print of collected) {
  const key = `${print.indicatorSlug}|${print.iso}`;
  const current = best.get(key);
  if (!current || print.year > current.year) best.set(key, print);
}
const prints = [...best.values()];

fs.writeFileSync(new URL("./prints.json", import.meta.url), JSON.stringify(prints));
console.log(JSON.stringify({
  prints: prints.length,
  kenya: prints.filter((print) => print.iso === "KE"),
}));
process.exit(0);
