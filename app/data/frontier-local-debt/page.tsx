import { institutionalLadder, institutionalPriceText } from "@/lib/billing/ratecard";
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { InstitutionalBuy } from "@/components/billing/InstitutionalBuy";
import { PilotForm } from "@/components/billing/PilotForm";
import { billMarkets, loadBillMarket, type BillMarket } from "@/lib/data/sovereign-bills";
import { bondMarkets, bondSnapshot, loadBondMarket, type BondMarket } from "@/lib/data/sovereign-bonds";
import { BondMarketCard } from "@/components/data/BondMarketCard";
import { site } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { frontierDebtDatasetJsonLd } from "@/lib/seo/schema";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "African local-currency government debt data for frontier-market investors",
  description:
    "Primary auction results from African central banks, checked and published within hours, with history back to 2000 in some markets, for investors in the African markets of JPMorgan's GBI-EM Edge frontier local-currency bond index. Coverage by market, honest gaps, API and 30-day pilots.",
  alternates: { canonical: `${site.url}/data/frontier-local-debt` },
};

// JPMorgan GBI-EM Edge (frontier local-currency government bonds of more than 2.5 years, at least USD 250m each),
// African constituents and weights as reported around its launch at the end of September 2026. JPMorgan's own index
// documents are the authority; these are press reports.
const EDGE: Partial<Record<BillMarket["slug"], string>> = {
  egypt: "8.0% (the country cap)",
  nigeria: "7.4%",
  kenya: "6.9%",
  uganda: "4.8%",
  zambia: "0.5%",
  ghana: "0.3%",
};
// African index markets we do not cover yet.
const EDGE_UNCOVERED = [
  { country: "Morocco", weight: "8.0% (the country cap)", publisher: "Ministry of Economy and Finance (Treasury auctions)" },
  { country: "Tunisia", weight: "5.3%", publisher: "Central Bank of Tunisia / Treasury" },
  { country: "Côte d’Ivoire", weight: "smaller constituent", publisher: "UMOA-Titres (WAEMU)" },
  { country: "Angola", weight: "smaller constituent", publisher: "Banco Nacional de Angola" },
];
const EDGE_SOURCES = [
  { label: "BusinessDay (Nigeria): Africa 44.5% of a $328bn index", href: "https://businessday.ng/companies/article/africa-takes-44-5-of-jpmorgans-new-328bn-frontier-bond-index/" },
  { label: "Nairametrics: country weights", href: "https://nairametrics.com/2026/09/14/j-p-morgan-includes-nigeria-in-new-emerging-market-bond-index-with-7-4-weight/" },
  { label: "Reuters via Kitco, 14 Sep 2026", href: "https://www.kitco.com/news/off-the-wire/2026-09-14/jpmorgan-launch-frontier-market-local-currency-debt-index-month-end" },
  { label: "CNBC Africa", href: "https://www.cnbcafrica.com/2026/jpmorgan-to-launch-long-awaited-frontier-local-currency-debt-index" },
  { label: "Enterprise (Egypt), 16 Sep 2026", href: "https://enterpriseam.com/egypt/2026/09/16/jpmorgans-new-frontier-index-gives-egypt-its-biggest-possible-weighting/" },
];

