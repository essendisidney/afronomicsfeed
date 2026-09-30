/**
 * The Afronomics indicator catalogue.
 *
 * Every series here is pulled from a named primary publisher and shown with its
 * code, year and source link. Nothing on the site is typed in by hand.
 */

export type Desk = "economy" | "debt" | "capital" | "trade" | "technology" | "climate";

export type IndicatorFormat = "usd" | "percent" | "number" | "months" | "per100" | "rate";

export type IndicatorDef = {
  slug: string;
  code: string;
  label: string;
  short: string;
  desk: Desk;
  format: IndicatorFormat;
  unit: string;
  /** true when a higher reading is usually read as better; drives colour of movers only. */
  higherIsBetter: boolean | null;
  /** Whether values can be summed into a continental total. */
  summable?: boolean;
  about: string;
};

export const indicatorDefs: IndicatorDef[] = [
  {
    slug: "gdp",
    code: "NY.GDP.MKTP.CD",
    label: "GDP (current US$)",
    short: "GDP",
    desk: "economy",
    format: "usd",
    unit: "current US$",
    higherIsBetter: true,
    summable: true,
    about: "Gross domestic product at purchaser prices, converted at current exchange rates.",
  },
  {
    slug: "gdp-growth",
    code: "NY.GDP.MKTP.KD.ZG",
    label: "Real GDP growth (annual %)",
    short: "GDP growth",
    desk: "economy",
    format: "percent",
    unit: "annual %",
    higherIsBetter: true,
    about: "Annual percentage growth of GDP at market prices in constant local currency.",
  },
  {
    slug: "gdp-per-capita",
    code: "NY.GDP.PCAP.CD",
    label: "GDP per capita (current US$)",
    short: "GDP per capita",
    desk: "economy",
    format: "usd",
    unit: "current US$",
    higherIsBetter: true,
    about: "GDP divided by midyear population.",
  },
  {
    slug: "inflation",
    code: "FP.CPI.TOTL.ZG",
    label: "Inflation, consumer prices (annual %)",
    short: "Inflation",
    desk: "economy",
    format: "percent",
    unit: "annual %",
    higherIsBetter: false,
    about: "Annual change in the cost to the average consumer of a basket of goods and services.",
  },
  {
    slug: "unemployment",
    code: "SL.UEM.TOTL.ZS",
    label: "Unemployment (% of labour force, ILO modelled)",
    short: "Unemployment",
    desk: "economy",
    format: "percent",
    unit: "% of labour force",
    higherIsBetter: false,
    about: "Share of the labour force without work but available for and seeking employment. ILO modelled estimate.",
  },
  {
    slug: "population",
    code: "SP.POP.TOTL",
    label: "Population, total",
    short: "Population",
    desk: "economy",
    format: "number",
    unit: "people",
    higherIsBetter: null,
    summable: true,
    about: "All residents regardless of legal status or citizenship, midyear estimate.",
  },
  {
    slug: "agriculture",
    code: "NV.AGR.TOTL.ZS",
    label: "Agriculture, forestry and fishing (% of GDP)",
    short: "Agriculture share",
    desk: "economy",
    format: "percent",
    unit: "% of GDP",
    higherIsBetter: null,
    about: "Value added by agriculture, forestry and fishing as a share of GDP.",
  },
  {
    slug: "public-debt",
    code: "GC.DOD.TOTL.GD.ZS",
    label: "Central government debt (% of GDP)",
    short: "Government debt",
    desk: "debt",
    format: "percent",
    unit: "% of GDP",
    higherIsBetter: false,
    about: "Gross central government debt. Coverage is uneven across the continent; a blank means the publisher has no value.",
  },
  {
    slug: "external-debt",
    code: "DT.DOD.DECT.GN.ZS",
    label: "External debt stocks (% of GNI)",
    short: "External debt",
    desk: "debt",
    format: "percent",
    unit: "% of GNI",
    higherIsBetter: false,
    about: "Total external debt owed to non-residents, as a share of gross national income.",
  },
  {
    slug: "debt-service",
    code: "DT.TDS.DECT.EX.ZS",
    label: "Total debt service (% of exports and primary income)",
    short: "Debt service",
    desk: "debt",
    format: "percent",
    unit: "% of exports",
    higherIsBetter: false,
    about: "Principal and interest paid on external debt as a share of exports of goods, services and primary income.",
  },
  {
    slug: "reserves",
    code: "FI.RES.TOTL.MO",
    label: "Total reserves (months of imports)",
    short: "Import cover",
    desk: "debt",
    format: "months",
    unit: "months of imports",
    higherIsBetter: true,
    about: "Holdings of monetary gold, SDRs, IMF reserve position and foreign exchange, in months of imports.",
  },
  {
    slug: "lending-rate",
    code: "FR.INR.LEND",
    label: "Lending interest rate (%)",
    short: "Lending rate",
    desk: "debt",
    format: "percent",
    unit: "%",
    higherIsBetter: false,
    about: "Rate charged by banks on loans to the private sector, as reported by the national authority.",
  },
  {
    slug: "private-credit",
    code: "FS.AST.PRVT.GD.ZS",
    label: "Domestic credit to private sector (% of GDP)",
    short: "Private credit",
    desk: "debt",
    format: "percent",
    unit: "% of GDP",
    higherIsBetter: true,
    about: "Financial resources provided to the private sector by financial corporations.",
  },
  {
    slug: "fx-official",
    code: "PA.NUS.FCRF",
    label: "Official exchange rate (LCU per US$, period average)",
    short: "FX (annual avg)",
    desk: "debt",
    format: "rate",
    unit: "LCU per US$",
    higherIsBetter: null,
    about: "Annual average of the exchange rate determined by national authorities or the legally sanctioned market.",
  },
  {
    slug: "fdi",
    code: "BX.KLT.DINV.CD.WD",
    label: "Foreign direct investment, net inflows (US$)",
    short: "FDI inflows",
    desk: "capital",
    format: "usd",
    unit: "BoP, current US$",
    higherIsBetter: true,
    summable: true,
    about: "Net inflows of investment to acquire a lasting management interest (10% or more of voting stock).",
  },
  {
    slug: "remittances",
    code: "BX.TRF.PWKR.CD.DT",
    label: "Personal remittances received (US$)",
    short: "Remittances",
    desk: "capital",
    format: "usd",
    unit: "current US$",
    higherIsBetter: true,
    summable: true,
    about: "Personal transfers and compensation of employees received from non-residents.",
  },
  {
    slug: "exports",
    code: "NE.EXP.GNFS.ZS",
    label: "Exports of goods and services (% of GDP)",
    short: "Exports",
    desk: "trade",
    format: "percent",
    unit: "% of GDP",
    higherIsBetter: true,
    about: "Value of all goods and market services provided to the rest of the world.",
  },
  {
    slug: "current-account",
    code: "BN.CAB.XOKA.GD.ZS",
    label: "Current account balance (% of GDP)",
    short: "Current account",
    desk: "trade",
    format: "percent",
    unit: "% of GDP",
    higherIsBetter: true,
    about: "Sum of net exports of goods and services, net primary income and net secondary income.",
  },
  {
    slug: "internet",
    code: "IT.NET.USER.ZS",
    label: "Individuals using the internet (% of population)",
    short: "Internet use",
    desk: "technology",
    format: "percent",
    unit: "% of population",
    higherIsBetter: true,
    about: "Share of the population that used the internet in the last three months (ITU).",
  },
  {
    slug: "mobile",
    code: "IT.CEL.SETS.P2",
    label: "Mobile cellular subscriptions (per 100 people)",
    short: "Mobile subscriptions",
    desk: "technology",
    format: "per100",
    unit: "per 100 people",
    higherIsBetter: true,
    about: "Subscriptions to a public mobile telephone service (ITU).",
  },
  {
    slug: "electricity",
    code: "EG.ELC.ACCS.ZS",
    label: "Access to electricity (% of population)",
    short: "Electricity access",
    desk: "climate",
    format: "percent",
    unit: "% of population",
    higherIsBetter: true,
    about: "Share of the population with access to electricity (SDG 7.1.1).",
  },
  {
    slug: "renewables",
    code: "EG.FEC.RNEW.ZS",
    label: "Renewable energy consumption (% of final energy)",
    short: "Renewable share",
    desk: "climate",
    format: "percent",
    unit: "% of final energy",
    higherIsBetter: true,
    about: "Share of renewable energy in total final energy consumption (SDG 7.2.1).",
  },
];

