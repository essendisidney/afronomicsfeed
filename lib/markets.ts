import { site } from "./site";

export type MarketPrint = {
  label: string;
  value: string;
  asOf: string;
  example: true;
  href?: string;
};

/** Static placeholders only. Never scrape or imply a live NSE feed. */
export const marketStrip: MarketPrint[] = [
  {
    label: "NSE 20",
    value: "1,842.10",
    asOf: "2026-09-10T08:00:00+03:00",
    example: true,
    href: site.nseTapeUrl,
  },
  {
    label: "USD / KES",
    value: "129.45",
    asOf: "2026-09-10T08:00:00+03:00",
    example: true,
    href: site.cbkUrl,
  },
  {
    label: "91-day T-bill",
    value: "8.20%",
    asOf: "2026-09-10T08:00:00+03:00",
    example: true,
    href: "https://www.centralbank.go.ke/bills-bonds/treasury-bills/",
  },
];
