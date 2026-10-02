import { billIndexLatest, indexName, indexShort } from "./data/bill-index";
import { auctionCalendar, demand, realYields } from "./data/bill-measures";
import { plainMeaning } from "./data/plain";
import { billMarkets, loadBillMarket, type BillMarket, type BillTenor } from "./data/sovereign-bills";
import { site } from "./site";

/**
 * "Ask the data": questions about African Treasury bill rates, auctions, demand, real yields and the index,
 * answered from the datasets with the source attached. Deterministic: it understands a fixed set of questions
 * and says so when it does not. No model writes the answer, so nothing is invented.
 */

export type Answer = { answer: string; sources: { label: string; href: string }[]; understood: boolean; suggestions?: string[] };

const DAY = 86400000;
const names: [RegExp, BillMarket["slug"]][] = [
  [/\bkenya|kenyan|\bkes\b|shilling(?!.*(ugand|tanzan))|cbk\b|nairobi/i, "kenya"],
  [/nigeria|naira|\bngn\b|cbn\b|lagos|abuja/i, "nigeria"],
  [/ghana|cedi|\bghs\b|accra/i, "ghana"],
  [/uganda|\bugx\b|kampala/i, "uganda"],
  [/tanzania|\btzs\b|dar es salaam|dodoma/i, "tanzania"],
  [/egypt|\begp\b|cairo/i, "egypt"],
  [/south africa|\bzar\b|rand\b|sarb|pretoria|johannesburg/i, "southafrica"],
  [/zambia|kwacha(?!.*malawi)|\bzmw\b|lusaka/i, "zambia"],
  [/malawi|\bmwk\b|lilongwe|blantyre/i, "malawi"],
  [/mozambique|metical|\bmzn\b|maputo/i, "mozambique"],
];

function marketsIn(q: string) {
  const found: BillMarket[] = [];
  for (const [re, slug] of names) {
    const m = re.exec(q);
    if (m) found.push({ ...billMarkets.find((x) => x.slug === slug)!, _at: m.index } as BillMarket & { _at: number });
  }
  return found.sort((a, b) => (a as BillMarket & { _at: number })._at - (b as BillMarket & { _at: number })._at);
}

function tenorIn(q: string): BillTenor | null {
  if (/\b(91|three[- ]month|3[- ]month|3m)\b/i.test(q)) return 91;
  if (/\b(182|six[- ]month|6[- ]month|6m)\b/i.test(q)) return 182;
  if (/\b(364|365|one[- ]year|1[- ]year|12[- ]month|1y|annual)\b/i.test(q)) return 364;
  return null;
}

function amountIn(q: string) {
  const m = /(?:kes|ksh|ngn|ghs|ugx|tzs|egp|zar|zmw|mwk|mzn|\$|usd)?\s*([\d][\d,]*(?:\.\d+)?)\s*(m|million|k|thousand|bn|billion)?/i.exec(q.replace(/(\d),(\d)/g, "$1$2"));
  if (!m) return null;
  let n = parseFloat(m[1].replace(/,/g, ""));
  const unit = (m[2] ?? "").toLowerCase();
  if (unit.startsWith("m")) n *= 1e6;
  else if (unit.startsWith("k") || unit.startsWith("th")) n *= 1e3;
  else if (unit.startsWith("b")) n *= 1e9;
  return n >= 1000 ? n : null;
}

function dateIn(q: string, today: string) {
  const iso = /(\d{4}-\d{2}-\d{2})/.exec(q)?.[1];
  if (iso) return iso;
  if (/a year ago|last year|12 months ago|year earlier/i.test(q)) return new Date(Date.parse(today) - 365 * DAY).toISOString().slice(0, 10);
  if (/six months ago|6 months ago/i.test(q)) return new Date(Date.parse(today) - 182 * DAY).toISOString().slice(0, 10);
  if (/a month ago|last month/i.test(q)) return new Date(Date.parse(today) - 30 * DAY).toISOString().slice(0, 10);
  const y = /\b(20[0-2]\d)\b/.exec(q)?.[1];
  if (y) return `${y}-12-31`;
  return null;
}

const pct = (n: number) => `${n.toFixed(2)}%`;
const fmtMoney = (cur: string, n: number) => `${cur} ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n))}`;
const fmtDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso));

function latest(m: BillMarket, tenor: BillTenor) {
  const rows = loadBillMarket(m.slug).rows.filter((r) => r.tenor === tenor);
  return { now: rows[0] ?? null, prev: rows[1] ?? null, rows };
}

