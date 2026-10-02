import { billIndexLatest, indexName, indexShort } from "@/lib/data/bill-index";
import { plainMeaning } from "@/lib/data/plain";
import { billMarkets, loadBillMarket, type BillMarket } from "@/lib/data/sovereign-bills";
import { buildPack, type Pack } from "./pack";
import { d, dm, esc, packCss, pct, signed, spark } from "./pack-html";

/**
 * The Investment Committee Pack for any market on the monitor: the same engine as the Kenya pack, with that
 * market's own bills, demand, real yield, currency and calendar up front and the ten-market view behind it.
 * Uganda, Tanzania, Nigeria, Ghana, Zambia… each gets its pack the day its extractor runs.
 */

export type MarketPack = { pack: Pack; market: BillMarket; home: Pack["markets"][number] | null; history: { tenor: number; points: { date: string; rate: number }[] }[] };

export async function buildMarketPack(slug: BillMarket["slug"], now: number): Promise<MarketPack | null> {
  const market = billMarkets.find((m) => m.slug === slug);
  if (!market || slug === "kenya") return null;
  const pack = await buildPack(now);
  const home = pack.markets.find((m) => m.market.slug === slug) ?? null;
  const yearAgo = new Date(now - 365 * 86400000).toISOString().slice(0, 10);
  const rows = loadBillMarket(slug).rows;
  const history = [91, 182, 364].map((tenor) => ({ tenor, points: rows.filter((r) => r.tenor === tenor && r.date >= yearAgo).map((r) => ({ date: r.date, rate: r.rate })).reverse() }));
  return { pack, market, home, history };
}

