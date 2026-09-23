export type RegulatoryRow = {
  date: string;
  authority: string;
  instrument: string;
  subject: string;
  status: string;
  sourceUrl: string;
  example: true;
};

export type BankRow = {
  issuer: string;
  ticker: string;
  filing: string;
  periodEnd: string;
  note: string;
  example: true;
};

export type DebtRow = {
  weekOf: string;
  instrument: string;
  event: string;
  sourceHint: string;
  example: true;
};

export const regulatoryRows: RegulatoryRow[] = [
  {
    date: "2026-09-04",
    authority: "CBK",
    instrument: "Circular (EXAMPLE)",
    subject: "Liquidity reporting — illustrative row",
    status: "Open",
    sourceUrl: "https://www.centralbank.go.ke/",
    example: true,
  },
  {
    date: "2026-09-02",
    authority: "CMA",
    instrument: "Public notice (EXAMPLE)",
    subject: "Disclosure timetable reminder — illustrative row",
    status: "Published",
    sourceUrl: "https://www.cma.or.ke/",
    example: true,
  },
  {
    date: "2026-08-27",
    authority: "SASRA",
    instrument: "Sector communication (EXAMPLE)",
    subject: "Deposit-taking sacco filing window — illustrative row",
    status: "Watch",
    sourceUrl: "https://www.sasra.go.ke/",
    example: true,
  },
  {
    date: "2026-08-21",
    authority: "IRA",
    instrument: "Guidance (EXAMPLE)",
    subject: "Conduct reporting — illustrative row",
    status: "Open",
    sourceUrl: "https://www.ira.go.ke/",
    example: true,
  },
];

export const bankRows: BankRow[] = [
  {
    issuer: "EXAMPLE Bank A",
    ticker: "EXA",
    filing: "Unaudited H1 statement (EXAMPLE)",
    periodEnd: "2026-06-30",
    note: "Format row only — not a real issuer print.",
    example: true,
  },
  {
    issuer: "EXAMPLE Bank B",
    ticker: "EXB",
    filing: "NSE announcement (EXAMPLE)",
    periodEnd: "2026-06-30",
    note: "Capital note placeholder — do not file as fact.",
    example: true,
  },
  {
    issuer: "EXAMPLE Bank C",
    ticker: "EXC",
    filing: "Annual report extract (EXAMPLE)",
    periodEnd: "2025-12-31",
    note: "Credit-quality columns reserved for cited statements.",
    example: true,
  },
];

export const debtRows: DebtRow[] = [
  {
    weekOf: "2026-09-07",
    instrument: "91 / 182 / 364-day T-bills (EXAMPLE)",
    event: "Illustrative auction week — not the official calendar",
    sourceHint: "Use CBK Treasury bills pages for the real notice",
    example: true,
  },
  {
    weekOf: "2026-09-14",
    instrument: "Treasury bond tap (EXAMPLE)",
    event: "Placeholder tap window",
    sourceHint: "Confirm on centralbank.go.ke and treasury.go.ke",
    example: true,
  },
  {
    weekOf: "2026-09-21",
    instrument: "91 / 182 / 364-day T-bills (EXAMPLE)",
    event: "Illustrative auction week",
    sourceHint: "Results exist only after CBK publishes them",
    example: true,
  },
];
