import Link from "next/link";
import { issuerSlug, issuersOf } from "@/components/bonds/stats";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { bondMarkets, loadBondMarket } from "@/lib/data/sovereign-bonds";
import { billPagePath } from "@/lib/seo/schema";

type Item = { href: string; label: string; note: string };

/**
 * The auction pages for one country (its Treasury bills, its bonds, or its WAEMU issuer page), computed from the
 * market lists so a country only gets a link once its data exists. Matching is by country name, then by slug.
 */
export function countryDebtLinks(countryName: string): Item[] {
  const key = issuerSlug(countryName);
  const out: Item[] = [];
  const bill = billMarkets.find((m) => issuerSlug(m.country) === key);
  if (bill && loadBillMarket(bill.slug).rows.length) {
    out.push({ href: billPagePath(bill.slug), label: `${bill.country} Treasury bill rates`, note: "91, 182 and 364 days, every auction" });
  }
  const bond = bondMarkets.find((m) => m.slug !== "waemu" && issuerSlug(m.country) === key);
  if (bond && loadBondMarket(bond.slug).rows.length) {
    out.push({ href: bond.slug === "kenya" ? "/markets/kenya-bonds" : `/markets/bonds/${bond.slug}`, label: `${bond.country} bond auction results`, note: "Rates, bid cover and amounts by bond" });
  }
  const waemu = issuersOf(loadBondMarket("waemu").rows).find((i) => i.slug === key);
  if (waemu) {
    out.push({ href: `/markets/bonds/waemu/${waemu.slug}`, label: `${waemu.name} bond and bill auctions`, note: "UMOA-Titres results, WAEMU regional market" });
  }
  return out;
}

const core: Item[] = [
  { href: "/markets/bonds", label: "African government bond auctions", note: "Every market we cover, latest results" },
  { href: "/markets/tbills", label: "Africa T-bill monitor", note: "Ten markets side by side" },
  { href: "/data/frontier-local-debt", label: "Frontier local-debt dataset", note: "Every auction, CSV and API, for institutions" },
];

/**
 * "Auction data" link block for market and rate pages: the country's own bill and bond pages first, then the bond
 * hub, the T-bill monitor and the frontier local-debt dataset. Skips the page it sits on.
 */
export function DebtDataLinks({ country, current, title = "Auction data" }: { country?: string; current?: string; title?: string }) {
  const items = [...(country ? countryDebtLinks(country) : []), ...core].filter(
    (item, i, all) => item.href !== current && all.findIndex((x) => x.href === item.href) === i,
  );
  if (!items.length) return null;
  return (
    <nav aria-label={title} className="mt-12 border-t border-rule pt-6">
      <p className="font-medium text-[12px] uppercase tracking-[0.08em] text-muted">{title}</p>
      <ul className="mt-3 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.href} className="bg-paper">
            <Link href={item.href} className="block px-4 py-3 hover:bg-paper-2">
              <span className="block font-medium text-ink">{item.label} →</span>
              <span className="block text-xs text-muted">{item.note}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
