import { countries } from "@/lib/demo/countries";

const SOURCE_URL = "https://open.er-api.com/v6/latest/USD";

const names: Record<string, string> = {
  USD: "US dollar",
  EUR: "Euro",
  GBP: "Pound sterling",
  CNY: "Yuan",
  AOA: "Angolan kwanza",
  BIF: "Burundi franc",
  BWP: "Botswana pula",
  CDF: "Congolese franc",
  CVE: "Cabo Verde escudo",
  DJF: "Djibouti franc",
  DZD: "Algerian dinar",
  EGP: "Egyptian pound",
  ERN: "Eritrean nakfa",
  ETB: "Ethiopian birr",
  GHS: "Ghanaian cedi",
  GMD: "Gambian dalasi",
  GNF: "Guinean franc",
  KES: "Kenya shilling",
  KMF: "Comorian franc",
  LRD: "Liberian dollar",
  LSL: "Lesotho loti",
  LYD: "Libyan dinar",
  MAD: "Moroccan dirham",
  MGA: "Malagasy ariary",
  MRU: "Mauritanian ouguiya",
  MUR: "Mauritian rupee",
  MWK: "Malawian kwacha",
  MZN: "Mozambican metical",
  NAD: "Namibian dollar",
  NGN: "Nigerian naira",
  RWF: "Rwandan franc",
  SCR: "Seychellois rupee",
  SDG: "Sudanese pound",
  SLE: "Sierra Leonean leone",
  SOS: "Somali shilling",
  SSP: "South Sudanese pound",
  STN: "São Tomé dobra",
  SZL: "Swazi lilangeni",
  TND: "Tunisian dinar",
  TZS: "Tanzanian shilling",
  UGX: "Ugandan shilling",
  XAF: "Central African CFA franc",
  XOF: "West African CFA franc",
  ZAR: "South African rand",
  ZMW: "Zambian kwacha",
  ZWG: "Zimbabwe gold",
};

const lead = ["USD", "EUR", "GBP", "CNY", "KES"];

export type FxQuote = {
  updated: string;
  sourceUrl: string;
  sourceName: string;
  rates: Record<string, number>;
  codes: { code: string; name: string }[];
};

function wantedCodes() {
  const african = [...new Set(countries.map((country) => country.currency))].sort();
  return [...lead, ...african.filter((code) => !lead.includes(code))];
}

/** Daily mid-market reference. A missing or non-finite rate is dropped. */
export async function loadFxQuote(): Promise<FxQuote | null> {
  try {
    const response = await fetch(SOURCE_URL, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12000),
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const body = (await response.json()) as {
      result?: string;
      base_code?: string;
      time_last_update_utc?: string;
      rates?: Record<string, unknown>;
    };
    if (body.result !== "success" || body.base_code !== "USD" || !body.rates) return null;
    if (!body.time_last_update_utc) return null;

    const rates: Record<string, number> = { USD: 1 };
    for (const code of wantedCodes()) {
      if (code === "USD") continue;
      const value = body.rates[code];
      if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) continue;
      rates[code] = value;
    }

    const codes = wantedCodes()
      .filter((code) => rates[code] != null)
      .map((code) => ({ code, name: names[code] ?? code }));

    if (!rates.KES || !rates.EUR) return null;

    return {
      updated: body.time_last_update_utc,
      sourceUrl: SOURCE_URL,
      sourceName: "ExchangeRate-API",
      rates,
      codes,
    };
  } catch {
    return null;
  }
}

export function formatFx(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: value >= 20 ? 2 : 4,
  }).format(value);
}

/** USD/KES means units of KES per one US dollar. */
export function fxForLabel(label: string, quote: FxQuote | null) {
  if (!quote || !label.startsWith("USD/")) return null;
  const value = quote.rates[label.slice(4)];
  if (value == null) return null;
  return formatFx(value);
}

export function convertAmount(amount: number, from: string, to: string, rates: Record<string, number>) {
  if (!Number.isFinite(amount)) return null;
  const fromRate = rates[from];
  const toRate = rates[to];
  if (fromRate == null || toRate == null) return null;
  return (amount / fromRate) * toRate;
}
