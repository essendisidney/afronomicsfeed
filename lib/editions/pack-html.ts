import type { Pack } from "@/lib/editions/pack";
import { site } from "@/lib/site";

/**
 * The Investment Committee Pack as a self-contained, print-ready document (A4). Served by /pack/sample and
 * for subscribers by /pack/<key>; the browser's print-to-PDF produces the file, and the sample PDF in
 * public/samples is made the same way.
 */

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export const pct = (v: number | null | undefined, d = 2) => (v == null ? "—" : `${v.toFixed(d)}%`);
export const signed = (v: number | null | undefined, d = 2, unit = "") => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : "±"}${Math.abs(v).toFixed(d)}${unit}`);
export const d = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const dm = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export function spark(points: { date: string; rate: number }[], w = 160, h = 36) {
  if (points.length < 2) return "";
  const min = Math.min(...points.map((p) => p.rate));
  const max = Math.max(...points.map((p) => p.rate));
  const t0 = Date.parse(points[0].date);
  const t1 = Date.parse(points.at(-1)!.date);
  const x = (p: { date: string }) => ((Date.parse(p.date) - t0) / Math.max(1, t1 - t0)) * (w - 6) + 3;
  const y = (p: { rate: number }) => 3 + (1 - (p.rate - min) / Math.max(0.3, max - min)) * (h - 6);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p).toFixed(1)},${y(p).toFixed(1)}`).join(" ");
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${path}" fill="none" stroke="#26335a" stroke-width="1.6"/><circle cx="${x(points.at(-1)!).toFixed(1)}" cy="${y(points.at(-1)!).toFixed(1)}" r="2.5" fill="#5b3fd6"/></svg>`;
}