export async function ask(question: string, today = new Date().toISOString().slice(0, 10)): Promise<Answer> {
  const q = question.trim();
  const ms = marketsIn(q);
  const tenor = tenorIn(q);
  const src = (m: BillMarket, href = m.href) => ({ label: `${m.publisher} auction results, compiled by Afronomics`, href: `${site.url}${href}` });
  const suggestions = ["What is Kenya's 91-day rate?", "When is the next Uganda auction?", "How much does KES 500,000 earn on the 364-day bill?", "Compare Nigeria and Ghana one-year rates", "What was Kenya's 364-day rate a year ago?", "Where is the Sovereign Bill Index?", "Which market has the highest real yield?", "Is demand strong at Kenya auctions?"];

  // The index
  if (/\b(index|asbi|average|across africa|continent)\b/i.test(q) && !ms.length) {
    const i = billIndexLatest();
    if (!i) return { answer: "The index has no reading yet.", sources: [], understood: true };
    return {
      answer: `The ${indexName} (${indexShort}) reads ${pct(i.latest.value)} for the week of ${fmtDate(i.latest.date)}: the simple average of the latest 364-day Treasury bill rate in ${i.latest.markets} African markets. That is ${i.bpsWeek == null ? "" : `${i.bpsWeek >= 0 ? "+" : ""}${i.bpsWeek} bps on the week, `}${i.bpsYear == null ? "" : `${i.bpsYear >= 0 ? "+" : ""}${i.bpsYear} bps on the year`}. Highest in the series: ${pct(i.high.value)} (${fmtDate(i.high.date)}); lowest: ${pct(i.low.value)} (${fmtDate(i.low.date)}). Highest contributor now: ${i.contributions[0]?.market.country} at ${pct(i.contributions[0]?.rate ?? 0)}; lowest: ${i.contributions.at(-1)?.market.country} at ${pct(i.contributions.at(-1)?.rate ?? 0)}.`,
      sources: [{ label: `${indexName} — method and series`, href: `${site.url}/markets/bill-index` }],
      understood: true,
    };
  }

  // Real yields / highest / lowest across markets
  if (/\b(real yield|after inflation|inflation)\b/i.test(q) || (/\b(highest|lowest|best|cheapest|most expensive|rank)\b/i.test(q) && !ms.length)) {
    const real = /real|inflation/i.test(q);
    if (real) {
      const ry = (await realYields()).filter((r) => r.real != null).sort((a, b) => (b.real ?? 0) - (a.real ?? 0));
      if (!ry.length) return { answer: "No real-yield figures are available.", sources: [], understood: true };
      const top = ry[0];
      const bottom = ry.at(-1)!;
      return {
        answer: `Highest real yield on one-year bills: ${top.market.country}, ${pct(top.real!)} (${pct(top.nominal)} nominal less ${pct(top.inflation!)} inflation, ${top.inflationYear}). Lowest: ${bottom.market.country}, ${pct(bottom.real!)}. Full ranking: ${ry.map((r) => `${r.market.country} ${pct(r.real!)}`).join(", ")}.`,
        sources: [{ label: "Borrowing-cost measures — real yields (central-bank auctions and World Bank inflation)", href: `${site.url}/markets/borrowing-costs` }],
        understood: true,
      };
    }
    const t = tenor ?? 364;
    const list = billMarkets
      .map((m) => ({ m, r: latest(m, t).now }))
      .filter((x) => x.r)
      .sort((a, b) => b.r!.rate - a.r!.rate);
    return {
      answer: `${t}-day Treasury bill rates, highest to lowest: ${list.map((x) => `${x.m.country} ${pct(x.r!.rate)} (${x.r!.date})`).join(", ")}.`,
      sources: [{ label: "T-bill monitor, ten markets", href: `${site.url}/markets/tbills` }],
      understood: true,
    };
  }

  if (!ms.length) {
    return {
      answer: `I answer from the Afronomics datasets only: Treasury bill rates and auction results in ${billMarkets.map((m) => m.country).join(", ")}, when each market's next auction is expected, auction demand, real yields, what a sum would earn, and the Sovereign Bill Index. Name a market and I will look it up.`,
      sources: [],
      understood: false,
      suggestions,
    };
  }

  const m = ms[0];
  const t = tenor ?? 364;
  const srcs = [src(m)];

  // Next auction
  if (/\b(next|when|upcoming|calendar|due|expected)\b/i.test(q) && !/\b(rate|yield)\b.*\b(a year ago|last year)\b/i.test(q)) {
    const n = auctionCalendar(new Date(today)).find((x) => x.market.slug === m.slug);
    if (!n) return { answer: `${m.country}'s auction rhythm is not regular enough to project a date from the data.`, sources: srcs, understood: true };
    return {
      answer: `${m.country}'s next Treasury bill result is expected around ${fmtDate(n.expected)}: the ${m.publisher} has been publishing every ${n.cadenceDays} days, and the last result in the dataset is dated ${fmtDate(n.last)}. This is projected from the auction rhythm, not an official calendar.`,
      sources: [...srcs, { label: "Auction calendar method", href: `${site.url}/markets/borrowing-costs` }],
      understood: true,
    };
  }

  // Demand
  if (/\b(demand|subscri|bids?|oversubscri|undersubscri|appetite|cover)\b/i.test(q)) {
    const d = demand().find((x) => x.market.slug === m.slug);
    if (!d || d.ratio == null) return { answer: `${m.country}'s auction results in the dataset do not include the amounts bid, so demand cannot be measured there.`, sources: srcs, understood: true };
    return {
      answer: `At ${m.country}'s auctions over the last 90 days, bids have run at ${d.ratio.toFixed(2)}× the amount ${d.basis} (median per auction)${d.previous != null ? `, against ${d.previous.toFixed(2)}× in the 90 days before` : ""}: ${d.ratio >= 1.5 ? "strong demand" : d.ratio >= 1 ? "auctions covered" : "auctions undersubscribed"}.`,
      sources: [...srcs, { label: "Demand measure", href: `${site.url}/markets/borrowing-costs` }],
      understood: true,
    };
  }

  // Compare two markets
  if (ms.length >= 2) {
    const parts = ms.slice(0, 4).map((x) => {
      const l = latest(x, t).now;
      return l ? `${x.country} ${pct(l.rate)} (${l.date})` : `${x.country}: no ${t}-day result`;
    });
    const sorted = ms.map((x) => ({ x, l: latest(x, t).now })).filter((a) => a.l).sort((a, b) => b.l!.rate - a.l!.rate);
    const gap = sorted.length >= 2 ? Math.round((sorted[0].l!.rate - sorted[sorted.length - 1].l!.rate) * 100) : null;
    return {
      answer: `${t}-day Treasury bills: ${parts.join("; ")}.${gap != null ? ` ${sorted[0].x.country} pays ${gap} basis points more than ${sorted[sorted.length - 1].x.country}.` : ""}`,
      sources: ms.map((x) => src(x)),
      understood: true,
    };
  }

  // What would a sum earn
  const amount = amountIn(q);
  if (amount && /\b(earn|interest|return|get|make|invest|put)\b/i.test(q)) {
    const l = latest(m, t);
    if (!l.now) return { answer: `No ${t}-day result for ${m.country} in the dataset.`, sources: srcs, understood: true };
    const pm = plainMeaning({ currency: m.currency, iso: m.iso, country: m.country, rows: [{ tenor: t, rate: l.now.rate, prev: l.prev?.rate ?? null }] })!;
    const scale = amount / pm.amount;
    return {
      answer: `${fmtMoney(m.currency, amount)} in ${m.country}'s ${t}-day bill at the latest rate (${pct(l.now.rate)}, auction of ${fmtDate(l.now.date)}) earns ${fmtMoney(m.currency, pm.take * scale)} over ${pm.months} months${pm.taxRate != null ? ` after ${Math.round(pm.taxRate * 100)}% withholding tax (${fmtMoney(m.currency, pm.gross * scale)} before tax)` : " before any withholding tax"}, and you get back ${fmtMoney(m.currency, amount + pm.take * scale)} at maturity. Arithmetic on the published rate; information, not advice.`,
      sources: srcs,
      understood: true,
    };
  }

  // Historical rate
  const when = dateIn(q, today);
  if (when && when < today) {
    const rows = loadBillMarket(m.slug).rows.filter((r) => r.tenor === t);
    const then = rows.find((r) => r.date <= when);
    const now = rows[0];
    if (!then) return { answer: `${m.country}'s ${t}-day history in the dataset starts after ${fmtDate(when)} (first result: ${rows.at(-1)?.date ?? "none"}).`, sources: srcs, understood: true };
    return {
      answer: `${m.country}'s ${t}-day Treasury bill cleared at ${pct(then.rate)} at the auction of ${fmtDate(then.date)}, the latest result on or before ${fmtDate(when)}.${now ? ` The latest is ${pct(now.rate)} (${fmtDate(now.date)}), ${Math.round((now.rate - then.rate) * 100) >= 0 ? "+" : ""}${Math.round((now.rate - then.rate) * 100)} bps since.` : ""}`,
      sources: [...srcs, { label: `${m.country} auction of ${then.date}`, href: `${site.url}${m.slug === "kenya" ? `/markets/kenya-tbills/${then.date}` : `/markets/tbills/${m.slug}/${then.date}`}` }],
      understood: true,
    };
  }

  // Current rate (default)
  const l = latest(m, t);
  if (!l.now) return { answer: `No ${t}-day result for ${m.country} in the dataset.`, sources: srcs, understood: true };
  const all = [91, 182, 364].map((x) => ({ x, r: latest(m, x as BillTenor).now })).filter((a) => a.r);
  const bps = l.prev ? Math.round((l.now.rate - l.prev.rate) * 100) : null;
  return {
    answer: `${m.country}'s ${t}-day Treasury bill rate is ${pct(l.now.rate)}, the ${m.rateNote} at the auction of ${fmtDate(l.now.date)}${bps == null ? "" : bps === 0 ? ", unchanged from the previous auction" : `, ${bps > 0 ? "up" : "down"} ${Math.abs(bps)} bps from the previous auction`}. All tenors: ${all.map((a) => `${a.x}-day ${pct(a.r!.rate)}`).join(", ")}.`,
    sources: [...srcs, { label: `${m.country} auction page, ${l.now.date}`, href: `${site.url}${m.slug === "kenya" ? `/markets/kenya-tbills/${l.now.date}` : `/markets/tbills/${m.slug}/${l.now.date}`}` }],
    understood: true,
  };
}
