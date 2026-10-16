import { documentHtml, esc, exhibit, section, type DocMeta } from "@/lib/documents/design";
import type { Pack } from "@/lib/editions/pack";
import { site } from "@/lib/site";

/**
 * The Investment Committee Pack in the house document design (lib/documents/design.ts). Served as HTML by
 * /pack/sample and to subscribers; scripts/make-documents.mjs prints it to the PDF in public/documents.
 */

export { esc };
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
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="${path}" fill="none" stroke="#45372f" stroke-width="1.6"/><circle cx="${x(points.at(-1)!).toFixed(1)}" cy="${y(points.at(-1)!).toFixed(1)}" r="2.5" fill="#b3401f"/></svg>`;
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
  for (let r = lo; r <= hi; r += 1) ticks.push(`<line x1="40" x2="${w - 20}" y1="${y(r)}" y2="${y(r)}" stroke="#e4dbd3"/><text x="34" y="${y(r) + 4}" font-size="10" text-anchor="end" fill="#6c5e55">${r}%</text>`);
  const xt = [0, 2, 5, 10, 15, 20, 25, 30].filter((v) => v <= maxY).map((v) => `<text x="${x(v)}" y="${h - 12}" font-size="10" text-anchor="middle" fill="#6c5e55">${v}y</text>`);
  const dots = curve.map((p) => `<circle cx="${x(p.years).toFixed(1)}" cy="${y(p.rate).toFixed(1)}" r="3" fill="${p.kind === "T-bill" ? "#b3401f" : "#45372f"}"><title>${esc(p.label)} ${p.rate.toFixed(3)}% (${esc(p.date)})</title></circle>`);
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="max-width:100%">${ticks.join("")}${xt.join("")}<path d="${path}" fill="none" stroke="#45372f" stroke-width="2"/>${dots.join("")}</svg>`;
}

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

  const monthNumber = pack.asOf.slice(0, 7);
  const meta: DocMeta = {
    series: "Investment Committee Pack",
    title: "African government rates, Kenya’s curve and where the shilling earns most",
    subtitle: `Treasury bill rates in ten African markets, Kenya’s government yield curve, after-tax returns on the main shilling options, and currencies. Compiled ${d.format(new Date(pack.generatedAt))}.`,
    number: `AF-PACK-${opts.sample ? "SAMPLE-" : ""}${monthNumber}`,
    edition: pack.month,
    asOf: pack.asOf,
    preparedFor: opts.sample ? undefined : client,
    sample: opts.sample,
    sections: ["Treasury bill rates, ten African markets", "Kenya: the government yield curve", "Kenya: where the shilling earns most", "Currencies and the month ahead"],
    method: [
      "Auction results are taken from each central bank’s published results and shown as published; rate measures differ by central bank and are compared as published. One-month and one-year changes compare the latest auction with the auction closest to one month and one year earlier.",
      "Real yields are the latest 364-day rate less the latest annual consumer price inflation published by the World Bank. Auction demand is the median, over the last 90 days, of bids received as a multiple of the amount offered (or accepted where offered is not published).",
      "After-tax returns apply Kenya’s withholding tax for residents: 15% on bills, deposits and fund returns; 10% on bonds of ten years or more; none on infrastructure bonds. Fund yields are the managers’ published effective annual yields.",
      "Expected auction dates come from the most common gap between each market’s last twelve results; central banks publish official calendars and move dates around holidays.",
    ],
    sources: [
      { name: "Central banks of the ten markets", note: "auction results", url: `${site.url}/markets/tbills` },
      { name: "Central Bank of Kenya", note: "bill and bond auction results; industry average deposit and lending rates", url: "https://www.centralbank.go.ke" },
      { name: "World Bank", note: "consumer price inflation, annual", url: "https://data.worldbank.org" },
      { name: "Fund managers", note: "published money market fund yields", url: `${site.url}/rates/kenya/money-market-funds` },
      { name: "Daily US dollar reference rates", note: "archived by Afronomics", url: `${site.url}/markets` },
    ],
    licence: opts.sample
      ? "Sample edition: free to share in full with credit to Afronomics."
      : "Licensed to the named institution for its investment committee. Redistribution outside the committee needs a licence.",
    href: "/pack",
    pdf: opts.sample ? "/documents/committee-pack-sample" : undefined,
    letter: true,
  };

  const s1 = section(
    1,
    meta.sections[0],
    `${exhibit({
      title: "Treasury bill rates, with changes in basis points",
      body: `<table><thead><tr><th>Market</th><th class="num">91-day</th><th class="num">1m</th><th class="num">1y</th><th class="num">182-day</th><th class="num">1m</th><th class="num">1y</th><th class="num">364-day</th><th class="num">1m</th><th class="num">1y</th><th>364-day, 12 months</th><th>Latest</th></tr></thead><tbody>${marketRows}</tbody></table>`,
      note: "1m and 1y: change in basis points against the auction closest to one month and one year earlier. The measure each central bank publishes is shown under the market.",
      source: "Central banks of each market, auction results",
      asOf: pack.asOf,
      wide: true,
    })}
