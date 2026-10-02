import { rpcRead } from "@/lib/store";
import { auctionCalendar } from "@/lib/data/bill-measures";
import { currencyName, loadFxQuote } from "@/lib/data/fx";
import { billMarkets, loadBillMarket, type BillMarket } from "@/lib/data/sovereign-bills";
import { loadBonds, yearsToMaturity } from "@/lib/data/kenya-bonds";
import { loadWire, type WireDesk, type WireItem } from "@/lib/data/wire";

/**
 * The Afronomics Morning: the numbers that moved overnight, the results that landed, the headlines that
 * matter and what is due today. Every line is generated from a published figure or headline; nothing is
 * written by hand. Built at 07:00 Nairobi each weekday and sent by email, posted to the site and to LinkedIn.
 */

const DAY = 86400000;
const NAIROBI = 3 * 3600000;

export type MorningFx = { code: string; name: string; now: number; prev: number; changePct: number; prevDay: string };
export type MorningAuction = { market: BillMarket; date: string; tenor: number; rate: number; bps: number | null; source: string };
export type MorningDue = { market: BillMarket; expected: string };
export type MorningBond = { date: string; issue: string; years: number; rate: number; coupon: number | null; accepted: number | null; bidToCover: number | null; source: string };

export type MorningNote = {
  day: string; // YYYY-MM-DD, Nairobi
  generatedAt: string;
  fx: { moves: MorningFx[]; asOf: string | null };
  auctions: MorningAuction[]; // results published in the last 24 hours (by value date, since last business day)
  due: MorningDue[]; // markets expected to report today or tomorrow
  stories: WireItem[];
  board: { market: BillMarket; rate: number; date: string }[]; // latest 364-day rate per market, for the strip
  bonds: MorningBond[]; // Kenya bond auctions settled since the last note
};

export function nairobiDay(now: number) {
  return new Date(now + NAIROBI).toISOString().slice(0, 10);
}

async function overnightFx(): Promise<MorningNote["fx"]> {
  const [history, quote] = await Promise.all([rpcRead("af_fx_history", { p_days: 6 }, 1800), loadFxQuote()]);
  if (!history.ok || !Array.isArray(history.value) || !quote) return { moves: [], asOf: null };
  const rows = history.value as { day: string; code: string; rate: number | string }[];
  const days = [...new Set(rows.map((r) => r.day))].sort();
  if (days.length < 2) return { moves: [], asOf: days.at(-1) ?? null };
  const last = days.at(-1)!;
  const prevDay = days.at(-2)!;
  const at = (day: string) => new Map(rows.filter((r) => r.day === day).map((r) => [r.code, Number(r.rate)]));
  const now = at(last);
  const prev = at(prevDay);
  // The currencies that are traded enough for an overnight reference move to mean something; thinly quoted
  // currencies (SDG, SSP, and the like) swing on the reference feed without any market moving.
  const watch = ["KES", "NGN", "ZAR", "GHS", "EGP", "ETB", "TZS", "UGX", "RWF", "MAD", "XOF", "XAF", "ZMW", "MWK", "MZN", "BWP", "MUR", "NAD", "TND", "DZD", "AOA", "CDF"];
  const moves: MorningFx[] = [];
  for (const { code } of quote.codes) {
    if (!watch.includes(code)) continue;
    const a = prev.get(code);
    const b = now.get(code);
    if (!a || !b) continue;
    moves.push({ code, name: currencyName(code), now: b, prev: a, changePct: (a / b - 1) * 100, prevDay });
  }
  moves.sort((x, y) => Math.abs(y.changePct) - Math.abs(x.changePct));
  return { moves, asOf: last };
}