export function marketPackHtml(mp: MarketPack, opts: { client?: string; sample?: boolean } = {}) {
  const { pack, market, home } = mp;
  const client = opts.client ?? "Sample";
  const latest = home?.latest ?? [];
  const lead = latest.find((x) => x.tenor === 364) ?? latest[0];
  const prevRows = loadBillMarket(market.slug).rows;
  const prevOf = (t: number) => prevRows.filter((r) => r.tenor === t)[1]?.rate ?? null;
  const plain = lead ? plainMeaning({ currency: market.currency, iso: market.iso, country: market.country, rows: latest.map((x) => ({ tenor: x.tenor, rate: x.rate, prev: prevOf(x.tenor) })) }) : null;
  const real = pack.real.find((r) => r.market.slug === market.slug);
  const dem = pack.demand.find((x) => x.market.slug === market.slug);
  const cal = pack.calendar.find((c) => c.market.slug === market.slug);
  const fxHome = pack.fx.find((f) => f.code === market.currency);
  const index = billIndexLatest();
  const contribution = index?.contributions.find((c) => c.market.slug === market.slug);
  const rank = index ? index.contributions.findIndex((c) => c.market.slug === market.slug) + 1 : 0;

  const tenorRows = [91, 182, 364]
    .map((t) => {
      const now = latest.find((x) => x.tenor === t);
      const ago = home?.monthAgo.find((x) => x.tenor === t);
      const yr = home?.yearAgo.find((x) => x.tenor === t);
      const hist = mp.history.find((h) => h.tenor === t)?.points ?? [];
      return `<tr><td><strong>${t}-day</strong></td><td class="num">${now ? pct(now.rate) : "—"}</td><td class="num muted">${now && ago ? signed(Math.round((now.rate - ago.rate) * 100), 0) : "—"}</td><td class="num muted">${now && yr ? signed(Math.round((now.rate - yr.rate) * 100), 0) : "—"}</td><td>${spark(hist, 220, 40)}</td><td class="small">${now ? d.format(new Date(now.date)) : ""}</td></tr>`;
    })
    .join("");
  const sortedMarkets = [...pack.markets].sort((a, b) => a.market.country.localeCompare(b.market.country));
  const marketRows = sortedMarkets
    .map((m) => {
      const cell = (t: number) => {
        const now = m.latest.find((x) => x.tenor === t);
        const ago = m.monthAgo.find((x) => x.tenor === t);
        return `<td class="num">${now ? pct(now.rate) : "—"}</td><td class="num muted">${now && ago ? signed(Math.round((now.rate - ago.rate) * 100), 0) : "—"}</td>`;
      };
      const latestDate = m.latest.map((x) => x.date).sort().at(-1);
      const me = m.market.slug === market.slug ? ' style="background:#f3f0ff"' : "";
      return `<tr${me}><td><strong>${esc(m.market.country)}</strong></td>${cell(91)}${cell(182)}${cell(364)}<td>${spark(m.history364)}</td><td class="small">${latestDate ? d.format(new Date(latestDate)) : ""}</td></tr>`;
    })
    .join("");
  const fxRows = pack.fx.map((f) => `<tr${f.code === market.currency ? ' style="background:#f3f0ff"' : ""}><td>${esc(f.name)} <span class="muted small">${f.code}</span></td><td class="num">${f.now.toFixed(f.now >= 100 ? 2 : 4)}</td><td class="num">${f.monthAgo ? f.monthAgo.toFixed(f.monthAgo >= 100 ? 2 : 4) : "—"}</td><td class="num ${f.changePct == null ? "" : f.changePct >= 0 ? "up" : "down"}">${signed(f.changePct, 2, "%")}</td></tr>`).join("");
  const realRows = [...pack.real].sort((a, b) => (b.real ?? -99) - (a.real ?? -99)).map((r) => `<tr${r.market.slug === market.slug ? ' style="background:#f3f0ff"' : ""}><td>${esc(r.market.country)}</td><td class="num">${pct(r.nominal)}</td><td class="num">${pct(r.inflation, 1)} <span class="muted small">${r.inflationYear ?? ""}</span></td><td class="num ${r.real == null ? "" : r.real >= 0 ? "up" : "down"}"><strong>${signed(r.real)}</strong></td></tr>`).join("");
  const calRows = pack.calendar.map((c) => `<tr${c.market.slug === market.slug ? ' style="background:#f3f0ff"' : ""}><td>${esc(c.market.country)}</td><td>${d.format(new Date(c.expected))}</td><td class="small">every ${c.cadenceDays} days · last ${dm.format(new Date(c.last))}</td></tr>`).join("");
  const indexRows = index ? index.contributions.map((c, i) => `<tr${c.market.slug === market.slug ? ' style="background:#f3f0ff"' : ""}><td>${i + 1}</td><td>${esc(c.market.country)}</td><td class="num">${pct(c.rate)}</td><td class="num muted">${c.weekAgo == null ? "—" : signed(Math.round((c.rate - c.weekAgo) * 100), 0)}</td><td class="small">${d.format(new Date(c.date))}</td></tr>`).join("") : "";

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Afronomics Investment Committee Pack · ${esc(market.country)}, ${esc(pack.month)}</title>
<meta name="robots" content="noindex">
<style>${packCss}</style></head><body>

<section class="page"><div class="cover">
  <div><div class="brand">AFRONOMICS <span>INVESTMENT COMMITTEE PACK · ${esc(market.country.toUpperCase())}</span></div>
    <h1>${esc(market.country)}’s cost of money, the region, and the month ahead</h1>
    <p class="lede">${esc(pack.month)} · prepared ${d.format(new Date(pack.asOf))} for ${esc(client)}. Compiled from the ${esc(market.publisher)}’s auction results, nine other central banks, the daily FX reference and the Afronomics index. Every figure carries its source.</p></div>
  <div class="small" style="color:#8b93a7">Information, not advice. Figures as published by each source on the dates shown; Afronomics compiles and does not forecast. ${opts.sample ? "Sample pack, free to share." : "Licensed to the named client; redistribution outside the committee needs a licence."}</div>
</div></section>

<section class="page">
  <div class="head"><h2>1. ${esc(market.country)}: Treasury bills</h2><span class="muted">${esc(market.rateLabel)} · ${esc(market.publisher)}</span></div>
  <div class="kpis">
    <div class="kpi"><b>${lead ? pct(lead.rate) : "—"}</b><span>${lead ? `${lead.tenor}-day, ${d.format(new Date(lead.date))}` : "no result"}</span></div>
    <div class="kpi"><b>${real?.real == null ? "—" : signed(real.real)}</b><span>real yield after inflation${real?.inflationYear ? ` (${real.inflationYear})` : ""}</span></div>
    <div class="kpi"><b>${dem ? `${dem.ratio.toFixed(2)}×` : "—"}</b><span>bids to amount ${dem?.basis ?? "offered"}, last 90 days</span></div>
    <div class="kpi"><b>${cal ? dm.format(new Date(cal.expected)) : "—"}</b><span>next result expected</span></div>
  </div>
  <table><thead><tr><th>Tenor</th><th class="num">Rate</th><th class="num">1m</th><th class="num">1y</th><th>12 months</th><th>Latest</th></tr></thead><tbody>${tenorRows}</tbody></table>
  <p class="note">The rate is the ${esc(market.rateNote)}. 1m and 1y: change in basis points against the auction closest to one month and one year earlier.</p>
  ${plain ? `<h3>What it means for ${market.currency} ${new Intl.NumberFormat("en-US").format(plain.amount)}</h3><p>${esc(plain.en[0])} ${esc(plain.en[1] ?? "")}</p>` : ""}
  <div class="grid" style="margin-top:8px">
    <div><h3>${esc(market.country)} in the ${esc(indexShort)}</h3><p>${index && contribution ? `${esc(market.country)} ranks ${rank} of ${index.contributions.length} markets by one-year rate, contributing ${pct(contribution.rate)} against an index of ${pct(index.latest.value)} (week of ${d.format(new Date(index.latest.date))}).` : "No reading."}</p></div>
    <div><h3>The ${esc(market.currency)} against the dollar</h3><p>${fxHome ? `${fxHome.now.toFixed(fxHome.now >= 100 ? 2 : 4)} per dollar on ${d.format(new Date(fxHome.asOf))}, ${fxHome.changePct == null ? "no month-ago reference" : `${signed(fxHome.changePct, 2, "%")} over the month (positive = stronger)`}.` : "No daily reference for this currency yet."}</p></div>
  </div>
  <div class="footer"><span>Afronomics Investment Committee Pack · ${esc(market.country)} · ${esc(pack.month)}</span><span>Source: ${esc(market.publisher)} · afronomicsfeed.com${esc(market.href)}</span></div>
</section>

<section class="page">
  <div class="head"><h2>2. Ten African markets</h2><span class="muted">as of ${d.format(new Date(pack.asOf))}</span></div>
  <table><thead><tr><th>Market</th><th class="num">91-day</th><th class="num">1m</th><th class="num">182-day</th><th class="num">1m</th><th class="num">364-day</th><th class="num">1m</th><th>364-day, 12 months</th><th>Latest</th></tr></thead><tbody>${marketRows}</tbody></table>
  <div class="grid" style="margin-top:10px">
    <div><h3>Real yields on one-year bills</h3><table><thead><tr><th>Market</th><th class="num">364-day</th><th class="num">Inflation</th><th class="num">Real</th></tr></thead><tbody>${realRows}</tbody></table></div>
    <div><h3>${esc(indexName)}</h3>${index ? `<p><strong>${pct(index.latest.value)}</strong> for the week of ${d.format(new Date(index.latest.date))}, ${index.bpsWeek == null ? "" : `${signed(index.bpsWeek, 0)} bps w/w, `}${index.bpsYear == null ? "" : `${signed(index.bpsYear, 0)} bps y/y`}.</p><table><thead><tr><th>#</th><th>Market</th><th class="num">364-day</th><th class="num">w/w</th><th>Date</th></tr></thead><tbody>${indexRows}</tbody></table>` : ""}</div>
  </div>
  <div class="footer"><span>Afronomics Investment Committee Pack · ${esc(market.country)} · ${esc(pack.month)}</span><span>Sources: central banks of each market; World Bank · afronomicsfeed.com/markets/bill-index</span></div>
</section>

<section class="page">
  <div class="head"><h2>3. Currencies and the month ahead</h2><span class="muted">daily reference, archived by Afronomics</span></div>
  <div class="grid">
    <div><h3>Against the dollar, one month</h3><table><thead><tr><th>Currency</th><th class="num">Now</th><th class="num">Month ago</th><th class="num">Change</th></tr></thead><tbody>${fxRows}</tbody></table><p class="note">Positive change means the currency strengthened against the dollar.</p></div>
    <div><h3>Next auction results expected</h3><table><thead><tr><th>Market</th><th>Expected</th><th>Rhythm</th></tr></thead><tbody>${calRows}</tbody></table><p class="note">Projected from each central bank’s auction rhythm, not an official calendar.</p></div>
  </div>
  <div class="footer"><span>Afronomics Investment Committee Pack · ${esc(market.country)} · ${esc(pack.month)}</span><span>Generated ${esc(pack.generatedAt.slice(0, 16).replace("T", " "))} UTC · afronomicsfeed.com/pack</span></div>
</section>
</body></html>`;
}
