import { billIndexLatest, indexShort } from "@/lib/data/bill-index";
import { auctionCalendar } from "@/lib/data/bill-measures";
import { plainMeaning } from "@/lib/data/plain";
import { billMarkets, latestBills, loadBillMarket } from "@/lib/data/sovereign-bills";
import { buildMorningNote, type MorningNote } from "./morning";
import { swCountry, swCurrency } from "./morning-sw";

/**
 * The radio bulletin: about sixty seconds of plain speech on the price of money this week, in English and
 * Kiswahili, written for a presenter to read on air. Same numbers as the site; no opinion.
 */

const DAY = 86400000;
const pct = (n: number) => `${n.toFixed(1)} percent`;
const pctSw = (n: number) => `asilimia ${n.toFixed(1).replace(".", " nukta ")}`;
const money = (n: number) => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(n));

export async function buildRadio(now: number, home: "kenya" | "tanzania" | "uganda" = "kenya") {
  const note: MorningNote = await buildMorningNote(now);
  const m = billMarkets.find((x) => x.slug === home)!;
  const rows = loadBillMarket(home).rows;
  const latest = latestBills(rows);
  const y = latest.get(364)?.latest ?? latest.get(91)?.latest;
  const prev = latest.get(364)?.previous ?? latest.get(91)?.previous;
  const q = latest.get(91)?.latest;
  const plain = y ? plainMeaning({ currency: m.currency, iso: m.iso, country: m.country, rows: [{ tenor: y.tenor, rate: y.rate, prev: prev?.rate ?? null }] }) : null;
  const fx = note.fx.moves.find((f) => f.code === m.currency) ?? null;
  const weekAgoFx = null; // the Morning carries the overnight move; the weekly move is stated as the current level
  const index = billIndexLatest();
  const next = auctionCalendar(new Date(now)).find((n) => n.market.slug === home);
  const bps = y && prev ? Math.round((y.rate - prev.rate) * 100) : null;
  const weekOf = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(now));

  const en = [
    `This is the price of money in ${m.country} this week, from Afronomics.`,
    y ? `At the latest Treasury bill auction, the government borrowed for one year at ${pct(y.rate)}${bps == null ? "" : bps === 0 ? ", the same as the week before" : `, ${Math.abs(bps)} basis points ${bps > 0 ? "higher" : "lower"} than the week before`}.${q ? ` The three-month bill cleared at ${pct(q.rate)}.` : ""}` : "",
    plain ? `In plain terms: ${m.currency} ${money(plain.amount)} put into the one-year bill would earn about ${m.currency} ${money(plain.take)} ${plain.taxRate != null ? "after tax" : "before tax"} over the year, roughly ${m.currency} ${money(plain.take / plain.months)} a month.` : "",
    fx ? `The ${fx.name} is at ${fx.now.toFixed(fx.now >= 100 ? 0 : 2)} to the dollar, ${Math.abs(fx.changePct) < 0.05 ? "little changed" : `${fx.changePct > 0 ? "stronger" : "weaker"} by ${Math.abs(fx.changePct).toFixed(1)} percent overnight`}.` : "",
    index ? `Across Africa, the Afronomics Sovereign Bill Index, the average one-year rate in ${index.latest.markets} markets, stands at ${pct(index.latest.value)}${index.bpsWeek == null ? "" : `, ${index.bpsWeek === 0 ? "unchanged" : `${index.bpsWeek > 0 ? "up" : "down"} ${Math.abs(index.bpsWeek)} basis points`} on the week`}.` : "",
    next ? `The next ${m.country} result is expected around ${new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(next.expected))}.` : "",
    `Every figure is from the central bank, and you can check it at afronomicsfeed dot com. Information, not advice.`,
  ].filter(Boolean);

  const sw = [
    `Hii ni bei ya pesa ${swCountry(m.country)} wiki hii, kutoka Afronomics.`,
    y ? `Katika mnada wa hivi punde wa hati za hazina, serikali ilikopa kwa mwaka mmoja kwa riba ya ${pctSw(y.rate)}${bps == null ? "" : bps === 0 ? ", sawa na wiki iliyopita" : `, pointi ${Math.abs(bps)} ${bps > 0 ? "juu" : "chini"} ya wiki iliyopita`}.${q ? ` Hati ya miezi mitatu iliuzwa kwa ${pctSw(q.rate)}.` : ""}` : "",
    plain ? `Kwa lugha rahisi: ${m.currency} ${money(plain.amount)} ukiweka kwenye hati ya mwaka mmoja, ungepata takriban ${m.currency} ${money(plain.take)} ${plain.taxRate != null ? "baada ya kodi" : "kabla ya kodi"} kwa mwaka, yaani karibu ${m.currency} ${money(plain.take / plain.months)} kwa mwezi.` : "",
    fx ? `${swCurrency(fx.code, fx.name)} iko ${fx.now.toFixed(fx.now >= 100 ? 0 : 2)} kwa dola, ${Math.abs(fx.changePct) < 0.05 ? "bila mabadiliko makubwa" : `${fx.changePct > 0 ? "imeimarika" : "imeshuka"} kwa asilimia ${Math.abs(fx.changePct).toFixed(1)} usiku kucha`}.` : "",
    index ? `Barani Afrika, Fahirisi ya Afronomics ya hati za serikali, wastani wa riba ya mwaka mmoja katika masoko ${index.latest.markets}, iko ${pctSw(index.latest.value)}${index.bpsWeek == null ? "" : `, ${index.bpsWeek === 0 ? "bila mabadiliko" : `${index.bpsWeek > 0 ? "juu" : "chini"} kwa pointi ${Math.abs(index.bpsWeek)}`} wiki hii`}.` : "",
    next ? `Matokeo yajayo ya ${swCountry(m.country)} yanatarajiwa karibu na tarehe ${new Date(next.expected).getUTCDate()}.` : "",
    `Kila namba inatoka benki kuu, na unaweza kuihakiki kwenye afronomicsfeed dot com. Taarifa, si ushauri.`,
  ].filter(Boolean);

  const words = en.join(" ").split(/\s+/).length;
  return { weekOf, market: m, en, sw, seconds: Math.round((words / 150) * 60), weekAgoFx, generatedAt: new Date(now).toISOString(), indexShort, since: new Date(now - 7 * DAY).toISOString().slice(0, 10) };
}