function curveChart(curve: Pack["kenya"]["curve"], w = 700, h = 220) {
  if (curve.length < 3) return "";
  const maxY = Math.max(...curve.map((p) => p.years), 1);
  const lo = Math.floor(Math.min(...curve.map((p) => p.rate)) - 0.5);
  const hi = Math.ceil(Math.max(...curve.map((p) => p.rate)) + 0.5);
  const x = (yrs: number) => 40 + (yrs / maxY) * (w - 60);
  const y = (r: number) => 10 + (1 - (r - lo) / (hi - lo)) * (h - 40);
  const path = curve.map((p, i) => `${i ? "L" : "M"}${x(p.years).toFixed(1)},${y(p.rate).toFixed(1)}`).join(" ");
  const ticks = [];
  for (let r = lo; r <= hi; r += 1) ticks.push(`<line x1="40" x2="${w - 20}" y1="${y(r)}" y2="${y(r)}" stroke="#e0e3df"/><text x="34" y="${y(r) + 4}" font-size="10" text-anchor="end" fill="#636b7d">${r}%</text>`);
  const xt = [0, 2, 5, 10, 15, 20, 25, 30].filter((v) => v <= maxY).map((v) => `<text x="${x(v)}" y="${h - 12}" font-size="10" text-anchor="middle" fill="#636b7d">${v}y</text>`);
  const dots = curve.map((p) => `<circle cx="${x(p.years).toFixed(1)}" cy="${y(p.rate).toFixed(1)}" r="3" fill="${p.kind === "T-bill" ? "#5b3fd6" : "#26335a"}"><title>${esc(p.label)} ${p.rate.toFixed(3)}% (${esc(p.date)})</title></circle>`);
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="max-width:100%">${ticks.join("")}${xt.join("")}<path d="${path}" fill="none" stroke="#26335a" stroke-width="2"/>${dots.join("")}</svg>`;
}

export const packCss = `
@page { size: A4; margin: 14mm 14mm 16mm; }
body { font-family: Archivo, "Helvetica Neue", Arial, sans-serif; color: #121826; margin: 0; background: #fff; font-size: 11.5px; line-height: 1.45; }
.page { max-width: 190mm; margin: 0 auto; padding: 10mm 0; page-break-after: always; }
.page:last-child { page-break-after: auto; }
.cover { background: #0e1524; color: #f5f6f4; padding: 22mm 16mm; border-radius: 12px; min-height: 240mm; display: flex; flex-direction: column; justify-content: space-between; }
.brand { font-weight: 800; letter-spacing: 2px; font-size: 16px; } .brand span { color: #a08cff; font-size: 10px; letter-spacing: 4px; margin-left: 8px; }
h1 { font-size: 40px; line-height: 1.02; margin: 20px 0 10px; font-weight: 700; letter-spacing: -0.5px; }
h2 { font-size: 20px; margin: 0 0 4px; font-weight: 700; letter-spacing: -0.2px; }
h3 { font-size: 13px; margin: 18px 0 6px; color: #5b3fd6; font-weight: 700; }
.lede { font-size: 14px; color: #c3c8d4; max-width: 120mm; }
.head { display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #121826; padding-bottom: 6px; margin-bottom: 10px; }
.head .muted { font-size: 11px; }
table { width: 100%; border-collapse: collapse; }
th { text-align: left; font-size: 10px; color: #636b7d; font-weight: 600; padding: 4px 6px; border-bottom: 1px solid #d9dcd7; }
td { padding: 5px 6px; border-bottom: 1px solid #e8eae6; vertical-align: top; }
td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
.muted { color: #636b7d; } .small { font-size: 10px; } .up { color: #0f7f57; } .down { color: #c2352b; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10mm; }
.kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 8px 0 14px; }
.kpi { border: 1px solid #d9dcd7; border-radius: 10px; padding: 10px 12px; } .kpi b { display: block; font-size: 22px; font-weight: 700; } .kpi span { font-size: 10px; color: #636b7d; }
.note { font-size: 10px; color: #636b7d; margin-top: 6px; }
.foot { position: running(footer); font-size: 9px; color: #636b7d; }
.footer { display: flex; justify-content: space-between; font-size: 9px; color: #636b7d; border-top: 1px solid #d9dcd7; padding-top: 6px; margin-top: 18px; }
@media screen { body { background: #ebedea; } .page { background: #fff; padding: 12mm; margin: 8mm auto; border-radius: 10px; box-shadow: 0 10px 40px -24px rgba(0,0,0,.4); } }
`;

export function packHtml(pack: Pack, opts: { client?: string; sample?: boolean } = {}) {
  const client = opts.client ?? "Sample";
  const sortedMarkets = [...pack.markets].sort((a, b) => a.market.country.localeCompare(b.market.country));
  const marketRows = sortedMarkets
    .map((m) => {
      const cell = (t: number) => {
        const now = m.latest.find((x) => x.tenor === t);
        const ago = m.monthAgo.find((x) => x.tenor === t);
        const yr = m.yearAgo.find((x) => x.tenor === t);
        return `<td class="num">${now ? pct(now.rate) : "—"}</td><td class="num muted">${now && ago ? signed(Math.round((now.rate - ago.rate) * 100), 0) : "—"}</td><td class="num muted">${now && yr ? signed(Math.round((now.rate - yr.rate) * 100), 0) : "—"}</td>`;
      };
      const latestDate = m.latest.map((x) => x.date).sort().at(-1);
      return `<tr><td><strong>${esc(m.market.country)}</strong><div class="muted small">${esc(m.market.rateNote)}</div></td>${cell(91)}${cell(182)}${cell(364)}<td>${spark(m.history364)}</td><td class="small">${latestDate ? d.format(new Date(latestDate)) : ""}</td></tr>`;
    })
    .join("");
  const bondRows = pack.kenya.bonds
    .map((b) => `<tr><td>${esc(b.issue)} <span class="muted small">${esc(b.kind)}</span></td><td class="num">${pct(b.weighted_avg_rate, 3)}</td><td class="num">${b.coupon != null ? pct(b.coupon) : "—"}</td><td class="num">${b.accepted_kes_m != null ? `${(b.accepted_kes_m / 1000).toFixed(1)}bn` : "—"}</td><td class="num">${b.bid_to_cover != null ? `${b.bid_to_cover.toFixed(2)}×` : "—"}</td><td class="small">${d.format(new Date(b.value_date))}</td></tr>`)
    .join("");
  const optionRows = pack.kenya.options
    .slice(0, 14)
    .map((o) => `<tr><td>${esc(o.name)}<div class="muted small">${esc(o.publisher)}</div></td><td class="num">${pct(o.gross)}</td><td class="num"><strong>${pct(o.net)}</strong></td><td class="small">${esc(o.lockIn)}</td><td class="small">${esc(o.asOf)}</td></tr>`)
    .join("");
  const fxRows = pack.fx.map((f) => `<tr><td>${esc(f.name)} <span class="muted small">${f.code}</span></td><td class="num">${f.now.toFixed(f.now >= 100 ? 2 : 4)}</td><td class="num">${f.monthAgo ? f.monthAgo.toFixed(f.monthAgo >= 100 ? 2 : 4) : "—"}</td><td class="num ${f.changePct == null ? "" : f.changePct >= 0 ? "up" : "down"}">${signed(f.changePct, 2, "%")}</td></tr>`).join("");
  const realRows = [...pack.real]
    .sort((a, b) => (b.real ?? -99) - (a.real ?? -99))
    .map((r) => `<tr><td>${esc(r.market.country)}</td><td class="num">${pct(r.nominal)}</td><td class="num">${pct(r.inflation, 1)} <span class="muted small">${r.inflationYear ?? ""}</span></td><td class="num ${r.real == null ? "" : r.real >= 0 ? "up" : "down"}"><strong>${signed(r.real)}</strong></td></tr>`)
    .join("");
  const demandRows = [...pack.demand].sort((a, b) => b.ratio - a.ratio).map((x) => `<tr><td>${esc(x.market.country)}</td><td class="num"><strong>${x.ratio.toFixed(2)}×</strong></td><td class="num">${x.previous == null ? "—" : `${x.previous.toFixed(2)}×`}</td><td class="small">${x.basis === "offered" ? "amount offered" : "amount accepted"}</td></tr>`).join("");
  const calRows = pack.calendar.map((c) => `<tr><td>${esc(c.market.country)}</td><td>${d.format(new Date(c.expected))}</td><td class="small">every ${c.cadenceDays} days · last ${dm.format(new Date(c.last))}</td></tr>`).join("");
  const bank = pack.kenya.bankHistory;
  const bankNow = bank.at(-1);
  const bankYr = bank[0];

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Afronomics Investment Committee Pack, ${esc(pack.month)}</title>
<meta name="robots" content="noindex">
<style>${packCss}</style></head><body>

<section class="page"><div class="cover">
  <div><div class="brand">AFRONOMICS <span>INVESTMENT COMMITTEE PACK</span></div>
    <h1>African government rates, Kenya’s curve and where the shilling earns most</h1>
    <p class="lede">${esc(pack.month)} · prepared ${d.format(new Date(pack.asOf))} for ${esc(client)}. Compiled from central-bank auction results, the daily FX reference and fund managers’ published yields. Every figure carries its source.</p></div>
  <div class="small" style="color:#8b93a7">Information, not advice. Figures as published by each source on the dates shown; Afronomics compiles and does not forecast. ${opts.sample ? "Sample pack, free to share." : "Licensed to the named client; redistribution outside the committee needs a licence."}</div>
</div></section>

<section class="page">
  <div class="head"><h2>1. Treasury bill rates, ten African markets</h2><span class="muted">as of ${d.format(new Date(pack.asOf))}</span></div>
  <table><thead><tr><th>Market</th><th class="num">91-day</th><th class="num">1m</th><th class="num">1y</th><th class="num">182-day</th><th class="num">1m</th><th class="num">1y</th><th class="num">364-day</th><th class="num">1m</th><th class="num">1y</th><th>364-day, 12 months</th><th>Latest</th></tr></thead><tbody>${marketRows}</tbody></table>
  <p class="note">1m and 1y: change in basis points against the auction closest to one month and one year earlier. Rate measures differ by central bank (shown under each market) and are compared as published.</p>
  <div class="grid">
    <div><h3>Real yields on one-year bills</h3><table><thead><tr><th>Market</th><th class="num">364-day</th><th class="num">Inflation</th><th class="num">Real</th></tr></thead><tbody>${realRows}</tbody></table><p class="note">Latest 364-day rate less the latest annual CPI inflation (World Bank, year shown).</p></div>
    <div><h3>Demand at auctions</h3><table><thead><tr><th>Market</th><th class="num">Last 90d</th><th class="num">Prior 90d</th><th>Bids against</th></tr></thead><tbody>${demandRows}</tbody></table><p class="note">Median auction: bids received as a multiple of the amount offered (or accepted where offered is not published).</p></div>
  </div>
  <div class="footer"><span>Afronomics Investment Committee Pack · ${esc(pack.month)}</span><span>Sources: central banks of each market; World Bank · afronomicsfeed.com/markets/tbills</span></div>
</section>

<section class="page">
  <div class="head"><h2>2. Kenya: the government yield curve</h2><span class="muted">Central Bank of Kenya auction results</span></div>
  ${curveChart(pack.kenya.curve)}
  <p class="note">Bills at 91, 182 and 364 days (violet) and the most recent auction of each bond in the last twelve months (navy), placed at remaining life. Switches and buybacks excluded.</p>
  <h3>Bond auctions in the last 30 days</h3>
  ${bondRows ? `<table><thead><tr><th>Issue</th><th class="num">Rate</th><th class="num">Coupon</th><th class="num">Accepted KES</th><th class="num">Bid-to-cover</th><th>Value date</th></tr></thead><tbody>${bondRows}</tbody></table>` : `<p class="muted">No bond auction settled in the last 30 days.</p>`}
  <div class="footer"><span>Afronomics Investment Committee Pack · ${esc(pack.month)}</span><span>Source: Central Bank of Kenya · afronomicsfeed.com/markets/kenya-bonds</span></div>
</section>

<section class="page">
  <div class="head"><h2>3. Kenya: where the shilling earns most</h2><span class="muted">after withholding tax</span></div>
  <div class="kpis">
    <div class="kpi"><b>${bankNow ? pct(bankNow.deposit) : "—"}</b><span>Bank deposit rate, industry average, ${bankNow?.month ?? ""}</span></div>
    <div class="kpi"><b>${bankNow ? pct(bankNow.lending) : "—"}</b><span>Bank lending rate, industry average</span></div>
    <div class="kpi"><b>${bankNow && bankYr ? signed(Math.round((bankNow.deposit - bankYr.deposit) * 100), 0, " bps") : "—"}</b><span>Deposit rate change, 12 months</span></div>
    <div class="kpi"><b>${pack.kenya.options[0] ? pct(pack.kenya.options[0].net) : "—"}</b><span>Highest after-tax return: ${esc(pack.kenya.options[0]?.name ?? "")}</span></div>
  </div>
  <table><thead><tr><th>Option</th><th class="num">Published</th><th class="num">After tax</th><th>Money tied up</th><th>As of</th></tr></thead><tbody>${optionRows}</tbody></table>
  <p class="note">Withholding tax on interest for residents: 15% on bills, deposits and fund returns; 10% on bonds of ten years or more, none on infrastructure bonds. Fund yields are managers’ published effective annual yields. Bank figures are Central Bank of Kenya industry averages.</p>
  <div class="footer"><span>Afronomics Investment Committee Pack · ${esc(pack.month)}</span><span>Sources: Central Bank of Kenya; fund managers · afronomicsfeed.com/rates/kenya</span></div>
</section>

<section class="page">
  <div class="head"><h2>4. Currencies and the month ahead</h2><span class="muted">US dollar reference, ${pack.fx[0] ? d.format(new Date(pack.fx[0].asOf)) : ""}</span></div>
  <div class="grid">
    <div><h3>Against the dollar, one month</h3><table><thead><tr><th>Currency</th><th class="num">Now</th><th class="num">A month ago</th><th class="num">Move</th></tr></thead><tbody>${fxRows}</tbody></table><p class="note">Units per US dollar, daily mid-market reference archived by Afronomics. Positive move means the currency strengthened.</p></div>
    <div><h3>Next auction results expected</h3><table><thead><tr><th>Market</th><th>Expected</th><th>Rhythm</th></tr></thead><tbody>${calRows}</tbody></table><p class="note">From the most common gap between each market’s last twelve results; central banks publish official calendars and move dates around holidays.</p></div>
  </div>
  <div class="footer"><span>Afronomics Investment Committee Pack · ${esc(pack.month)}</span><span>Compiled ${new Date(pack.generatedAt).toISOString().slice(0, 16).replace("T", " ")} UTC · ${site.url}</span></div>
</section>
</body></html>`;
}
