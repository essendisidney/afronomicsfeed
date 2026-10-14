import { WHT } from "@/lib/auction-math";
import { loadAuctionResults, shortDate, type AuctionResult, type MarketMeta } from "@/lib/data/auction-week";
import { outlook } from "@/lib/data/auction-intel";
import { overnightFx } from "@/lib/editions/morning";
import type { Evidence } from "@/components/evidence/EvidenceTag";
import { swCountry, swCurrency } from "@/lib/editions/morning-sw";

/**
 * Today's "What changed" and "Our record" (rebuild brief, section 6). Code does all the arithmetic; nothing here is
 * written by a model. Each item carries its evidence (source, link, as-of date) and says who it touches. The
 * shilling effect is given only where it is plain arithmetic (a rate move on a stated KES 100,000 for a year, or a
 * stated USD 100 converted at the reference rate); otherwise it is left out.
 *
 * Selection rule (documented so it can be checked): the largest auction rate change in any market in the last 7 days (against
 * the previous sale of the same tenor, if that was within 120 days),
 * the largest overnight move among traded African currencies, and the largest Kenya auction move (or, when Kenya
 * is already shown, the next-largest auction move in another market).
 */

export type TodayMove = {
  id: string;
  kind: "auction" | "fx";
  headline: string;
  /** Who the move touches, from the fixed mapping below. */
  touches: string;
  /** The effect in shillings, when it is plain arithmetic; else null. */
  shillings: string | null;
  direction: "up" | "down";
  href: string;
  evidence: Evidence;
  /** The same line in Kiswahili: the same numbers, from hand-written sentence frames (never a model's paraphrase). */
  sw: { headline: string; touches: string; shillings: string | null };
};

const RECENT_DAYS = 7;
/** A previous sale older than this is not a fair "what changed" comparison. */
const MAX_GAP_DAYS = 120;
const DAY = 86_400_000;
const kes = (n: number) => `KES ${Math.round(Math.abs(n)).toLocaleString("en-US")}`;
const pts = (bps: number) => `${(Math.abs(bps) / 100).toFixed(2)} percentage points`;
const monthsSw = ["Januari", "Februari", "Machi", "Aprili", "Mei", "Juni", "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba"];
/** "13 Oktoba" from an ISO date. */
export const swDay = (iso: string) => {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return `${d.getUTCDate()} ${monthsSw[d.getUTCMonth()]}`;
};
/** "91-day" → "ya siku 91", "3-year" → "ya miaka 3", "1-year" → "ya mwaka 1". */
export function swTenor(label: string) {
  const m = /^(\d+)-(day|week|month|year)$/.exec(label);
  if (!m) return label;
  const n = Number(m[1]);
  const unit = { day: ["siku", "siku"], week: ["wiki", "wiki"], month: ["mwezi", "miezi"], year: ["mwaka", "miaka"] }[m[2] as "day"][n === 1 ? 0 : 1];
  return `ya ${unit} ${n}`;
}

type Pair = { latest: AuctionResult; prev: AuctionResult; bps: number; meta: MarketMeta };

