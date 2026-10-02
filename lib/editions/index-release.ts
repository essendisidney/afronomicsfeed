import { billIndexLatest, indexName, indexShort } from "@/lib/data/bill-index";
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
  const base = "font-family:Archivo,Helvetica,Arial,sans-serif;color:#121826;";
  const rows = r.table
    .map(
      (t) =>
        `<tr><td style="padding:6px 0;border-bottom:1px solid #e0e3df;font-size:14px;"><a href="${t.href}?utm_source=email&utm_medium=release&utm_campaign=asbi" style="color:#121826;text-decoration:none;">${esc(t.country)}</a></td><td align="right" style="padding:6px 0;border-bottom:1px solid #e0e3df;font-size:14px;">${t.rate.toFixed(2)}%</td><td align="right" style="padding:6px 0;border-bottom:1px solid #e0e3df;font-size:13px;color:${t.bps == null || t.bps === 0 ? "#636b7d" : t.bps > 0 ? "#c2352b" : "#0f7f57"};">${t.bps == null ? "—" : `${signed(t.bps)} bps`}</td><td align="right" style="padding:6px 0;border-bottom:1px solid #e0e3df;font-size:12px;color:#636b7d;">${t.date}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(r.headline)}</title></head><body style="margin:0;background:#f5f6f4;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding:16px 0;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#0e1524;padding:22px 28px;${base}color:#f5f6f4;font-size:18px;font-weight:700;letter-spacing:1px;">AFRONOMICS <span style="color:#a08cff;font-size:11px;letter-spacing:3px;">${esc(indexShort)} · WEEKLY RELEASE</span></td></tr>
<tr><td style="padding:24px 28px 8px;${base}"><p style="margin:0;font-size:13px;color:#5b3fd6;font-weight:700;">${esc(indexName)} — week of ${esc(r.week)}</p>
<p style="margin:10px 0 0;font-size:40px;line-height:1;font-weight:700;">${r.index.latest.value.toFixed(2)}%</p>
<p style="margin:14px 0 0;font-size:16px;line-height:25px;">${esc(r.lead)}</p>
<p style="margin:10px 0 0;font-size:15px;line-height:24px;color:#3b4254;">${esc(r.moversText)}</p>
<p style="margin:10px 0 0;font-size:15px;line-height:24px;color:#3b4254;">${esc(r.range)}</p></td></tr>
<tr><td style="padding:12px 28px 4px;${base}"><p style="margin:0 0 6px;font-size:13px;color:#5b3fd6;font-weight:700;">By market, 364-day, latest</p><table role="presentation" cellpadding="0" cellspacing="0" width="100%">${rows}</table></td></tr>
<tr><td style="padding:18px 28px 26px;"><a href="${r.url}?utm_source=email&utm_medium=release&utm_campaign=asbi" style="display:inline-block;background:#121826;${base}color:#f5f6f4;font-size:14px;font-weight:600;padding:10px 18px;border-radius:999px;text-decoration:none;">Chart, series and contributions</a></td></tr>
<tr><td style="background:#ebedea;padding:16px 28px;${base}font-size:12px;line-height:18px;color:#636b7d;">${esc(r.boiler)} Press: ${esc(site.contactEmail)}.</td></tr>
</table></td></tr></table></body></html>`;
}