<div class="grid2">
${exhibit({ title: "Real yields on one-year bills", body: `<table><thead><tr><th>Market</th><th class="num">364-day</th><th class="num">Inflation</th><th class="num">Real</th></tr></thead><tbody>${realRows}</tbody></table>`, note: "Latest 364-day rate less the latest annual CPI inflation (year shown).", source: "Central banks; World Bank", asOf: pack.asOf })}
${exhibit({ title: "Demand at auctions", body: `<table><thead><tr><th>Market</th><th class="num">Last 90d</th><th class="num">Prior 90d</th><th>Bids against</th></tr></thead><tbody>${demandRows}</tbody></table>`, note: "Median auction: bids received as a multiple of the amount offered.", source: "Central banks of each market, auction results", asOf: pack.asOf })}
</div>`,
    { aside: `As of ${d.format(new Date(pack.asOf))}` },
  );

  const s2 = section(
    2,
    meta.sections[1],
    `${exhibit({
      title: "Kenya government yield curve: bills and bonds at remaining life",
      body: curveChart(pack.kenya.curve) || `<p class="muted">Too few auctions in the last twelve months to draw the curve.</p>`,
      note: "Bills at 91, 182 and 364 days (violet) and the most recent auction of each bond in the last twelve months (navy). Switches and buybacks excluded.",
      source: "Central Bank of Kenya, auction results",
      asOf: pack.asOf,
      wide: true,
    })}
${exhibit({
  title: "Bond auctions settled in the last 30 days",
  body: bondRows ? `<table><thead><tr><th>Issue</th><th class="num">Rate</th><th class="num">Coupon</th><th class="num">Accepted KES</th><th class="num">Bid-to-cover</th><th>Value date</th></tr></thead><tbody>${bondRows}</tbody></table>` : `<p class="muted">No bond auction settled in the last 30 days.</p>`,
  source: "Central Bank of Kenya, bond auction results",
  asOf: pack.asOf,
})}`,
    { aside: "Central Bank of Kenya auction results" },
  );

  const s3 = section(
    3,
    meta.sections[2],
    `<div class="kpis">
  <div class="kpi"><b>${bankNow ? pct(bankNow.deposit) : "—"}</b><span>Bank deposit rate, industry average${bankNow?.month ? `, ${esc(bankNow.month)}` : ""}</span></div>
  <div class="kpi"><b>${bankNow ? pct(bankNow.lending) : "—"}</b><span>Bank lending rate, industry average</span></div>
  <div class="kpi"><b>${bankNow && bankYr ? signed(Math.round((bankNow.deposit - bankYr.deposit) * 100), 0, " bps") : "—"}</b><span>Deposit rate change, 12 months</span></div>
  <div class="kpi"><b>${pack.kenya.options[0] ? pct(pack.kenya.options[0].net) : "—"}</b><span>Highest after-tax return: ${esc(pack.kenya.options[0]?.name ?? "")}</span></div>
</div>
${exhibit({
  title: "Shilling options ranked by return after withholding tax",
  body: `<table><thead><tr><th>Option</th><th class="num">Published</th><th class="num">After tax</th><th>Money tied up</th><th>As of</th></tr></thead><tbody>${optionRows}</tbody></table>`,
  note: "Withholding tax for residents: 15% on bills, deposits and fund returns; 10% on bonds of ten years or more; none on infrastructure bonds.",
  source: "Central Bank of Kenya; fund managers’ published yields",
  asOf: pack.asOf,
})}`,
    { aside: "After withholding tax" },
  );

  const s4 = section(
    4,
    meta.sections[3],
    `<div class="grid2">
${exhibit({ title: "Against the US dollar, one month", body: fxRows ? `<table><thead><tr><th>Currency</th><th class="num">Now</th><th class="num">A month ago</th><th class="num">Move</th></tr></thead><tbody>${fxRows}</tbody></table>` : `<p class="muted">Not available for this edition: the daily reference rates could not be read when it was compiled.</p>`, note: "Units per US dollar. A positive move means the currency strengthened.", source: "Daily mid-market reference rates, archived by Afronomics", asOf: pack.fx[0]?.asOf ?? pack.asOf })}
${exhibit({ title: "Next auction results expected", body: `<table><thead><tr><th>Market</th><th>Expected</th><th>Rhythm</th></tr></thead><tbody>${calRows}</tbody></table>`, note: "From the most common gap between each market’s last twelve results.", source: "Afronomics, from central banks’ auction results", asOf: pack.asOf })}
</div>`,
  );

  return documentHtml(meta, s1 + s2 + s3 + s4);
}
