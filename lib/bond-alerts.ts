import type { LatencyResult } from "@/lib/data/latency";
import type { BondMarket, BondRow } from "@/lib/data/sovereign-bonds";
import { esc, para, shell } from "@/lib/rate-alerts";
import { site } from "@/lib/site";

/**
 * Bond-result email alerts for API key holders (pilot and paid): one email per market per auction day, sent by
 * app/api/send/bond-alerts. The rules for which results are new live here so they can be read and tested apart
 * from the sender.
 */

export type BondRecipient = { email: string; token: string; markets: string[] | null };
export type NewBondAuction = { market: BondMarket["slug"]; date: string; firstSeen: string };

const HOUR = 3600_000;
/** Results first seen longer ago than this are not sent (a missed run catches up; a new key gets no back catalogue). */
export const ALERT_WINDOW_HOURS = 48;

export const bondStopUrl = (token: string) => `${site.url}/api/bond-alerts/unsubscribe?t=${token}`;
export const bondMarketUrl = (slug: string) => `${site.url}/markets/bonds/${slug}?utm_source=email&utm_medium=alert&utm_campaign=bond-alert`;

/**
 * Bond auctions that readers added recently: results in data/latency.json first seen within the window (baseline
 * results, on file before measuring began, are never new). WAEMU results, one per country, fold into one per day.
 */
export function newBondAuctions(results: LatencyResult[], slugs: readonly string[], now: number): NewBondAuction[] {
  const out = new Map<string, NewBondAuction>();
  for (const r of results) {
    if (r.kind !== "bonds" || r.baseline || !r.first_seen_at || !slugs.includes(r.market)) continue;
    const seen = Date.parse(r.first_seen_at);
    if (!Number.isFinite(seen) || now - seen > ALERT_WINDOW_HOURS * HOUR || seen > now + HOUR) continue;
    const key = `${r.market}|${r.date}`;
    const prev = out.get(key);
    if (!prev || r.first_seen_at < prev.firstSeen) out.set(key, { market: r.market as BondMarket["slug"], date: r.date, firstSeen: r.first_seen_at });
  }
  return [...out.values()].sort((a, b) => a.firstSeen.localeCompare(b.firstSeen) || a.market.localeCompare(b.market));
}

const longDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fmt = (v: number | null, digits = 2) => (v == null ? "—" : v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits }));

function lineLabel(r: BondRow) {
  const tenor = r.tenor_years != null ? `${Number.isInteger(r.tenor_years) ? r.tenor_years : r.tenor_years.toFixed(1)}-year` : null;
  return [r.issue, tenor, r.isin].filter(Boolean).join(" · ") || "Bond";
}

/** The email for one market's auction day. Rows are that day's BondRows for the market (at least one). */
export function bondAlertEmail(o: { market: BondMarket; date: string; rows: BondRow[]; token: string }) {
  const { market, rows } = o;
  const stop = bondStopUrl(o.token);
  const page = bondMarketUrl(market.slug);
  const place = market.slug === "waemu" ? "WAEMU" : market.country;
  const when = longDate(o.date);
  const dateWord = market.dateKind === "settlement" ? "settling" : "held";
  const subject = `${place} bond auction, ${when}: ${rows.length} line${rows.length === 1 ? "" : "s"}`;
  const sorted = [...rows].sort((a, b) => (a.issue ?? "").localeCompare(b.issue ?? "") || (a.tenor_years ?? 0) - (b.tenor_years ?? 0));
  const sources = [...new Set(sorted.map((r) => r.source).filter(Boolean))];
  const amount = (r: BondRow) => (r.accepted_m == null ? "accepted —" : `accepted ${market.currency} ${fmt(r.accepted_m, 0)}m`);
  const intro = [`New ${place} government bond auction results from the ${market.publisher}, ${dateWord} ${when}.`];
  const rateNote = [`Rate: ${market.rateNote}.`];
  const textLines = sorted.map((r) => `• ${lineLabel(r)}: ${fmt(r.rate, 3)}%, bid cover ${r.bid_cover == null ? "—" : fmt(r.bid_cover)}, ${amount(r)}`);
  const text = [
    ...intro,
    "",
    ...textLines,
    "",
    ...rateNote,
    "",
    ...sources.map((s) => `Source: ${s}`),
    `All ${place} bond auctions: ${page}`,
    "",
    "Information, not advice.",
    "You get this because an Afronomics API key (pilot or paid) is registered to this address.",
    `Stop these emails: ${stop}`,
  ].join("\n");
  const cell = "padding:8px 6px;border-top:1px solid #e0e3df;font-family:Archivo,Helvetica,Arial,sans-serif;font-size:13px;line-height:18px;";
  const table = `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:6px 0 14px;">
<tr><td style="${cell}color:#636b7d;">Line</td><td style="${cell}color:#636b7d;text-align:right;">Rate</td><td style="${cell}color:#636b7d;text-align:right;">Bid cover</td><td style="${cell}color:#636b7d;text-align:right;">Accepted (${esc(market.currency)}m)</td></tr>
${sorted
  .map(
    (r) =>
      `<tr><td style="${cell}color:#121826;">${esc(lineLabel(r))}</td><td style="${cell}text-align:right;font-weight:600;color:#121826;">${fmt(r.rate, 3)}%</td><td style="${cell}text-align:right;">${r.bid_cover == null ? "—" : fmt(r.bid_cover)}</td><td style="${cell}text-align:right;">${r.accepted_m == null ? "—" : fmt(r.accepted_m, 0)}</td></tr>`,
  )
  .join("\n")}
</table>`;
  const links = sources.map((s) => `<a href="${esc(s)}" style="color:#121826;">${esc(s.length > 70 ? `${s.slice(0, 67)}…` : s)}</a>`).join("<br>");
  const html = shell(
    "BONDS",
    `${para(intro)}${table}${para(rateNote)}${sources.length ? `<p style="margin:0 0 12px;font-size:13px;">Source: ${links}</p>` : ""}
<p style="margin:14px 0 6px;"><a href="${esc(page)}" style="color:#121826;font-weight:600;">All ${esc(place)} bond auctions on Afronomics</a></p>`,
    `<em>Information, not advice.</em> Afronomics compiles and checks; the ${esc(market.publisher)} is the source.<br>
You get this because an Afronomics API key (pilot or paid) is registered to this address. <a href="${esc(stop)}" style="color:#636b7d;">Stop these emails</a>`,
  );
  return { subject, text, html, unsubscribe: stop };
}
