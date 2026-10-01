import { billWeeks, getBillMarket, loadBillMarket, type BillMarket, type BillRow, type BillTenor } from "./sovereign-bills";

/**
 * One page per auction in every market, written from the numbers. Each sentence comes from the central bank's
 * published result and the auctions before it; nothing is typed by hand or by a model. Kenya keeps its richer
 * page under /markets/kenya-tbills; this covers the other nine markets at /markets/tbills/<market>/<date>.
 */

const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const fmtDate = (iso: string) => longDate.format(new Date(iso));
const bpsWords = (from: number, to: number) => {
  const d = Math.round((to - from) * 100);
  return d === 0 ? "unchanged" : `${d > 0 ? "up" : "down"} ${Math.abs(d)} basis point${Math.abs(d) === 1 ? "" : "s"}`;
};
const tenorWord = (t: number) => `${t}-day`;

export type MarketWeek = ReturnType<typeof billWeeks>[number];

export function marketDates(slug: BillMarket["slug"]) {
  return billWeeks(loadBillMarket(slug).rows, 100000);
}

function money(market: BillMarket, m: number) {
  return m >= 1000 ? `${market.currency} ${(m / 1000).toFixed(1)}bn` : `${market.currency} ${m.toFixed(0)}m`;
}

function yearRange(rows: BillRow[], tenor: BillTenor, date: string) {
  const from = new Date(new Date(date).getTime() - 364 * 86400000).toISOString().slice(0, 10);
  const list = rows.filter((r) => r.tenor === tenor && r.date <= date && r.date > from);
  if (list.length < 4) return null;
  const rates = list.map((r) => r.rate);
  return { high: Math.max(...rates), low: Math.min(...rates), count: list.length };
}

export function marketStory(slug: string, date: string) {
  const market = getBillMarket(slug);
  if (!market || market.slug === "kenya") return null;
  const weeks = marketDates(market.slug);
  const index = weeks.findIndex((w) => w.date === date);
  if (index < 0) return null;
  const week = weeks[index];
  const newer = weeks[index - 1] ?? null;
  const older = weeks[index + 1] ?? null;
  const all = loadBillMarket(market.slug).rows;
  const paragraphs: string[] = [];

  const lead = week.rows.find((r) => r.tenor === 364) ?? week.rows.find((r) => r.tenor === 91) ?? week.rows[0];
  const prevOf = (tenor: BillTenor) => all.find((r) => r.tenor === tenor && r.date < week.date);
  const leadPrev = prevOf(lead.tenor);

  const bits = week.rows.map((r) => {
    const prev = prevOf(r.tenor);
    return `the ${tenorWord(r.tenor)} bill at ${r.rate.toFixed(2)}%${prev ? ` (${bpsWords(prev.rate, r.rate)})` : ""}`;
  });
  paragraphs.push(`At the Treasury bill auction dated ${fmtDate(week.date)}, the ${market.publisher} ${market.slug === "nigeria" ? "set stop rates on" : "cleared"} ${bits.join(", ").replace(/, ([^,]*)$/, " and $1")}. The rate shown is the ${market.rateNote}.`);

  if (week.received && (week.offered || week.accepted)) {
    if (week.offered) {
      const sub = (week.received / week.offered) * 100;
      const tone = sub >= 150 ? "Demand was strong" : sub >= 100 ? "The auction was fully subscribed" : "The auction was undersubscribed";
      paragraphs.push(
        `${tone}: bids totalled ${money(market, week.received)} against ${money(market, week.offered)} on offer, ${sub.toFixed(0)}% of the amount sought${week.accepted ? `, and ${money(market, week.accepted)} was accepted` : ""}.`,
      );
    } else if (week.accepted) {
      paragraphs.push(`Bids totalled ${money(market, week.received)} and ${money(market, week.accepted)} was accepted, ${((week.accepted / week.received) * 100).toFixed(0)}% of what was bid.`);
    }
  }

  const range = yearRange(all, lead.tenor, week.date);
  if (range) {
    const where = lead.rate >= range.high ? "the highest" : lead.rate <= range.low ? "the lowest" : null;
    paragraphs.push(
      where
        ? `At ${lead.rate.toFixed(2)}%, the ${tenorWord(lead.tenor)} rate is ${where} in the ${range.count} auctions of the past year.`
        : `Over the past year the ${tenorWord(lead.tenor)} rate has ranged from ${range.low.toFixed(2)}% to ${range.high.toFixed(2)}%.`,
    );
  }

  // Twelve-month move on the lead tenor, where the history allows it.
  const yearAgo = new Date(new Date(week.date).getTime() - 365 * 86400000).toISOString().slice(0, 10);
  const then = all.find((r) => r.tenor === lead.tenor && r.date <= yearAgo);
  if (then) {
    const d = Math.round((lead.rate - then.rate) * 100);
    paragraphs.push(
      d === 0
        ? `A year earlier the ${tenorWord(lead.tenor)} bill cleared at the same ${then.rate.toFixed(2)}%.`
        : `A year earlier the ${tenorWord(lead.tenor)} bill cleared at ${then.rate.toFixed(2)}%, so the government is paying ${Math.abs(d)} basis point${Math.abs(d) === 1 ? "" : "s"} ${d > 0 ? "more" : "less"} than twelve months ago.`,
    );
  }

  const headline = `${market.country} T-bill auction, ${fmtDate(week.date)}: ${tenorWord(lead.tenor)} at ${lead.rate.toFixed(2)}%${
    leadPrev ? `, ${bpsWords(leadPrev.rate, lead.rate).replace(/basis points?/, "bps")}` : ""
  }`;
  return { market, headline, paragraphs, week, older, newer, lead, prevOf };
}
