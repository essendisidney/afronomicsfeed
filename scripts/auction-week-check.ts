/**
 * Self-check for lib/data/auction-week.ts: the fixture with known answers, then invariants on the live data.
 * Run from the repo root: node node_modules/.bin/jiti scripts/auction-week-check.ts   (exit 1 on any failure)
 */
import { auctionWeekSelfCheck, loadAuctionResults, buildAuctionWeek } from "../lib/data/auction-week";

const fails = auctionWeekSelfCheck();

const { results, markets } = loadAuctionResults();
const w = buildAuctionWeek(results, markets);
if (!w) fails.push("live data: no week");
else {
  const inWindow = results.filter((r) => r.date >= w.window.start && r.date <= w.window.end);
  if (inWindow.length !== w.resultCount) fails.push(`live: ${inWindow.length} rows in window, page counts ${w.resultCount}`);
  if (!results.some((r) => r.date === w.window.end)) fails.push("live: window end is not a result date");
  if (results.some((r) => r.date > w.window.end)) fails.push("live: a result is newer than the window end");
  const sum = w.markets.reduce((n, m) => n + m.results.length, 0);
  if (sum !== w.resultCount) fails.push(`live: cards hold ${sum} results, headline says ${w.resultCount}`);
  for (const m of w.markets)
    for (const r of m.results) {
      if (r.prev && r.prev.date >= r.date) fails.push(`live: ${m.meta.key} ${r.series} previous sale not earlier`);
      if (r.prev && Math.abs(r.bps! - (r.rate - r.prev.rate) * 100) > 0.051) fails.push(`live: ${m.meta.key} ${r.series} bps mismatch`);
    }
  const totals = new Map<string, number>();
  for (const r of inWindow) {
    const c = markets.find((m) => m.key === r.market)!.currency;
    totals.set(c, (totals.get(c) ?? 0) + (r.accepted ?? 0));
  }
  for (const c of w.accepted) if (Math.abs((totals.get(c.currency) ?? 0) - c.total) > 1e-6) fails.push(`live: ${c.currency} total mismatch`);
  console.log(`Week ${w.window.start} to ${w.window.end}: ${w.auctions} auctions, ${w.marketsActive} markets, ${w.resultCount} results.`);
  for (const s of w.summary) console.log(`  ${s}`);
  if (process.env.VERBOSE)
    for (const m of w.markets) {
      console.log(`\n${m.meta.country} (${m.meta.currency}) auctions=${m.auctions} accepted=${m.accepted} dir=${m.direction}`);
      for (const r of m.results)
        console.log(`  ${r.instrument} ${r.date} ${r.tenorLabel} ${r.detail ?? ""} rate=${r.rate} prev=${r.prev ? `${r.prev.date}@${r.prev.rate}` : "-"} bps=${r.bps} acc=${r.accepted} rec=${r.received} cover=${r.bidCover}`);
    }
}

if (fails.length) {
  console.error(`FAIL (${fails.length})`);
  for (const f of fails) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("auction-week self-check: OK");