/** Headlines from the last 24 hours, one per desk first, then the rest, no publisher more than twice. */
function pickStories(items: WireItem[], now: number, limit = 6) {
  const promo = /\b(programme|program|MBA|webinar|masterclass|sponsored|partner content|advertorial|course|scholarship|award nominations?|podcast|quiz|horoscope)\b/i;
  const recent = items.filter((item) => now - Date.parse(item.publishedAt) < 26 * 3600000 && !promo.test(item.title) && item.countries.length > 0);
  const desks: WireDesk[] = ["markets", "economy", "capital", "policy", "trade", "technology", "climate"];
  const out: WireItem[] = [];
  const used = new Set<string>();
  const perPublisher = new Map<string, number>();
  for (let round = 0; out.length < limit && round < 3; round += 1) {
    for (const desk of desks) {
      const pick = recent.find((item) => item.desks.includes(desk) && !used.has(item.id) && (perPublisher.get(item.publisher) ?? 0) < 2);
      if (!pick) continue;
      used.add(pick.id);
      perPublisher.set(pick.publisher, (perPublisher.get(pick.publisher) ?? 0) + 1);
      out.push(pick);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export async function buildMorningNote(now: number): Promise<MorningNote> {
  const day = nairobiDay(now);
  const [wire, fx] = await Promise.all([loadWire(), overnightFx()]);

  // Results since the last business day: Monday's note covers Friday's auctions.
  const dow = new Date(now + NAIROBI).getUTCDay();
  const lookback = dow === 1 ? 3 : 1;
  const since = new Date(now - lookback * DAY).toISOString().slice(0, 10);
  const auctions: MorningAuction[] = [];
  const board: MorningNote["board"] = [];
  for (const market of billMarkets) {
    const { rows } = loadBillMarket(market.slug);
    if (!rows.length) continue;
    const latest364 = rows.find((r) => r.tenor === 364);
    if (latest364) board.push({ market, rate: latest364.rate, date: latest364.date });
    const newest = rows[0].date;
    if (newest >= since && newest <= day) {
      for (const tenor of [91, 182, 364]) {
        const row = rows.find((r) => r.tenor === tenor && r.date === newest);
        if (!row) continue;
        const prev = rows.find((r) => r.tenor === tenor && r.date < newest);
        auctions.push({ market, date: newest, tenor, rate: row.rate, bps: prev ? Math.round((row.rate - prev.rate) * 100) : null, source: row.source });
      }
    }
  }

  const bonds: MorningBond[] = loadBonds()
    .rows.filter((r) => r.value_date >= since && r.value_date <= day && r.kind !== "buyback")
    .map((r) => ({ date: r.value_date, issue: r.issue, years: yearsToMaturity(r), rate: r.weighted_avg_rate, coupon: r.coupon, accepted: r.accepted_kes_m, bidToCover: r.bid_to_cover, source: r.source }));

  const tomorrow = new Date(now + DAY + NAIROBI).toISOString().slice(0, 10);
  const due = auctionCalendar(new Date(now)).filter((c) => c.expected === day || c.expected === tomorrow).map((c) => ({ market: c.market, expected: c.expected }));

  return { day, generatedAt: new Date(now).toISOString(), fx, auctions, due, stories: pickStories(wire, now), board, bonds };
}

const longDate = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
const signed = (v: number, d = 2) => `${v > 0 ? "+" : v < 0 ? "−" : "±"}${Math.abs(v).toFixed(d)}`;

/** The note in a few sentences: the email preheader, the page lede and the top of the LinkedIn post. */
export function morningLines(note: MorningNote): string[] {
  const lines: string[] = [];
  const lead = note.auctions.filter((a) => a.tenor === 364)[0] ?? note.auctions[0];
  if (lead) {
    const move = lead.bps == null ? "" : lead.bps === 0 ? ", unchanged" : `, ${lead.bps > 0 ? "up" : "down"} ${Math.abs(lead.bps)} bps`;
    lines.push(`${lead.market.country}’s ${lead.tenor}-day Treasury bill cleared at ${lead.rate.toFixed(2)}%${move}.`);
  }
  const bond = note.bonds[0];
  if (bond) {
    lines.push(`Kenya’s ${bond.issue} bond (${bond.years.toFixed(1)} years) cleared at ${bond.rate.toFixed(2)}%${bond.bidToCover ? `, ${bond.bidToCover.toFixed(2)}× covered` : ""}.`);
  }
  const fx = note.fx.moves[0];
  if (fx && Math.abs(fx.changePct) >= 0.15) {
    lines.push(`The ${fx.name} ${fx.changePct > 0 ? "gained" : "lost"} ${Math.abs(fx.changePct).toFixed(2)}% against the dollar overnight.`);
  }
  if (note.due.length) {
    lines.push(`Results due: ${note.due.map((d) => `${d.market.country} (${d.expected === note.day ? "today" : "tomorrow"})`).join(", ")}.`);
  }
  return lines;
}

export function morningSubject(note: MorningNote) {
  const lead = morningLines(note)[0];
  return lead ? `Morning: ${lead.replace(/\.$/, "")}` : `The Afronomics Morning, ${longDate.format(new Date(note.day))}`;
}

export function morningTitle(note: MorningNote) {
  return `The Afronomics Morning, ${longDate.format(new Date(note.day))}`;
}

/** Plain-text version for LinkedIn and the text part of the email. */
export function morningText(note: MorningNote, utm = "utm_source=linkedin&utm_medium=social&utm_campaign=morning") {
  const fx = note.fx.moves
    .slice(0, 5)
    .map((m) => `• ${m.name} ${m.now.toFixed(2)}/$ (${signed(m.changePct)}%)`)
    .join("\n");
  const auctions = note.auctions.map((a) => `• ${a.market.country} ${a.tenor}-day: ${a.rate.toFixed(2)}%${a.bps == null ? "" : ` (${signed(a.bps, 0)} bps)`}`).join("\n");
  const stories = note.stories
    .slice(0, 4)
    .map((s) => `• ${s.title} (${s.publisher})`)
    .join("\n");
  const due = note.due.map((d) => `• ${d.market.country}: ${d.expected === note.day ? "today" : "tomorrow"}`).join("\n");
  const bonds = note.bonds.map((b) => `• Kenya ${b.issue} (${b.years.toFixed(1)}y): ${b.rate.toFixed(2)}%${b.coupon != null ? `, coupon ${b.coupon.toFixed(2)}%` : ""}`).join("\n");
  return [
    morningTitle(note),
    morningLines(note).join(" "),
    fx ? `Overnight, against the dollar\n${fx}` : "",
    auctions ? `Auction results in\n${auctions}` : "",
    bonds ? `Bond auctions settled\n${bonds}` : "",
    due ? `Due\n${due}` : "",
    stories ? `Headlines\n${stories}` : "",
    `Numbers, charts and sources: https://www.afronomicsfeed.com/morning?${utm}`,
    "#Africa #Markets #Finance #Afronomics",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 2900);
}

/** The Morning for WhatsApp: short, *bold* section marks, no hashtags, one link. */
export function morningWhatsApp(note: MorningNote, utm = "utm_source=whatsapp&utm_medium=share&utm_campaign=morning") {
  const fx = note.fx.moves
    .slice(0, 5)
    .map((m) => `• ${m.name} ${m.now.toFixed(2)}/$ (${signed(m.changePct)}%)`)
    .join("\n");
  const auctions = note.auctions.map((a) => `• ${a.market.country} ${a.tenor}-day: ${a.rate.toFixed(2)}%${a.bps == null ? "" : ` (${signed(a.bps, 0)} bps)`}`).join("\n");
  const due = note.due.map((d) => `• ${d.market.country}: ${d.expected === note.day ? "today" : "tomorrow"}`).join("\n");
  const board = note.board
    .slice(0, 10)
    .map((b) => `${b.market.iso} ${b.rate.toFixed(2)}%`)
    .join(" · ");
  return [
    `*${morningTitle(note)}*`,
    morningLines(note).join(" "),
    fx ? `*Overnight, against the dollar*\n${fx}` : "",
    auctions ? `*Auction results in*\n${auctions}` : "",
    due ? `*Due*\n${due}` : "",
    board ? `*364-day bills, latest*\n${board}` : "",
    `Numbers, charts and sources: https://www.afronomicsfeed.com/morning?${utm}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export { longDate as morningLongDate, shortDate as morningShortDate, signed as morningSigned };
