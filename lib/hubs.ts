/**
 * The hub pages of the rebuild (docs/rebuild/phase-1-plan.md): Numbers and Compare gather the existing pages under
 * the new structure, organised by the question a reader brings rather than by dataset. Addresses of the linked pages
 * do not change in Phase 1. tests/site/test_hubs.py checks that every link here resolves to a page in app/.
 */

export type HubLink = { href: string; label: string; note: string };
export type HubSection = { id: string; question: string; intro: string; links: readonly HubLink[] };

export const numbersSections: readonly HubSection[] = [
  {
    id: "borrowing",
    question: "What does the government pay to borrow?",
    intro: "Treasury bill and bond auction results from the central banks, the day they publish, each linked to the notice.",
    links: [
      { href: "/markets/tbills", label: "Treasury bill rates, by market", note: "The latest bill auction in every market we cover" },
      { href: "/markets/bonds", label: "Government bond auctions", note: "Every bond sale, with the change against the last sale of the same tenor" },
      { href: "/markets/auction-week", label: "This week in African debt auctions", note: "What was sold, at what rate, and how much was bid" },
      { href: "/markets/kenya-bonds", label: "Kenya bonds and the yield curve", note: "Every Kenya bond auction since 2010" },
      { href: "/markets/bill-index", label: "Sovereign Bill Index", note: "One number for the cost of short-term government borrowing" },
      { href: "/markets/borrowing-costs", label: "Borrowing costs compared", note: "Local bills against dollar Eurobonds" },
      { href: "/markets/eurobonds", label: "Eurobond yields", note: "What governments pay to borrow in dollars" },
      { href: "/data/frontier-local-debt/monitor", label: "Local-Currency Debt Monitor", note: "The frontier local debt picture in one page" },
    ],
  },
  {
    id: "savings",
    question: "What do savings pay, after tax?",
    intro: "Rates a Kenyan saver can actually get, with withholding tax worked out.",
    links: [
      { href: "/rates/kenya", label: "Kenya savings and loan rates compared", note: "Banks, money market funds, SACCOs and T-bills side by side" },
      { href: "/rates/kenya/money-market-funds", label: "Money market fund yields", note: "Every fund's published yield" },
      { href: "/rates/kenya/best-money-market-fund", label: "Top money market fund by yield", note: "This month's ranking by yield, with the caveats" },
      { href: "/rates/kenya/saccos", label: "SACCO rates", note: "What SACCOs pay and charge" },
      { href: "/markets/kenya-tbills/auction", label: "Kenya T-bill auction: likely rates", note: "Our range for the next auction, and did your bid win" },
      { href: "/guides/where-your-shilling-earns-most", label: "Where your shilling earns most", note: "A guide, with the numbers kept current" },
      { href: "/rates/nigeria/savings-bond", label: "Nigeria savings bond", note: "The FGN savings bond rate each month" },
    ],
  },
  {
    id: "loans",
    question: "What does borrowing cost a household?",
    intro: "What loans cost households in Kenya, Nigeria and Ghana.",
    links: [
      { href: "/rates/kenya/mobile-loans", label: "Mobile loan costs", note: "What mobile lenders charge" },
      { href: "/rates/kenya/loan-apps", label: "Is this loan app licensed?", note: "Licensing status and what the apps charge" },
      { href: "/rates/kenya/check", label: "Is my rate fair? Kenya", note: "Your loan or deposit rate against the market" },
      { href: "/rates/nigeria/check", label: "Is my rate fair? Nigeria", note: "The same check for Nigeria" },
      { href: "/rates/ghana/check", label: "Is my rate fair? Ghana", note: "The same check for Ghana" },
      { href: "/rates/what-readers-paid", label: "What readers paid", note: "Prices and bank and SACCO rates, as readers report them" },
    ],
  },
  {
    id: "policy",
    question: "Where are central banks setting rates?",
    intro: "Policy rates as each central bank publishes them, against what its own one-year bill pays.",
    links: [{ href: "/rates/policy", label: "Policy rates across Africa", note: "The rate, the date, and the gap to the one-year bill" }],
  },
  {
    id: "currencies",
    question: "What is the shilling, naira or rand worth?",
    intro: "Daily reference rates against the US dollar, and what it costs to send money home.",
    links: [
      { href: "/markets", label: "African currencies", note: "Every currency against the dollar, today" },
      { href: "/markets/currencies/usd-kes", label: "US dollar to Kenya shilling", note: "History and the latest reference rate" },
      { href: "/rates/remittances", label: "The cost of sending money home", note: "Fees and exchange costs" },
    ],
  },
  {
    id: "economies",
    question: "How are African economies doing?",
    intro: "Inflation, growth, debt and reserves for all 54 countries, from the official series.",
    links: [
      { href: "/data/inflation", label: "Inflation", note: "The latest print for each country" },
      { href: "/data", label: "All indicators", note: "Growth, debt, reserves, trade and more, with history" },
      { href: "/countries", label: "Country files", note: "One page per country" },
      { href: "/east-africa", label: "East Africa rates today", note: "Kenya, Uganda, Tanzania and Rwanda together" },
    ],
  },
  {
    id: "data",
    question: "Can I take the data with me?",
    intro: "The latest 12 months are free as CSV and through the API; the full history comes with a key.",
    links: [
      { href: "/developers", label: "Open data API", note: "Endpoints and examples" },
      { href: "/data-api", label: "Licensed data API", note: "Full history, terms and prices" },
      { href: "/downloads", label: "Full-history downloads", note: "For key holders" },
      { href: "/status", label: "Data status", note: "When each source was last read" },
      { href: "/widgets", label: "Free widgets", note: "Embed a live rate on your own site" },
    ],
  },
];

