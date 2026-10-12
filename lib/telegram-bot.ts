import { loadHealth } from "@/lib/data/health";
import { fundLeague } from "@/lib/data/kenya-rates";
import { policyBoard } from "@/lib/data/policy-rates";
import { corridorsTo, countryName, loadRemittances, periodLabel } from "@/lib/data/remittances";
import { billMarkets, latestBills, loadBillMarket, type BillMarket } from "@/lib/data/sovereign-bills";

/**
 * Replies for the Telegram bot (@AfronomicsFeedBot): the latest figures the site shows, answered in a chat.
 * Every reply names its source, links to the page behind it, and ends "Information, not advice." Nothing here
 * recommends a product; figures the data health check doubts are left out, as on the site.
 */

const SITE = "https://afronomicsfeed.com";
const FOOT = "<i>Information, not advice.</i>";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const link = (path: string, label: string, campaign: string) =>
  `<a href="${SITE}${path}${path.includes("?") ? "&" : "?"}utm_source=telegram&utm_medium=bot&utm_campaign=${campaign}">${esc(label)}</a>`;
const pct = (n: number) => `${n.toFixed(2)}%`;
const day = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const withStatus = (area: string, ...statuses: string[]) =>
  new Set((loadHealth()?.items ?? []).filter((x) => x.area === area && statuses.includes(x.status)).map((x) => x.name));
const doubted = (area: string) => withStatus(area, "late", "failed");
/** T-bills: a "late" market is the publisher's delay, so its last result still stands; only a failed read is hidden. */
const billsFailed = () => withStatus("T-bill auctions", "failed");
const billsLate = () => withStatus("T-bill auctions", "late");

const ALIASES: Record<string, BillMarket["slug"]> = {
  kenya: "kenya", ke: "kenya", nigeria: "nigeria", ng: "nigeria", naija: "nigeria", ghana: "ghana", gh: "ghana",
  uganda: "uganda", ug: "uganda", tanzania: "tanzania", tz: "tanzania", egypt: "egypt", eg: "egypt",
  southafrica: "southafrica", south_africa: "southafrica", "south africa": "southafrica", sa: "southafrica", za: "southafrica",
  zambia: "zambia", zm: "zambia", malawi: "malawi", mw: "malawi", mozambique: "mozambique", mz: "mozambique",
};

export const COMMANDS = [
  { command: "kenya", description: "Kenya T-bill rates (also /nigeria, /ghana, /uganda…)" },
  { command: "tbills", description: "Latest T-bill rates in all 10 markets" },
  { command: "policy", description: "Every African central-bank policy rate" },
  { command: "funds", description: "Kenya money market funds, after tax" },
  { command: "send", description: "Cheapest way to send money, e.g. /send kenya" },
  { command: "help", description: "What I can tell you" },
];

function help(): string {
  return [
    "👋 <b>Afronomics</b>: the price of money in Africa, from the central banks.",
    "",
    "/kenya, /nigeria, /ghana, /uganda, /tanzania, /egypt, /southafrica, /zambia, /malawi, /mozambique: latest T-bill rates",
    "/tbills: all 10 markets at once",
    "/policy: every central-bank policy rate",
    "/funds: Kenya money market funds, after tax",
    "/send kenya: cheapest way to send $200 to a country",
    "",
    'New results as they land: <a href="https://t.me/afronomic">t.me/afronomic</a>',
    "",
    FOOT,
  ].join("\n");
}

function market(slug: BillMarket["slug"]): string {
  const m = billMarkets.find((x) => x.slug === slug)!;
  if (billsFailed().has(m.country)) {
    return `${esc(m.country)}'s latest T-bill figures are being checked and are not shown for now. ${link(m.href, "See the page", `bot-${slug}`)}\n\n${FOOT}`;
  }
  const latest = latestBills(loadBillMarket(slug).rows);
  const lines = [...latest.entries()].map(([tenor, { latest: now, previous }]) => {
    const move = previous ? now.rate - previous.rate : null;
    const change = move == null ? "" : Math.abs(move) < 0.005 ? " (unchanged)" : ` (${move > 0 ? "up" : "down"} ${Math.abs(move).toFixed(2)} points)`;
    return `${tenor}-day: <b>${pct(now.rate)}</b>${change}, ${day(now.date)}`;
  });
  if (!lines.length) return `No ${esc(m.country)} T-bill results on file yet.\n\n${FOOT}`;
  return [
    `📊 <b>${esc(m.country)} Treasury bills</b>`,
    "",
    ...lines,
    "",
    `${esc(m.rateLabel)}; change against the auction before. Source: ${esc(m.publisher)}.`,
    ...(billsLate().has(m.country) ? [`The ${esc(m.publisher)} has not published a newer result yet.`] : []),
    link(m.href, "Full results and history", `bot-${slug}`),
    "",
    FOOT,
  ].join("\n");
}

