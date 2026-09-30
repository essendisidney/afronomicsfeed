import type { CountryProfile } from "./countries";

/** Primary publishers per country: central banks, statistics offices, exchanges, regulators. */
export type OfficialSource = { label: string; name: string; href: string; kind: "Central bank" | "Statistics" | "Exchange" | "Treasury" | "Regulator" };

const directory: Record<string, OfficialSource[]> = {
  KE: [
    { label: "CBK", name: "Central Bank of Kenya", href: "https://www.centralbank.go.ke/", kind: "Central bank" },
    { label: "KNBS", name: "Kenya National Bureau of Statistics", href: "https://www.knbs.or.ke/", kind: "Statistics" },
    { label: "NSE", name: "Nairobi Securities Exchange", href: "https://www.nse.co.ke/", kind: "Exchange" },
    { label: "Treasury", name: "The National Treasury", href: "https://www.treasury.go.ke/", kind: "Treasury" },
    { label: "CMA", name: "Capital Markets Authority", href: "https://www.cma.or.ke/", kind: "Regulator" },
    { label: "SASRA", name: "Sacco Societies Regulatory Authority", href: "https://www.sasra.go.ke/", kind: "Regulator" },
    { label: "IRA", name: "Insurance Regulatory Authority", href: "https://www.ira.go.ke/", kind: "Regulator" },
  ],
  NG: [
    { label: "CBN", name: "Central Bank of Nigeria", href: "https://www.cbn.gov.ng/", kind: "Central bank" },
    { label: "NBS", name: "National Bureau of Statistics", href: "https://nigerianstat.gov.ng/", kind: "Statistics" },
    { label: "NGX", name: "Nigerian Exchange Group", href: "https://ngxgroup.com/", kind: "Exchange" },
    { label: "SEC", name: "Securities and Exchange Commission Nigeria", href: "https://sec.gov.ng/", kind: "Regulator" },
  ],
  ZA: [
    { label: "SARB", name: "South African Reserve Bank", href: "https://www.resbank.co.za/", kind: "Central bank" },
    { label: "Stats SA", name: "Statistics South Africa", href: "https://www.statssa.gov.za/", kind: "Statistics" },
    { label: "JSE", name: "Johannesburg Stock Exchange", href: "https://www.jse.co.za/", kind: "Exchange" },
    { label: "Treasury", name: "National Treasury", href: "https://www.treasury.gov.za/", kind: "Treasury" },
  ],
  EG: [
    { label: "CBE", name: "Central Bank of Egypt", href: "https://www.cbe.org.eg/", kind: "Central bank" },
    { label: "CAPMAS", name: "Central Agency for Public Mobilization and Statistics", href: "https://www.capmas.gov.eg/", kind: "Statistics" },
    { label: "EGX", name: "The Egyptian Exchange", href: "https://www.egx.com.eg/", kind: "Exchange" },
  ],
  GH: [
    { label: "BoG", name: "Bank of Ghana", href: "https://www.bog.gov.gh/", kind: "Central bank" },
    { label: "GSS", name: "Ghana Statistical Service", href: "https://statsghana.gov.gh/", kind: "Statistics" },
    { label: "GSE", name: "Ghana Stock Exchange", href: "https://gse.com.gh/", kind: "Exchange" },
  ],
  ET: [
    { label: "NBE", name: "National Bank of Ethiopia", href: "https://nbe.gov.et/", kind: "Central bank" },
    { label: "ESS", name: "Ethiopian Statistics Service", href: "https://www.statsethiopia.gov.et/", kind: "Statistics" },
  ],
  TZ: [
    { label: "BoT", name: "Bank of Tanzania", href: "https://www.bot.go.tz/", kind: "Central bank" },
    { label: "NBS", name: "National Bureau of Statistics", href: "https://www.nbs.go.tz/", kind: "Statistics" },
    { label: "DSE", name: "Dar es Salaam Stock Exchange", href: "https://www.dse.co.tz/", kind: "Exchange" },
  ],
  UG: [
    { label: "BoU", name: "Bank of Uganda", href: "https://www.bou.or.ug/", kind: "Central bank" },
    { label: "UBOS", name: "Uganda Bureau of Statistics", href: "https://www.ubos.org/", kind: "Statistics" },
    { label: "USE", name: "Uganda Securities Exchange", href: "https://www.use.or.ug/", kind: "Exchange" },
  ],
  RW: [
    { label: "BNR", name: "National Bank of Rwanda", href: "https://www.bnr.rw/", kind: "Central bank" },
    { label: "NISR", name: "National Institute of Statistics of Rwanda", href: "https://www.statistics.gov.rw/", kind: "Statistics" },
  ],
  MA: [
    { label: "BAM", name: "Bank Al-Maghrib", href: "https://www.bkam.ma/", kind: "Central bank" },
    { label: "HCP", name: "Haut-Commissariat au Plan", href: "https://www.hcp.ma/", kind: "Statistics" },
    { label: "CSE", name: "Casablanca Stock Exchange", href: "https://www.casablanca-bourse.com/", kind: "Exchange" },
  ],
  CI: [{ label: "BCEAO", name: "Central Bank of West African States", href: "https://www.bceao.int/", kind: "Central bank" }, { label: "BRVM", name: "Bourse Régionale des Valeurs Mobilières", href: "https://www.brvm.org/", kind: "Exchange" }],
  ZM: [{ label: "BoZ", name: "Bank of Zambia", href: "https://www.boz.zm/", kind: "Central bank" }, { label: "ZamStats", name: "Zambia Statistics Agency", href: "https://www.zamstats.gov.zm/", kind: "Statistics" }],
  BW: [{ label: "BoB", name: "Bank of Botswana", href: "https://www.bankofbotswana.bw/", kind: "Central bank" }],
  MU: [{ label: "BoM", name: "Bank of Mauritius", href: "https://www.bom.mu/", kind: "Central bank" }],
  NA: [{ label: "BoN", name: "Bank of Namibia", href: "https://www.bon.com.na/", kind: "Central bank" }],
  TN: [{ label: "BCT", name: "Banque Centrale de Tunisie", href: "https://www.bct.gov.tn/", kind: "Central bank" }],
};

const XOF = new Set(["BJ", "BF", "CI", "GW", "ML", "NE", "SN", "TG"]);
const XAF = new Set(["CM", "CF", "TD", "CG", "GQ", "GA"]);

export function officialSources(country: CountryProfile): OfficialSource[] {
  const list = [...(directory[country.iso] ?? [])];
  if (list.length === 0 && country.tape) {
    list.push({ label: country.tape.label, name: country.tape.label, href: country.tape.href, kind: "Central bank" });
  }
  if (XOF.has(country.iso) && !list.some((item) => item.label === "BCEAO")) {
    list.push({ label: "BCEAO", name: "Central Bank of West African States", href: "https://www.bceao.int/", kind: "Central bank" });
  }
  if (XAF.has(country.iso)) {
    list.push({ label: "BEAC", name: "Bank of Central African States", href: "https://www.beac.int/", kind: "Central bank" });
  }
  return list;
}
