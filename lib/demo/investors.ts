import { capitalBookByName, capitalFileHref, capitalRows } from "./capital";

export const investors = [
  {
    slug: "example-dfi-a",
    name: "EXAMPLE DFI A",
    kind: "DFI",
    example: true as const,
    lede: "Demonstration DFI name — not a real institution.",
    note: "Demonstration name — not a real institution.",
    rowId: "demo-1",
  },
  {
    slug: "example-fund-b",
    name: "EXAMPLE FUND B",
    kind: "Fund",
    example: true as const,
    lede: "Demonstration fund name — not a real fund.",
    note: "Demonstration name — not a real fund.",
    rowId: "demo-2",
  },
  {
    slug: "example-bank-c",
    name: "EXAMPLE BANK C",
    kind: "Bank",
    example: true as const,
    lede: "Demonstration bank name — not a real lender.",
    note: "Demonstration name — not a real lender.",
    rowId: "demo-3",
  },
] as const;

export function getInvestor(slug: string) {
  return investors.find((item) => item.slug === slug);
}

export function investorTickets(slug: string) {
  const investor = getInvestor(slug);
  if (!investor) return [];
  return capitalRows.filter((row) => row.id === investor.rowId);
}

export function investorTicketHref(row: (typeof capitalRows)[number]) {
  const book = capitalBookByName(row.type);
  return book ? capitalFileHref(book.slug, row.countrySlug) : "/capital";
}

export function investorFileHref(slug: string) {
  return `/investors/${slug}`;
}
