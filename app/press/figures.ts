import { allAuctionPaths, bondAuction, datesOf } from "@/components/bonds/auction";
import { issuerSlug, marketsWithRows, shortName } from "@/components/bonds/stats";
import { shortDate } from "@/lib/data/auction-week";
import { billIndexLatest, indexShort } from "@/lib/data/bill-index";
import { marketDates } from "@/lib/data/market-stories";
import { allTbillWeeks, bondDates } from "@/lib/data/auction-stories";
import { loadPolicyRates } from "@/lib/data/policy-rates";
import { billMarkets, latestBills, loadBillMarket, type BillTenor } from "@/lib/data/sovereign-bills";

/**
 * The figures /press offers for citation (docs/rebuild/upgrade-U6-plan.md, item B). Every value is read from a data
 * file at build time, with the date and publisher the file gives it; nothing here is typed by hand. A market whose
 * file is empty is left out rather than shown with a gap.
 */

const http = (s: string | null | undefined) => (s && /^https?:\/\//.test(s) ? s : null);

export type BillFigure = {
  slug: string;
  country: string;
  tenor: BillTenor;
  rate: number;
  date: string;
  publisher: string;
  /** The publisher's own document for that result, or its results page. */
  source: string;
  /** Our dated page for that auction. */
  path: string;
  /** The policy rate with the date the bank printed beside it (verbatim, any format), or the day we read it. */
  policy: { label: string; rate: number; printed: string | null; readOn: string; source: string } | null;
};

/** The longest bill each market sold most recently (364-day where it sells one), with its policy rate beside it. */
export function billFigures(): BillFigure[] {
  const policy = new Map((loadPolicyRates().rows ?? []).map((r) => [r.market, r]));
  return billMarkets.flatMap((m) => {
    const latest = latestBills(loadBillMarket(m.slug).rows);
    const pick = latest.get(364) ?? latest.get(182) ?? latest.get(91);
    if (!pick) return [];
    const row = pick.latest;
    const p = policy.get(m.slug);
    return [
      {
        slug: m.slug,
        country: m.country,
        tenor: row.tenor,
        rate: row.rate,
        date: row.date,
        publisher: m.publisher,
        source: http(row.source) ?? m.sourcePage,
        path: m.slug === "kenya" ? `/markets/kenya-tbills/${row.date}` : `/markets/tbills/${m.slug}/${row.date}`,
        policy: p ? { label: p.label, rate: p.rate, printed: p.date_as_printed, readOn: p.read_at.slice(0, 10), source: http(p.source) ?? m.sourcePage } : null,
      },
    ];
  });
}

/** Kenya's three bills at the latest auction, each a sentence a reporter can paste. */
export function kenyaBills() {
  const m = billMarkets.find((b) => b.slug === "kenya")!;
  const latest = latestBills(loadBillMarket("kenya").rows);
  return ([91, 182, 364] as BillTenor[]).flatMap((tenor) => {
    const hit = latest.get(tenor);
    if (!hit) return [];
    const r = hit.latest;
    const bps = hit.previous ? Math.round((r.rate - hit.previous.rate) * 100) : null;
    return [
      {
        tenor,
        rate: r.rate,
        date: r.date,
        bps,
        source: http(r.source) ?? m.sourcePage,
        path: `/markets/kenya-tbills/${r.date}`,
        sentence: `Kenya’s ${tenor}-day Treasury bill rate was ${r.rate.toFixed(2)}% at the auction for value ${shortDate(r.date)} (${m.publisher}, compiled by Afronomics).`,
      },
    ];
  });
}

/** The index's latest weekly reading, as a sentence. */
export function indexFigure() {
  const idx = billIndexLatest();
  if (!idx) return null;
  const { value, date, markets } = idx.latest;
  return {
    value,
    date,
    markets,
    sentence: `The ${indexShort}, the simple average of the latest one-year Treasury bill rate in ${markets} African markets, stood at ${value.toFixed(2)}% for the week of ${shortDate(date)} (Afronomics).`,
  };
}

export type BondFigure = { slug: string; place: string; date: string; settlement: boolean; line: string; rate: number; publisher: string; source: string; path: string };

/** The latest bond auction in each market (WAEMU: the latest issuer to sell), with its headline line. */
export function bondFigures(): BondFigure[] {
  return marketsWithRows().flatMap(({ market, rows }) => {
    const date = datesOf(rows)[0];
    if (!date) return [];
    const issuer = market.slug === "waemu" ? rows.find((r) => r.date === date && r.issue)?.issue : null;
    const a = bondAuction(market.slug, date, issuer ? issuerSlug(issuer) : null);
    if (!a || !a.path) return [];
    return [
      {
        slug: market.slug,
        place: market.slug === "waemu" ? `${a.place} (WAEMU)` : shortName(market),
        date,
        settlement: a.settlement,
        line: a.lead.label,
        rate: a.lead.rate,
        publisher: market.publisher,
        source: a.sources[0] ?? market.sourcePage,
        path: a.path,
      },
    ];
  });
}

/** How much the record holds: results and dated auction pages, counted from the files. */
export function coverage() {
  const billResults = billMarkets.reduce((n, m) => n + loadBillMarket(m.slug).rows.length, 0);
  const bonds = marketsWithRows();
  const bondResults = bonds.reduce((n, b) => n + b.rows.length, 0);
  const billPages = allTbillWeeks().length + billMarkets.filter((m) => m.slug !== "kenya").reduce((n, m) => n + marketDates(m.slug).length, 0);
  // As the sitemap counts them: Kenya's dated bond pages are its settlement dates (/markets/kenya-bonds/{date}).
  const bondPages = bondDates().length + bonds.filter((b) => b.market.slug !== "kenya").reduce((n, b) => n + allAuctionPaths(b.market.slug).length, 0);
  return { billMarkets: billMarkets.filter((m) => loadBillMarket(m.slug).rows.length).length, billResults, bondMarkets: bonds.length, bondResults, billPages, bondPages };
}
