import { loadBonds, yearsToMaturity, type BondAuction } from "./kenya-bonds";
import { auctionWeeks, loadTbills, tenorLabel, type Tenor, type TbillAuction } from "./kenya-tbills";

/**
 * One page per auction, written from the numbers. Every sentence is generated from the CBK notice data
 * and the auctions before it; nothing is typed by hand or by a model.
 */

const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const fmtDate = (iso: string) => longDate.format(new Date(iso));
const bn = (m: number) => `KES ${(m / 1000).toFixed(1)}bn`;
const bpsWords = (from: number, to: number) => {
  const d = Math.round((to - from) * 100);
  return d === 0 ? "unchanged" : `${d > 0 ? "up" : "down"} ${Math.abs(d)} basis point${Math.abs(d) === 1 ? "" : "s"}`;
};

export type TbillWeek = ReturnType<typeof auctionWeeks>[number];

export function allTbillWeeks() {
  return auctionWeeks(loadTbills().rows, 100000);
}

export function tbillWeek(date: string) {
  const weeks = allTbillWeeks();
  const index = weeks.findIndex((week) => week.date === date);
  if (index < 0) return null;
  return { week: weeks[index], newer: weeks[index - 1] ?? null, older: weeks[index + 1] ?? null, weeks, index };
}

/** Rate history for one tenor over the 52 weeks up to and including `date`. */
function yearRange(rows: TbillAuction[], tenor: Tenor, date: string) {
  const from = new Date(new Date(date).getTime() - 364 * 86400000).toISOString().slice(0, 10);
  const list = rows.filter((row) => row.tenor === tenor && row.value_date <= date && row.value_date > from);
  if (list.length < 4) return null;
  const rates = list.map((row) => row.weighted_avg_rate);
  return { high: Math.max(...rates), low: Math.min(...rates), count: list.length };
}

export function tbillStory(date: string) {
  const found = tbillWeek(date);
  if (!found) return null;
  const { week, older, newer } = found;
  const all = loadTbills().rows;
  const paragraphs: string[] = [];
  const lead = week.rows.find((row) => row.tenor === 91) ?? week.rows[0];
  const leadPrev = older?.rows.find((row) => row.tenor === lead.tenor);

  const rateBits = week.rows.map((row) => {
    const prev = older?.rows.find((item) => item.tenor === row.tenor);
    return `the ${tenorLabel[row.tenor]} bill at ${row.weighted_avg_rate.toFixed(3)}%${prev ? ` (${bpsWords(prev.weighted_avg_rate, row.weighted_avg_rate)})` : ""}`;
  });
  paragraphs.push(
    `At the Treasury bill auction dated ${fmtDate(week.date)}, the Central Bank of Kenya cleared ${rateBits.join(", ").replace(/, ([^,]*)$/, " and $1")}.`,
  );

  if (week.offered && week.received) {
    const sub = week.subscription ?? 0;
    const tone = sub >= 150 ? "Demand was strong" : sub >= 100 ? "The auction was fully subscribed" : "The auction was undersubscribed";
    paragraphs.push(
      `${tone}: bids totalled ${bn(week.received)} against ${bn(week.offered)} on offer, a subscription rate of ${sub.toFixed(0)}%. The government accepted ${bn(week.accepted)}${week.received ? `, or ${((week.accepted / week.received) * 100).toFixed(0)}% of what was bid` : ""}.`,
    );
  }

  const strongest = [...week.rows].filter((row) => row.subscription_pct != null).sort((a, b) => (b.subscription_pct ?? 0) - (a.subscription_pct ?? 0))[0];
  if (strongest && week.rows.length > 1) {
    paragraphs.push(`The ${tenorLabel[strongest.tenor]} paper drew the most interest relative to its size, at ${strongest.subscription_pct!.toFixed(0)}% subscribed.`);
  }

  const range = yearRange(all, lead.tenor, week.date);
  if (range) {
    const r = lead.weighted_avg_rate;
    const where = r >= range.high ? "the highest" : r <= range.low ? "the lowest" : null;
    paragraphs.push(
      where
        ? `At ${r.toFixed(3)}%, the ${tenorLabel[lead.tenor]} rate is ${where} in the ${range.count} auctions of the past year.`
        : `Over the past year the ${tenorLabel[lead.tenor]} rate has ranged from ${range.low.toFixed(3)}% to ${range.high.toFixed(3)}%.`,
    );
  }

  const headline = `Kenya T-bill auction, ${fmtDate(week.date)}: ${tenorLabel[lead.tenor]} at ${lead.weighted_avg_rate.toFixed(3)}%${
    leadPrev ? `, ${bpsWords(leadPrev.weighted_avg_rate, lead.weighted_avg_rate).replace(/basis points?/, "bps")}` : ""
  }`;
  return { headline, paragraphs, week, older, newer };
}

