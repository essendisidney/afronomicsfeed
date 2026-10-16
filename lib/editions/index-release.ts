import { billIndexLatest, billIndexSeries, indexName, indexShort } from "@/lib/data/bill-index";
import { documentHtml, exhibit, section } from "@/lib/documents/design";
import { site } from "@/lib/site";

/**
 * The Monday release of the Afronomics African Sovereign Bill Index: one fixed format, every week, so the
 * number can be quoted the same way each time. Text for email and LinkedIn, HTML for the press email.
 */

const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const signed = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n)}`;

export function buildIndexRelease() {
  const i = billIndexLatest();
  if (!i) return null;
  const week = longDate.format(new Date(i.latest.date));
  const headline = `${indexShort} ${i.latest.value.toFixed(2)}%${i.bpsWeek == null ? "" : `, ${signed(i.bpsWeek)} bps on the week`}`;
  const lead = `The ${indexName} (${indexShort}) stands at ${i.latest.value.toFixed(2)}% for the week of ${week}${
    i.bpsWeek == null ? "" : `, ${i.bpsWeek === 0 ? "unchanged" : `${i.bpsWeek > 0 ? "up" : "down"} ${Math.abs(i.bpsWeek)} basis points`} from the previous week`
  }${i.bpsMonth == null ? "" : `, ${signed(i.bpsMonth)} bps on the month`}${i.bpsYear == null ? "" : ` and ${signed(i.bpsYear)} bps on the year`}.`;
  const ranked = i.contributions;
  const top = ranked[0];
  const bottom = ranked.at(-1)!;
  const movers = ranked
    .filter((c) => c.weekAgo != null && Math.round((c.rate - c.weekAgo) * 100) !== 0)
    .map((c) => ({ c, bps: Math.round((c.rate - (c.weekAgo ?? c.rate)) * 100) }))
    .sort((a, b) => Math.abs(b.bps) - Math.abs(a.bps));
  const moversText = movers.length
    ? `Week on week, ${movers
        .slice(0, 4)
        .map((m) => `${m.c.market.country} ${m.bps > 0 ? "rose" : "fell"} ${Math.abs(m.bps)} bps to ${m.c.rate.toFixed(2)}%`)
        .join(", ")}; the other ${ranked.length - Math.min(movers.length, 4)} markets had no new one-year result.`
    : `No market published a new one-year result in the week.`;
  const range = `The index is the equal-weighted average of the latest 364-day Treasury bill rate in ${i.latest.markets} markets. ${top.market.country} pays most (${top.rate.toFixed(2)}%) and ${bottom.market.country} least (${bottom.rate.toFixed(2)}%). The series high is ${i.high.value.toFixed(2)}% (${longDate.format(new Date(i.high.date))}) and the low ${i.low.value.toFixed(2)}% (${longDate.format(new Date(i.low.date))}).`;
  const table = ranked.map((c) => ({ country: c.market.country, rate: c.rate, date: c.date, bps: c.weekAgo == null ? null : Math.round((c.rate - c.weekAgo) * 100), href: `${site.url}${c.market.href}` }));
  return { index: i, week, headline, lead, moversText, range, table, url: `${site.url}/markets/bill-index`, boiler: `The ${indexName} is published every Monday by Afronomics from the auction results of ${i.latest.markets} African central banks. Method, series and contributions: ${site.url}/markets/bill-index. Free to quote with attribution to Afronomics.` };
}

export type IndexRelease = NonNullable<ReturnType<typeof buildIndexRelease>>;

export function indexReleaseText(r: IndexRelease, utm = "utm_source=email&utm_medium=release&utm_campaign=asbi") {
  return [
    `${indexName} — week of ${r.week}`,
    r.lead,
    r.moversText,
    r.range,
    `By market (364-day, latest):\n${r.table.map((t) => `• ${t.country} ${t.rate.toFixed(2)}%${t.bps == null ? "" : ` (${signed(t.bps)} bps)`} · ${t.date}`).join("\n")}`,
    `Chart, series and contributions: ${r.url}?${utm}`,
    r.boiler,
  ].join("\n\n");
}

export function indexReleaseLinkedIn(r: IndexRelease) {
  return [
    `${indexShort} this week: ${r.index.latest.value.toFixed(2)}%${r.index.bpsWeek == null ? "" : ` (${signed(r.index.bpsWeek)} bps)`}`,
    r.lead,
    r.moversText,
    `Highest: ${r.table[0].country} ${r.table[0].rate.toFixed(2)}%. Lowest: ${r.table.at(-1)!.country} ${r.table.at(-1)!.rate.toFixed(2)}%.`,
    `Series, method and every market's contribution: ${r.url}?utm_source=linkedin&utm_medium=social&utm_campaign=asbi`,
    "#Africa #Rates #TreasuryBills #Afronomics",
  ].join("\n\n");
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
export function indexReleaseHtml(r: IndexRelease) {
  const base = "font-family:Archivo,Helvetica,Arial,sans-serif;color:#1d1512;";
  const rows = r.table
    .map(
      (t) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #e4dbd3;font-size:14px;"><a href="${t.href}?utm_source=email&utm_medium=release&utm_campaign=asbi" style="color:#1d1512;text-decoration:none;">${esc(t.country)}</a></td><td align="right" style="padding:6px 0;border-bottom:1px solid #e4dbd3;font-size:14px;">${t.rate.toFixed(2)}%</td><td align="right" style="padding:6px 0;border-bottom:1px solid #e4dbd3;font-size:13px;color:${t.bps == null || t.bps === 0 ? "#6c5e55" : t.bps > 0 ? "#c4263e" : "#0f7f57"};">${t.bps == null ? "—" : `${signed(t.bps)} bps`}</td><td align="right" style="padding:6px 0;border-bottom:1px solid #e4dbd3;font-size:12px;color:#6c5e55;">${t.date}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(r.headline)}</title></head><body style="margin:0;background:#f7f3ef;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding:16px 0;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#b3401f;padding:22px 28px;${base}color:#f7f3ef;font-size:18px;font-weight:700;letter-spacing:1px;">AFRONOMICS <span style="color:#f6c9a0;font-size:11px;letter-spacing:3px;">${esc(indexShort)} · WEEKLY RELEASE</span></td></tr>
<tr><td style="padding:24px 28px 8px;${base}"><p style="margin:0;font-size:13px;color:#a33a1c;font-weight:700;">${esc(indexName)} — week of ${esc(r.week)}</p>
<p style="margin:10px 0 0;font-size:40px;line-height:1;font-weight:700;">${r.index.latest.value.toFixed(2)}%</p>
<p style="margin:14px 0 0;font-size:16px;line-height:25px;">${esc(r.lead)}</p>
<p style="margin:10px 0 0;font-size:15px;line-height:24px;color:#45372f;">${esc(r.moversText)}</p>
<p style="margin:10px 0 0;font-size:15px;line-height:24px;color:#45372f;">${esc(r.range)}</p></td></tr>
<tr><td style="padding:12px 28px 4px;${base}"><p style="margin:0 0 6px;font-size:13px;color:#a33a1c;font-weight:700;">By market, 364-day, latest</p><table role="presentation" cellpadding="0" cellspacing="0" width="100%">${rows}</table></td></tr>
<tr><td style="padding:18px 28px 26px;"><a href="${r.url}?utm_source=email&utm_medium=release&utm_campaign=asbi" style="display:inline-block;background:#1d1512;${base}color:#f7f3ef;font-size:14px;font-weight:600;padding:10px 18px;border-radius:999px;text-decoration:none;">Chart, series and contributions</a></td></tr>
<tr><td style="background:#eee7e1;padding:16px 28px;${base}font-size:12px;line-height:18px;color:#6c5e55;">${esc(r.boiler)} Press: ${esc(site.contactEmail)}.</td></tr>
</table></td></tr></table></body></html>`;
}

/** One year of the index as a line, for the release document. */
function indexChart(points: { date: string; value: number }[], w = 640, h = 220) {
  if (points.length < 2) return "";
  const lo = Math.floor(Math.min(...points.map((p) => p.value)) - 0.25);
  const hi = Math.ceil(Math.max(...points.map((p) => p.value)) + 0.25);
  const x = (i: number) => 44 + (i / (points.length - 1)) * (w - 64);
  const y = (v: number) => 12 + (1 - (v - lo) / Math.max(0.5, hi - lo)) * (h - 44);
  const ticks = [];
  for (let v = lo; v <= hi; v += 1) ticks.push(`<line x1="44" x2="${w - 20}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" stroke="#e4dbd3"/><text x="38" y="${(y(v) + 3).toFixed(1)}" font-size="10" text-anchor="end" fill="#6c5e55">${v}%</text>`);
  const months = points
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => i === 0 || p.date.slice(5, 7) !== points[i - 1].date.slice(5, 7))
    .filter((_, k, all) => k % 2 === 0 || k === all.length - 1)
    .map(({ p, i }) => `<text x="${x(i).toFixed(1)}" y="${h - 10}" font-size="9.5" text-anchor="middle" fill="#6c5e55">${new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" }).format(new Date(`${p.date}T00:00:00Z`))}</text>`);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const last = points.at(-1)!;
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${indexShort}, weekly, last 52 weeks">${ticks.join("")}${months.join("")}<path d="${path}" fill="none" stroke="#a33a1c" stroke-width="2"/><circle cx="${x(points.length - 1).toFixed(1)}" cy="${y(last.value).toFixed(1)}" r="3.5" fill="#a33a1c"/></svg>`;
}

/** The weekly release as a document in the house design (lib/documents/design.ts), printed to PDF each Monday. */
export function indexReleaseDocument(r: IndexRelease) {
  const year = billIndexSeries(364).slice(-52);
  const monday = r.index.latest.date;
  const meta = {
    series: `${indexShort} weekly release`,
    title: r.headline,
    subtitle: r.lead,
    number: `AF-ASBI-${monday}`,
    edition: `Week of ${r.week}`,
    asOf: monday,
    sections: ["This week", "By market"],
    method: [
      `The ${indexName} is the equal-weighted average of the latest 364-day Treasury bill rate in ${r.index.latest.markets} African markets, read every Monday. A market’s rate stays in the index until its next auction.`,
      "Rates are as each central bank publishes them; the measure differs by central bank (weighted average, cut-off or stop rate) and is shown on each market’s page.",
    ],
    sources: [
      { name: "Central banks of the markets in the index", note: "Treasury bill auction results", url: `${site.url}/markets/tbills` },
      { name: `${indexName}: method, series and contributions`, url: r.url },
    ],
    licence: "Free to quote and to share in full, with attribution to Afronomics.",
    href: "/markets/bill-index",
    pdf: "/documents/index-release",
    letter: true,
  };
  const s1 = section(
    1,
    "This week",
    `<div class="kpis">
<div class="kpi"><b>${r.index.latest.value.toFixed(2)}%</b><span>${indexShort}, week of ${r.week}</span></div>
<div class="kpi"><b>${r.index.bpsWeek == null ? "—" : `${signed(r.index.bpsWeek)} bps`}</b><span>On the week</span></div>
<div class="kpi"><b>${r.index.bpsMonth == null ? "—" : `${signed(r.index.bpsMonth)} bps`}</b><span>On the month</span></div>
<div class="kpi"><b>${r.index.bpsYear == null ? "—" : `${signed(r.index.bpsYear)} bps`}</b><span>On the year</span></div>
</div>
<p>${esc(r.moversText)}</p>
<p>${esc(r.range)}</p>
${exhibit({ title: `The ${indexShort} over the last 52 weeks`, body: indexChart(year), source: `Afronomics ${indexShort}, from central banks’ auction results`, asOf: monday, wide: true })}`,
  );
  const s2 = section(
    2,
    "By market",
    exhibit({
      title: "One-year Treasury bill rate by market, highest first",
      body: `<table><thead><tr><th>Market</th><th class="num">364-day</th><th class="num">On the week</th><th>Result of</th></tr></thead><tbody>${r.table
        .map((t) => `<tr><td>${esc(t.country)}</td><td class="num"><b>${t.rate.toFixed(2)}%</b></td><td class="num ${t.bps == null || t.bps === 0 ? "muted" : t.bps > 0 ? "down" : "up"}">${t.bps == null ? "—" : `${signed(t.bps)} bps`}</td><td class="small">${esc(t.date)}</td></tr>`)
        .join("")}</tbody></table>`,
      note: "A rise in a bill rate is shown in red: it raises the government’s cost of borrowing.",
      source: "Central banks of each market, auction results",
      asOf: monday,
    }),
  );
  return documentHtml(meta, s1 + s2);
}