function allBills(): string {
  const failed = billsFailed();
  const late = billsLate();
  const lines = billMarkets.flatMap((m) => {
    if (failed.has(m.country)) return [];
    const latest = latestBills(loadBillMarket(m.slug).rows);
    const short = latest.get(91) ?? [...latest.values()][0];
    const year = latest.get(364);
    if (!short) return [];
    const parts = [`91-day ${pct(short.latest.rate)}`];
    if (year) parts.push(`364-day ${pct(year.latest.rate)}`);
    return [`<b>${esc(m.country)}</b>: ${parts.join(", ")} (${day((year ?? short).latest.date)}${late.has(m.country) ? ", no newer result yet" : ""})`];
  });
  return [
    "📊 <b>T-bill rates across Africa</b>, latest auction in each market",
    "",
    ...lines,
    "",
    "Each central bank's own figure. Send a country, e.g. /ghana, for all tenors and the change.",
    link("/markets/tbills", "All markets compared", "bot-tbills"),
    "",
    FOOT,
  ].join("\n");
}

function policy(): string {
  const { rows } = policyBoard();
  const lines = [...rows].sort((a, b) => b.rate - a.rate).map((r) => `<b>${esc(r.market_name)}</b>: ${pct(r.rate)}${r.upper != null ? `–${pct(r.upper)}` : ""}`);
  return [
    "🏦 <b>Central-bank policy rates</b>, as each bank's website shows them",
    "",
    ...lines,
    "",
    link("/rates/policy", "Every rate with its source and the T-bill beside it", "bot-policy"),
    "",
    FOOT,
  ].join("\n");
}

function funds(): string {
  const stale = doubted("Money market funds");
  const rows = fundLeague().filter((f) => !stale.has(f.name));
  if (!rows.length) return `No Kenyan fund yields could be confirmed today.\n\n${FOOT}`;
  const lines = rows.map((f, i) => `${i + 1}. ${esc(f.name)}: <b>${pct(f.net)}</b> after tax (${pct(f.gross)} before), read ${day(f.readOn)}`);
  return [
    "💰 <b>Kenya money market funds</b>, ranked by what a saver keeps after the 15% withholding tax",
    "",
    ...lines,
    "",
    `Yields as each manager publishes them; past yields do not promise future ones. Only funds whose current yield we could confirm are listed${stale.size ? ` (${stale.size} left out until their managers update)` : ""}.`,
    link("/rates/kenya/money-market-funds", "The full table", "bot-funds"),
    "",
    FOOT,
  ].join("\n");
}

function send(arg: string): string {
  const slug = arg.trim().toLowerCase().replace(/[^a-z ]/g, "").trim().replace(/\s+/g, "-");
  if (!slug) return "Which country are you sending to? For example: /send kenya, /send nigeria, /send ghana";
  const corridors = corridorsTo(slug).filter((c) => c.services >= 5).slice(0, 6);
  if (!corridors.length) return `I have no World Bank prices for sending to “${esc(arg)}”. Try /send kenya, /send nigeria or /send ghana.\n\n${FOOT}`;
  const usd = (p: number) => `$${((200 * p) / 100).toFixed(2)}`;
  const file = loadRemittances();
  const lines = corridors.map((c) => `From <b>${esc(countryName(c.src_name))}</b>: cheapest ${usd(c.cheapest.cost_pct)} (${esc(c.cheapest.firm)}), average ${usd(c.avg_cost_pct)}`);
  return [
    `💸 <b>Sending $200 to ${esc(countryName(corridors[0].dst_name))}</b>: fee plus exchange-rate margin`,
    "",
    ...lines,
    "",
    `World Bank survey, ${file ? esc(periodLabel(file.period)) : "latest"}; check the provider's live price before you send.`,
    link(`/send-money/${slug}`, "Every service ranked by cost", `bot-send-${slug}`),
    "",
    FOOT,
  ].join("\n");
}

/** The reply to one message, and the name the request is counted under (no message content is kept). */
export function reply(text: string): { text: string; name: string } {
  const raw = text.trim();
  const m = raw.match(/^\/([a-z_]+)(?:@\w+)?\s*(.*)$/i);
  const cmd = (m ? m[1] : raw).toLowerCase();
  const arg = m ? m[2] : "";
  if (cmd === "start" || cmd === "help") return { text: help(), name: "help" };
  if (cmd === "tbills" || cmd === "bills" || cmd === "rates") return { text: allBills(), name: "tbills" };
  if (cmd === "policy" || cmd === "cbr" || cmd === "mpr") return { text: policy(), name: "policy" };
  if (cmd === "funds" || cmd === "mmf" || cmd === "mmfs") return { text: funds(), name: "funds" };
  if (cmd === "send") return { text: send(arg), name: "send" };
  const slug = ALIASES[cmd] ?? ALIASES[raw.toLowerCase()];
  if (slug) return { text: market(slug), name: slug };
  if (/^send\s+/i.test(raw)) return { text: send(raw.replace(/^send\s+(money\s+)?(to\s+)?/i, "")), name: "send" };
  return { text: `I didn't catch that.\n\n${help()}`, name: "unknown" };
}