// ---------------------------------------------------------------- bonds

export function bondDates() {
  return [...new Set(loadBonds().rows.map((row) => row.value_date))].sort((a, b) => b.localeCompare(a));
}

const kindWords: Record<BondAuction["kind"], string> = {
  primary: "a primary issue",
  reopening: "a re-opening",
  tap: "a tap sale",
  switch: "a switch auction",
  buyback: "a buyback",
};

export function bondStory(date: string) {
  const rows = loadBonds().rows;
  const today = rows.filter((row) => row.value_date === date);
  if (today.length === 0) return null;
  const dates = bondDates();
  const index = dates.indexOf(date);
  const newer = dates[index - 1] ?? null;
  const older = dates[index + 1] ?? null;
  const paragraphs: string[] = [];
  const kinds = [...new Set(today.map((row) => row.kind))];
  const names = today.map((row) => row.issue);
  paragraphs.push(
    `The Central Bank of Kenya's bond auction dated ${fmtDate(date)} was ${kinds.map((k) => kindWords[k]).join(" and ")} of ${names.join(", ").replace(/, ([^,]*)$/, " and $1")}.`,
  );
  const offered = today.find((row) => row.offered_total_kes_m)?.offered_total_kes_m ?? null;
  const received = today.reduce((t, r) => t + (r.received_kes_m ?? 0), 0);
  const accepted = today.reduce((t, r) => t + (r.accepted_kes_m ?? 0), 0);
  if (offered && received) {
    paragraphs.push(
      `Bids came to ${bn(received)} against ${bn(offered)} on offer (${((received / offered) * 100).toFixed(0)}% subscribed), and the Treasury accepted ${bn(accepted)}.`,
    );
  }
  for (const row of today) {
    const bits = [`${row.issue} cleared at ${row.weighted_avg_rate.toFixed(3)}%`];
    if (row.coupon != null) bits.push(`against a ${row.coupon.toFixed(3)}% coupon`);
    if (row.maturity) bits.push(`with ${yearsToMaturity(row).toFixed(1)} years to maturity`);
    const prev = rows.find((r) => r.issue === row.issue && r.value_date < date && r.kind !== "switch" && r.kind !== "buyback");
    let tail = "";
    if (prev) tail = ` Its previous sale, on ${fmtDate(prev.value_date)}, priced at ${prev.weighted_avg_rate.toFixed(3)}%, so the yield is ${bpsWords(prev.weighted_avg_rate, row.weighted_avg_rate)}.`;
    paragraphs.push(`${bits.join(", ")}.${tail}`);
  }
  const lead = [...today].sort((a, b) => (b.accepted_kes_m ?? 0) - (a.accepted_kes_m ?? 0))[0];
  const headline = `Kenya bond auction, ${fmtDate(date)}: ${lead.issue} at ${lead.weighted_avg_rate.toFixed(3)}%`;
  return { headline, paragraphs, rows: today, newer, older };
}