export const compareSections: readonly HubSection[] = [
  {
    id: "savers",
    question: "Where does a saver get the most?",
    intro: "Peer tables for Kenyan savers, each from the providers' published rates.",
    links: [
      { href: "/registry", label: "Institutions registry", note: "Every licensed SACCO, microfinance bank and bank, as the regulators list them" },
      { href: "/rates/kenya/money-market-funds", label: "Money market funds", note: "Yields fund by fund" },
      { href: "/rates/kenya/saccos", label: "SACCOs", note: "What SACCOs pay and charge" },
      { href: "/rates/kenya", label: "Banks, funds, SACCOs and T-bills", note: "The four side by side" },
    ],
  },
  {
    id: "borrowers",
    question: "Which lenders cost the most?",
    intro: "Loan costs compared in the same units, a yearly rate.",
    links: [
      { href: "/rates/kenya/mobile-loans", label: "Mobile loans", note: "What mobile lenders charge" },
      { href: "/rates/kenya/loan-apps", label: "Loan apps", note: "Licensing status and what they charge" },
      { href: "/rates/what-readers-paid", label: "What readers paid", note: "Rates readers report" },
    ],
  },
  {
    id: "governments",
    question: "Which governments pay the most to borrow?",
    intro: "Markets compared on the same basis: the auction rate, the date and the source notice.",
    links: [
      { href: "/markets/tbills", label: "Treasury bills by market", note: "The latest bill auction in each market" },
      { href: "/markets/bonds", label: "Bond auctions by market", note: "Rates by tenor" },
      { href: "/markets/borrowing-costs", label: "Local bills against Eurobonds", note: "Local and dollar borrowing" },
      { href: "/rates/policy", label: "Policy rates", note: "Central bank rates and the one-year bill" },
    ],
  },
  {
    id: "senders",
    question: "Which way of sending money home is cheapest?",
    intro: "Ways of sending money home compared on what they cost.",
    links: [{ href: "/rates/remittances", label: "Remittance costs", note: "Fees and exchange costs" }],
  },
];

/** The pages folded into "For institutions" (rebuild brief, section 4), listed on that page. */
export const institutionSections: readonly HubLink[] = [
  { href: "/data/frontier-local-debt", label: "Local debt data", note: "Auction data for funds, banks and DFIs, with the free 30-day pilot" },
  { href: "/registry", label: "Institutions registry", note: "Every licensed SACCO, microfinance bank and bank, with the regulators' figures and a CSV" },
  { href: "/pricing", label: "Pricing", note: "Every plan and what it includes" },
  { href: "/licensing", label: "Licensing", note: "Licences, terms, and prices for local institutions" },
  { href: "/data-api", label: "Data API", note: "Endpoints, fields and terms" },
  { href: "/developers", label: "Developers", note: "The open API and examples" },
  { href: "/pack", label: "Committee pack", note: "A monthly, sourced pack for SACCO, insurer and pension committees" },
  { href: "/watch/sample", label: "Watch pack (sample)", note: "For a SACCO's board: the SACCO beside its SASRA tier and standards, every quarter" },
  { href: "/advisory", label: "Research and advisory", note: "Commissioned studies" },
  { href: "/buying", label: "Buying for an institution", note: "Procurement, invoices and vendor forms" },
  { href: "/advertise", label: "Advertise", note: "Reach our readers" },
  { href: "/trust", label: "Trust and data security", note: "How the data is collected, checked and kept" },
];
