export type OfficialSource = {
  slug: string;
  label: string;
  kind: "central-bank" | "exchange" | "treasury" | "regulator" | "stats" | "dfi" | "port";
  countrySlug: string | null;
  href: string;
  status: "linked" | "pending";
  note: string;
};

/** Official doors the desk may cite. Pending = URL known, verification not filed. */
export const officialSources: OfficialSource[] = [
  {
    slug: "cbk",
    label: "Central Bank of Kenya",
    kind: "central-bank",
    countrySlug: "kenya",
    href: "https://www.centralbank.go.ke/",
    status: "linked",
    note: "Policy rate and FX window. Source of record for Kenya tape.",
  },
  {
    slug: "nse",
    label: "Nairobi Securities Exchange",
    kind: "exchange",
    countrySlug: "kenya",
    href: "https://www.nse.co.ke/",
    status: "linked",
    note: "Official issuer window. Afronomics does not mirror the tape.",
  },
  {
    slug: "cbn",
    label: "Central Bank of Nigeria",
    kind: "central-bank",
    countrySlug: "nigeria",
    href: "https://www.cbn.gov.ng/",
    status: "linked",
    note: "MPC and FX circulars. Prints stay blank until cited.",
  },
  {
    slug: "ngx",
    label: "Nigerian Exchange Group",
    kind: "exchange",
    countrySlug: "nigeria",
    href: "https://ngxgroup.com/",
    status: "linked",
    note: "Issuer notices only through the official door.",
  },
  {
    slug: "sarb",
    label: "South African Reserve Bank",
    kind: "central-bank",
    countrySlug: "south-africa",
    href: "https://www.resbank.co.za/",
    status: "linked",
    note: "Monetary policy and banking supervision door.",
  },
  {
    slug: "jse",
    label: "Johannesburg Stock Exchange",
    kind: "exchange",
    countrySlug: "south-africa",
    href: "https://www.jse.co.za/",
    status: "linked",
    note: "Listed issuer window.",
  },
  {
    slug: "cbe",
    label: "Central Bank of Egypt",
    kind: "central-bank",
    countrySlug: "egypt",
    href: "https://www.cbe.org.eg/",
    status: "linked",
    note: "Policy and FX door for Egypt desk.",
  },
  {
    slug: "egx",
    label: "Egyptian Exchange",
    kind: "exchange",
    countrySlug: "egypt",
    href: "https://www.egx.com.eg/",
    status: "linked",
    note: "EGX 30 and issuer notices.",
  },
  {
    slug: "bog",
    label: "Bank of Ghana",
    kind: "central-bank",
    countrySlug: "ghana",
    href: "https://www.bog.gov.gh/",
    status: "linked",
    note: "GHS and MPC door.",
  },
  {
    slug: "gse",
    label: "Ghana Stock Exchange",
    kind: "exchange",
    countrySlug: "ghana",
    href: "https://gse.com.gh/",
    status: "linked",
    note: "GSE CI and issuer window.",
  },
  {
    slug: "bnr",
    label: "National Bank of Rwanda",
    kind: "central-bank",
    countrySlug: "rwanda",
    href: "https://www.bnr.rw/",
    status: "linked",
    note: "RWF and supervision door.",
  },
  {
    slug: "bou",
    label: "Bank of Uganda",
    kind: "central-bank",
    countrySlug: "uganda",
    href: "https://www.bou.or.ug/",
    status: "linked",
    note: "UGX and MPC door for Uganda desk.",
  },
  {
    slug: "bot",
    label: "Bank of Tanzania",
    kind: "central-bank",
    countrySlug: "tanzania",
    href: "https://www.bot.go.tz/",
    status: "linked",
    note: "TZS and supervision door for Tanzania desk.",
  },
  {
    slug: "afdb",
    label: "African Development Bank",
    kind: "dfi",
    countrySlug: null,
    href: "https://www.afdb.org/",
    status: "pending",
    note: "Climate and capital books cite AfDB only after a project ticket is filed.",
  },
  {
    slug: "knbs",
    label: "Kenya National Bureau of Statistics",
    kind: "stats",
    countrySlug: "kenya",
    href: "https://www.knbs.or.ke/",
    status: "pending",
    note: "Macro series slots. No modelled headline GDP.",
  },
];

export function getOfficialSource(slug: string) {
  return officialSources.find((item) => item.slug === slug);
}

export function linkedSourceCount() {
  return officialSources.filter((item) => item.status === "linked").length;
}

export function sourcesForCountry(countrySlug: string) {
  return officialSources.filter((item) => item.countrySlug === countrySlug);
}