const monthYear = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
const longDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** The first institutional product: African local-currency sovereign auction data, with a pilot request. */
export default function FrontierLocalDebtPage() {
  const bonds = Object.fromEntries(
    bondMarkets.map((m) => {
      const r = loadBondMarket(m.slug).rows;
      return [m.slug, { results: r.length, first: r.at(-1)?.date ?? null, auctions: new Set(r.map((x) => x.date)).size }];
    }),
  ) as Record<string, { results: number; first: string | null; auctions: number }>;
  const bondTotal = Object.values(bonds).reduce((n, b) => n + b.results, 0);
  const bondCountries = bondMarkets.filter((m) => bonds[m.slug]?.results).map((m) => (m.slug === "waemu" ? "the eight WAEMU markets" : m.country));
  const covered: Record<string, { n: number; first: string | null }> = {};
  const civ = loadBondMarket("waemu").rows.filter((r) => r.issue === "Côte d’Ivoire");
  const mor = loadBondMarket("morocco").rows;
  covered["Côte d’Ivoire"] = { n: civ.length, first: civ.at(-1)?.date ?? null };
  covered["Morocco"] = { n: mor.length, first: mor.at(-1)?.date ?? null };
  const rows = billMarkets
    .map((m) => {
      const r = loadBillMarket(m.slug).rows;
      const dates = r.map((x) => x.date).sort();
      return { m, results: r.length, first: dates[0] ?? null, last: dates[dates.length - 1] ?? null, edge: EDGE[m.slug] ?? null };
    })
    .sort((a, b) => Number(Boolean(b.edge)) - Number(Boolean(a.edge)) || b.results - a.results);
  const EDGE_ORDER: BondMarket["slug"][] = ["egypt", "morocco", "nigeria", "kenya", "uganda", "zambia", "waemu"];
  const snaps = EDGE_ORDER.map((slug) => bondSnapshot(slug)).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const total = rows.reduce((n, r) => n + r.results, 0) + bondTotal;

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/data", label: "Data" }, { label: "Frontier local debt" }]}
      kicker="For institutions · Frontier local debt"
      title="African local-currency government debt, auction by auction"
      lede={
        <p>
          JPMorgan’s new frontier local-currency bond index, GBI-EM Edge (about $328bn), gives African markets about 44.5% of its weight, as reported at
          launch. It holds government bonds with more than 2.5 years to run, so the bond auctions matter most; the Treasury-bill auctions show the
          short end of each curve and where liquidity is. Afronomics reads primary auction results from African central banks, checks them and publishes
          them within hours of the release: {total.toLocaleString("en-US")} results so far.
        </p>
      }
    >
      <JsonLd data={frontierDebtDatasetJsonLd()} />
      {snaps.length ? (
        <section className="mb-12">
          <SectionTitle
            kicker="Latest results"
            title="The newest bond auction in each market"
            note="Read from each issuer's own notice and linked to it. Rates as each publisher measures them: weighted average, cut-off or marginal (see the API notes). Information, not advice."
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {snaps.map((snap) => (
              <BondMarketCard key={snap.market.slug} snap={snap} label={snap.market.slug === "waemu" ? "WAEMU (8 markets)" : undefined} />
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionTitle
          kicker="Coverage today"
          title="What we hold, market by market"
          note={`Counted from our datasets on this page’s last build. Bond auctions today: ${bondCountries.join(", ")}. Tunisia, Ghana and South Africa are next.`}
        />
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Market</th>
                <th>GBI-EM Edge weight (reported)</th>
                <th className="text-right">Bill auction results</th>
                <th className="text-right">Since</th>
                <th className="text-right">Latest</th>
                <th>Bond auctions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.m.slug}>
                  <td>
                    <Link href={r.m.href} className="font-medium text-ink hover:text-forest">
                      {r.m.country}
                    </Link>
                    <span className="block text-[11px] text-muted">{r.m.publisher}</span>
                  </td>
                  <td>{r.edge ?? <span className="text-muted">not in the index</span>}</td>
                  <td className="text-right">{r.results.toLocaleString("en-US")}</td>
                  <td className="text-right">{r.first ? monthYear(r.first) : "—"}</td>
                  <td className="text-right">{r.last ? longDate(r.last) : "—"}</td>
                  <td className="text-[13px]">
                    {bonds[r.m.slug]?.results && bonds[r.m.slug].first ? (
                      <span>
                        {bonds[r.m.slug].results.toLocaleString("en-US")} results since {monthYear(bonds[r.m.slug].first!)}
                      </span>
                    ) : r.edge ? (
                      <span className="text-accent">in build</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {EDGE_UNCOVERED.map((u) => (
                <tr key={u.country}>
                  <td>
                    <span className="font-medium text-ink">{u.country}</span>
                    <span className="block text-[11px] text-muted">{u.publisher}</span>
                  </td>
                  <td>{u.weight}</td>
                  <td className="text-right text-muted" colSpan={3}>
                    {covered[u.country]?.n ? "Bill results not shown yet" : "Not covered yet"}
                  </td>
                  <td className="text-[13px]">
                    {covered[u.country]?.n && covered[u.country].first ? (
                      <span>
                        {covered[u.country].n.toLocaleString("en-US")} results since {monthYear(covered[u.country].first!)}
                      </span>
                    ) : (
                      <span className="text-accent">{u.country === "Côte d’Ivoire" ? "next (with Senegal)" : "planned"}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-muted">
          Index weights as reported before launch:{" "}
          {EDGE_SOURCES.map((s, i) => (
            <span key={s.href}>
              {i ? "; " : ""}
              <a href={s.href} target="_blank" rel="noopener noreferrer" data-track="source_click" className="underline underline-offset-2">
                {s.label}
              </a>
            </span>
          ))}
          . JPMorgan’s index documents are the authority on constituents and weights.
        </p>
      </section>

      <section className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="What a licence gives you" title="Built for a frontier debt desk" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>
              <strong className="text-ink">Every auction, within hours of the release:</strong> amounts offered, bid and accepted, and the rate, by tenor, read from each central
              bank’s own release, with the link to it.
            </li>
            <li>
              <strong className="text-ink">Checked before it is published:</strong> each result must pass range and consistency checks (against the release’s own
              totals where it gives them), and a public status page shows any market whose release is late or unread.{" "}
              <Link href="/status" className="underline underline-offset-2">
                Data status
              </Link>
            </li>
            <li>
              <strong className="text-ink">History in one format:</strong> the full record in the same columns for every market, by API or CSV (Excel on request).
            </li>
            <li>
              <strong className="text-ink">Alerts:</strong> Treasury-bill results by browser push in ten markets and by email for Kenya. There are no bond-result alerts yet.
            </li>
            <li>
              <strong className="text-ink">Honest gaps:</strong> bond auctions are covered for {bondCountries.join(", ")} only so far; South Africa, Ghana, Tunisia and
              Angola are not covered yet. We do not sell secondary-market prices: those come from dealers and exchanges. Pilot institutions shape the order.
            </li>
          </ul>
          <div className="mt-4 divide-y divide-rule border-y border-rule">
            {institutionalLadder.map((tier) => (
              <div key={tier.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_15rem] sm:items-start">
                <div>
                  <p className="text-[15px] font-semibold text-ink">
                    {tier.name} <span className="font-normal text-ink-soft">· {institutionalPriceText(tier)} a month</span>
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-ink-soft">{tier.summary.charAt(0).toUpperCase() + tier.summary.slice(1)}.</p>
                </div>
                <InstitutionalBuy tier={tier.id} name={tier.name} variant={tier.id === "team" ? "primary" : "ghost"} />
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-soft">
            Priced in US dollars; pay at checkout or{" "}
            <Link href="/pricing?plan=enterprise#invoice" className="underline underline-offset-2">
              ask for an invoice
            </Link>
            .{" "}
            <Link href="/data-api" className="font-semibold text-forest underline underline-offset-2">
              Terms and API
            </Link>
            .
          </p>
        </div>
        <div id="pilot" className="scroll-mt-24 rounded-2xl border-2 border-forest/30 bg-surface px-5 py-5">
          <p className="text-[17px] font-semibold text-ink">Start a free 30-day pilot</p>
          <p className="mt-1 mb-4 text-[14px] text-ink-soft">
            For investment managers, banks, development finance institutions and research teams: an API key with the full history of every market above,
            free for 30 days. Five questions, no payment details.
          </p>
          <PilotForm siteUrl={site.url} />
        </div>
      </section>

      <p className="mt-10 text-sm text-ink-soft">
        Sources: the central banks named above, each linked from its market page. Afronomics compiles and checks; the central bank is the source.{" "}
        <em>Information, not advice.</em>
      </p>
    </PageShell>
  );
}
