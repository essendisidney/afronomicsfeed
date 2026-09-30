import { bondStory, tbillStory } from "@/lib/data/auction-stories";
import { auctionCurve, loadBonds } from "@/lib/data/kenya-bonds";
import { tenorLabel } from "@/lib/data/kenya-tbills";
import { billMarkets, billTenors, getBillMarket, latestBills, loadBillMarket } from "@/lib/data/sovereign-bills";
import { bpsNote, pct, renderCard, type Card } from "@/lib/og-card";

const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

/** Latest 364-day rate in every market: the monitor card, the Weekly card and the chart of the week. */
export function monitorBars() {
  return billMarkets.flatMap((market) => {
    const latest = latestBills(loadBillMarket(market.slug).rows).get(364);
    return latest ? [{ label: market.iso, value: latest.latest.rate, display: pct(latest.latest.rate, 1), date: latest.latest.date }] : [];
  });
}

export function monitorCard(kicker = "Africa T-bill monitor", title = "364-day Treasury bill rates across five African markets"): Promise<Response> {
  const bars = monitorBars();
  const newest = bars.map((b) => b.date).sort().at(-1);
  const card: Card = {
    kicker,
    title,
    bars,
    barsCaption: `Latest primary auctions${newest ? ` to ${shortDate.format(new Date(newest))}` : ""} · central-bank data`,
    source: "Central banks of Kenya, Nigeria, Ghana, Uganda and Tanzania",
  };
  return renderCard(card);
}

export function billMarketCard(slug: string) {
  const market = getBillMarket(slug) ?? billMarkets[0];
  const { rows } = loadBillMarket(market.slug);
  const latest = latestBills(rows);
  const line = rows
    .filter((r) => r.tenor === 364)
    .slice(0, 104)
    .reverse()
    .map((r) => r.rate);
  const lead = latest.get(91)?.latest.date ?? rows[0]?.date;
  return renderCard({
    kicker: `${market.country} Treasury bills${lead ? ` · ${shortDate.format(new Date(lead))}` : ""}`,
    title: `${market.country} Treasury bill auctions: every result from the ${market.publisher}`,
    stats: billTenors.flatMap((tenor) => {
      const item = latest.get(tenor);
      return item ? [{ label: tenorLabel[tenor], value: pct(item.latest.rate), ...bpsNote(item.previous?.rate, item.latest.rate) }] : [];
    }),
    line: { values: line, caption: `364-day ${market.rateLabel.toLowerCase()}, last ${line.length} auctions · ${market.publisher}` },
    source: market.publisher,
  });
}

export function tbillAuctionCard(date: string) {
  const story = tbillStory(date);
  if (!story) return billMarketCard("kenya");
  const { rows } = loadBillMarket("kenya");
  const line = rows
    .filter((r) => r.tenor === 91 && r.date <= date)
    .slice(0, 52)
    .reverse()
    .map((r) => r.rate);
  return renderCard({
    kicker: `Kenya T-bill auction · ${shortDate.format(new Date(date))}`,
    title: story.headline.replace(/^Kenya T-bill auction, [^:]+: /, "Kenya ").replace(/^Kenya (\d)/, "Kenya’s $1"),
    stats: story.week.rows.map((row) => {
      const prev = story.older?.rows.find((r) => r.tenor === row.tenor);
      return { label: tenorLabel[row.tenor], value: pct(row.weighted_avg_rate, 3), ...bpsNote(prev?.weighted_avg_rate, row.weighted_avg_rate) };
    }),
    line: { values: line, caption: "91-day rate, previous 52 auctions · Central Bank of Kenya" },
    source: "Central Bank of Kenya",
  });
}

export function bondsCard() {
  const curve = auctionCurve();
  const bonds = curve.filter((p) => p.kind !== "T-bill");
  const pick = [curve[0], bonds[Math.floor(bonds.length / 2)], curve.at(-1)].filter(Boolean);
  return renderCard({
    kicker: "Kenya Treasury bonds · auction yield curve",
    title: "Kenya's government yield curve, from every CBK bond and bill auction",
    stats: pick.map((p) => ({ label: p!.kind === "T-bill" ? p!.label : `${p!.years.toFixed(0)} years`, value: pct(p!.rate) })),
    line: { values: curve.map((p) => p.rate), caption: "Rate by maturity: bills to 30-year bonds · Central Bank of Kenya" },
    source: "Central Bank of Kenya",
  });
}

export function bondAuctionCard(date: string) {
  const story = bondStory(date);
  if (!story) return bondsCard();
  const rows = loadBonds().rows;
  return renderCard({
    kicker: `Kenya bond auction · ${shortDate.format(new Date(date))}`,
    title: story.headline.replace(/^Kenya bond auction, [^:]+: /, "Kenya bond "),
    stats: story.rows.slice(0, 3).map((row) => {
      const prev = rows.find((r) => r.issue === row.issue && r.value_date < date && r.kind !== "switch" && r.kind !== "buyback");
      return { label: row.issue, value: pct(row.weighted_avg_rate, 2), ...bpsNote(prev?.weighted_avg_rate, row.weighted_avg_rate) };
    }),
    line: { values: auctionCurve().map((p) => p.rate), caption: "Current auction yield curve · Central Bank of Kenya" },
    source: "Central Bank of Kenya",
  });
}