/** The latest result of each series against its previous sale, for series sold in the last RECENT_DAYS days. */
export function auctionMoves(now = Date.now()): Pair[] {
  const { results, markets } = loadAuctionResults();
  const metas = new Map(markets.map((m) => [m.key, m]));
  const bySeries = new Map<string, AuctionResult[]>();
  for (const r of results) {
    const key = `${r.market}|${r.instrument}|${r.series}`;
    const list = bySeries.get(key) ?? [];
    list.push(r);
    bySeries.set(key, list);
  }
  const pairs: Pair[] = [];
  for (const list of bySeries.values()) {
    const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
    const latest = sorted.at(-1);
    // The previous sale is the newest one on an earlier date (some publishers list a series twice on one day).
    const prev = latest ? sorted.filter((r) => r.date < latest.date).at(-1) : undefined;
    const meta = latest ? metas.get(latest.market) : undefined;
    if (!latest || !prev || !meta) continue;
    // A figure without a source link is not shown (rebuild brief, section 2).
    if (!/^https?:\/\//.test(latest.source)) continue;
    if (now - Date.parse(`${latest.date}T00:00:00Z`) > RECENT_DAYS * DAY) continue;
    if (Date.parse(`${latest.date}T00:00:00Z`) - Date.parse(`${prev.date}T00:00:00Z`) > MAX_GAP_DAYS * DAY) continue;
    const bps = Math.round((latest.rate - prev.rate) * 100);
    if (bps !== 0) pairs.push({ latest, prev, bps, meta });
  }
  return pairs.sort((a, b) => Math.abs(b.bps) - Math.abs(a.bps));
}

function touchesForAuction(p: Pair) {
  if (p.meta.key === "kenya") {
    return p.latest.instrument === "bill"
      ? "Savers in Treasury bills and money market funds, and the government's borrowing bill"
      : "Pension funds and savers holding Kenyan bonds, and the government's borrowing bill";
  }
  return p.latest.instrument === "bill"
    ? `${p.meta.country}'s borrowing bill and savers who buy its Treasury bills`
    : `${p.meta.country}'s borrowing bill and pension funds holding its bonds`;
}

function touchesForAuctionSw(p: Pair) {
  const country = swCountry(p.meta.country);
  if (p.meta.key === "kenya") {
    return p.latest.instrument === "bill"
      ? "Wawekaji akiba katika hati za hazina na mifuko ya soko la fedha, na gharama ya mikopo ya serikali"
      : "Mifuko ya pensheni na wawekaji akiba wenye hatifungani za Kenya, na gharama ya mikopo ya serikali";
  }
  return p.latest.instrument === "bill"
    ? `Gharama ya mikopo ya serikali ya ${country} na wawekaji akiba wanaonunua hati zake za hazina`
    : `Gharama ya mikopo ya serikali ya ${country} na mifuko ya pensheni yenye hatifungani zake`;
}

function auctionItem(p: Pair): TodayMove {
  const up = p.bps > 0;
  const what = `${p.meta.country} ${p.latest.tenorLabel} ${p.latest.instrument === "bill" ? "Treasury bill" : "bond"}`;
  // Plain arithmetic only for Kenya: the rate move on KES 100,000 held for a year, before withholding tax.
  const shillings =
    p.meta.key === "kenya"
      ? `${kes((100_000 * p.bps) / 10_000)} a year ${up ? "more" : "less"} interest on KES 100,000, before ${Math.round(WHT * 100)}% withholding tax`
      : null;
  const publisher = p.latest.instrument === "bill" ? p.meta.publishers.bill : p.meta.publishers.bond;
  const whatSw = `${p.latest.instrument === "bill" ? "hati ya hazina" : "hatifungani"} ${swTenor(p.latest.tenorLabel)} ya ${swCountry(p.meta.country)}`;
  const sw = {
    headline: `Riba ya ${whatSw} ${up ? "ilipanda" : "ilishuka"} kwa pointi ${(Math.abs(p.bps) / 100).toFixed(2)} za asilimia hadi ${p.latest.rate.toFixed(2)}%`,
    touches: touchesForAuctionSw(p),
    shillings:
      p.meta.key === "kenya"
        ? `${kes((100_000 * p.bps) / 10_000)} ${up ? "zaidi" : "pungufu"} za riba kwa mwaka kwa KES 100,000, kabla ya kodi ya zuio ya ${Math.round(WHT * 100)}%`
        : null,
  };
  return {
    id: `auction-${p.meta.key}-${p.latest.series}-${p.latest.date}`,
    kind: "auction",
    headline: `${what} ${up ? "rose" : "fell"} ${pts(p.bps)} to ${p.latest.rate.toFixed(2)}%`,
    touches: touchesForAuction(p),
    shillings,
    direction: up ? "up" : "down",
    href: (p.latest.instrument === "bill" ? p.meta.billHref : p.meta.bondSlug ? `/markets/bonds/${p.meta.bondSlug}` : null) ?? "/numbers",
    evidence: { source: publisher ?? p.meta.country, href: p.latest.source, asOf: p.latest.date },
    sw,
  };
}

export const FX_SOURCE = { name: "ExchangeRate-API reference rates", href: "https://open.er-api.com/v6/latest/USD" };

async function fxItem(): Promise<TodayMove | null> {
  const fx = await overnightFx();
  const top = fx.moves[0];
  if (!top || !fx.asOf) return null;
  // changePct > 0: the currency strengthened against the dollar (fewer units per dollar).
  const stronger = top.changePct > 0;
  const kenya = top.code === "KES";
  const shillings = kenya
    ? `USD 100 sent home converts to ${kes(100 * top.now)}, ${kes(100 * (top.now - top.prev))} ${top.now > top.prev ? "more" : "less"} than on ${shortDate(top.prevDay)}`
    : null;
  return {
    id: `fx-${top.code}-${fx.asOf}`,
    kind: "fx",
    headline: `The ${top.name} ${stronger ? "strengthened" : "weakened"} ${Math.abs(top.changePct).toFixed(2)}% against the US dollar overnight`,
    touches: kenya ? "Families receiving money from abroad, and importers paying in dollars" : "Importers paying in dollars and families receiving money from abroad",
    shillings,
    direction: stronger ? "up" : "down",
    href: `/markets/currencies/usd-${top.code.toLowerCase()}`,
    evidence: { source: FX_SOURCE.name, href: FX_SOURCE.href, asOf: fx.asOf },
    sw: {
      headline: `${swCurrency(top.code, top.name)} ${stronger ? "iliimarika" : "ilishuka"} kwa ${Math.abs(top.changePct).toFixed(2)}% dhidi ya dola ya Marekani usiku kucha`,
      touches: kenya ? "Familia zinazopokea pesa kutoka nje, na waagizaji wanaolipa kwa dola" : "Waagizaji wanaolipa kwa dola na familia zinazopokea pesa kutoka nje",
      shillings: kenya
        ? `USD 100 zinazotumwa nyumbani ni ${kes(100 * top.now)}, ${kes(100 * (top.now - top.prev))} ${top.now > top.prev ? "zaidi" : "pungufu"} kuliko tarehe ${swDay(top.prevDay)}`
        : null,
    },
  };
}

/** The three moves for Today, by the selection rule above. Fewer when fewer moved. */
export async function whatChanged(now = Date.now()): Promise<TodayMove[]> {
  const pairs = auctionMoves(now);
  const out: TodayMove[] = [];
  const first = pairs[0];
  if (first) out.push(auctionItem(first));
  const fx = await fxItem().catch(() => null);
  if (fx) out.push(fx);
  const third = pairs.find((p) => p !== first && (first?.meta.key === "kenya" ? p.meta.key !== "kenya" : p.meta.key === "kenya")) ?? pairs.find((p) => p !== first);
  if (third) out.push(auctionItem(third));
  return out;
}

/** "How the method has done": a backtest of the Kenya T-bill range method over every auction since 2011
 * (lib/data/auction-intel.ts). Not a record of published forecasts; that is the ledger (docs/rebuild/phase-4-plan.md). */
export function ourRecord() {
  const rows = outlook();
  if (!rows.length) return null;
  const tested = rows.reduce((n, r) => n + r.trackRecord.tested, 0);
  const inside = rows.reduce((n, r) => n + r.trackRecord.inside, 0);
  const newest = [...rows].sort((a, b) => a.last.value_date.localeCompare(b.last.value_date)).at(-1)!.last;
  const source = (newest as { source?: string }).source ?? "";
  // The record is shown only with a link to the publisher's own notice (rebuild brief, section 2).
  if (!tested || !/^https?:\/\//.test(source)) return null;
  return { tested, inside, share: inside / tested, asOf: newest.value_date, source, tenors: rows.length };
}