export const deskLabels: Record<Desk, string> = {
  economy: "Economy",
  debt: "Debt, rates and money",
  capital: "Capital flows",
  trade: "Trade",
  technology: "Technology",
  climate: "Climate and energy",
};

export function getIndicatorDef(slug: string) {
  return indicatorDefs.find((item) => item.slug === slug);
}

export function indicatorsForDesk(desk: Desk) {
  return indicatorDefs.filter((item) => item.desk === desk);
}

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const twoDp = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Display a value in the indicator's native unit. */
export function formatValue(def: Pick<IndicatorDef, "format">, value: number): string {
  switch (def.format) {
    case "usd":
      return `$${compact.format(value)}`;
    case "percent":
      return `${twoDp.format(value)}%`;
    case "months":
      return `${twoDp.format(value)} mo`;
    case "per100":
      return grouped.format(value);
    case "rate":
      return value >= 100 ? grouped.format(value) : twoDp.format(value);
    case "number":
    default:
      return compact.format(value);
  }
}

/** Display a change between two readings: percentage points for shares, % for levels. */
export function formatChange(def: Pick<IndicatorDef, "format">, from: number, to: number): string {
  if (def.format === "percent") {
    const delta = to - from;
    return `${delta >= 0 ? "+" : "−"}${twoDp.format(Math.abs(delta))} pts`;
  }
  if (def.format === "months") {
    const delta = to - from;
    return `${delta >= 0 ? "+" : "−"}${twoDp.format(Math.abs(delta))} mo`;
  }
  if (from === 0) return "—";
  const pct = ((to - from) / Math.abs(from)) * 100;
  return `${pct >= 0 ? "+" : "−"}${twoDp.format(Math.abs(pct))}%`;
}
