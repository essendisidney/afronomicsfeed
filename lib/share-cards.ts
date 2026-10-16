import { getAllArticles } from "@/lib/content";
import { cpiIndex, loadCpi } from "@/lib/data/cpi";
import { mobileLoanBoard } from "@/lib/data/mobile-loans";
import { editorialRows, editorialScore } from "@/lib/editorial";
import { loadIpoOffers } from "@/lib/data/ipo-offers";
import { latestByTenor, loadTbills } from "@/lib/data/kenya-tbills";
import { loadMpesaTariffs } from "@/lib/data/mpesa-tariffs";
import { loadPayrollRates } from "@/lib/data/payroll-rates";
import { worth } from "@/lib/inflation";
import { apply, scenario } from "@/lib/ipo-calc";
import { loanCost } from "@/lib/loan-calc";
import { charge } from "@/lib/mpesa-calc";
import { clampText, type SignatureCard } from "@/lib/og-signature";
import { accentFor } from "@/lib/og-tokens";
import { deskSlug, getReceipt, sourceFor, visibleReceipts, type Receipt } from "@/lib/receipts";
import { netSalary } from "@/lib/salary-calc";
import { monthsUntil, plan } from "@/lib/savings-goal";
import { savingsDates, savingsPlaces } from "@/lib/savings-places";
import type { ShareSpec } from "@/lib/share";
import { quoteBill } from "@/lib/tbill-calc";
import { numbersThatMoved } from "@/lib/today-board";
import { toolDefaults as D } from "@/lib/tool-defaults";
import { tools } from "@/lib/tools";

/**
 * What each share card says (docs/rebuild/phase-7b-plan.md, 7b-2), drawn by lib/og-signature.tsx. Every figure is read
 * from the page's own data when the card is drawn: a Receipt's first figure tile and its source, a tool's example worked
 * with the same lib function and the same opening values (lib/tool-defaults.ts) as the calculator on the page, and the
 * Today tiles from lib/today-board.ts. Nothing here types a number in. When a figure cannot be worked out, the card
 * shows the question alone.
 */

const fmtDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
export const cardDay = (iso: string) => fmtDay.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
const monthLabel = (ym: string) => new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${ym}-01T00:00:00Z`));
const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const kes2 = (n: number) => `KES ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct1 = (n: number) => `${n.toFixed(1)}%`;
const today = () => new Date().toISOString().slice(0, 10);

const deskName = (r: Receipt) => r.desk.replace(/^Afronomics /, "");
const receiptAccent = (r: Receipt) => accentFor(deskSlug(r.desk) ?? r.sector);

/** Source and date of a Receipt figure: the tile's own source, dated by that source. */
function receiptSource(r: Receipt, name: string | undefined) {
  const s = (name ? sourceFor(r, name) : null) ?? r.sources[0];
  // The name is cut, never the date: every card carries its source and date.
  return s ? `Source: ${clampText(s.name, 56)} · ${cardDay(s.date)}` : `Afronomics · ${cardDay(r.date)}`;
}

/** A Receipt: its desk, headline, first figure tile, verdict line, and the tile's source and date. */
export function receiptSignature(r: Receipt, kicker?: string): SignatureCard {
  const tile = r.tiles[0];
  return {
    accent: receiptAccent(r),
    kicker: kicker ?? deskName(r),
    stamp: { word: "RECEIPT", date: `Checked · ${cardDay(r.date)}` },
    headline: r.title,
    figure: tile ? { value: tile.value, label: tile.label } : null,
    line: r.verdict ? { label: "Our verdict", text: r.verdict } : { text: r.summary },
    source: receiptSource(r, tile?.source),
  };
}

/** The front page: today's lead story (the newest public Receipt) and its number. */
export function homeSignature(): SignatureCard {
  const lead = visibleReceipts()[0];
  if (lead) return receiptSignature(lead, `Today's lead · ${deskName(lead)}`);
  return {
    accent: accentFor(null),
    kicker: "Afronomics · Today",
    stamp: { word: "TODAY", date: cardDay(today()) },
    headline: "What African money did today, and why",
    line: { text: "A daily verdict with the receipts: borrowing costs, currencies and savings rates from the source." },
    source: "afronomicsfeed.com",
  };
}

export function storiesSignature(): SignatureCard {
  const newest = getAllArticles()[0]?.date;
  return {
    accent: accentFor(null),
    kicker: "Afronomics · Stories",
    stamp: { word: "STORIES", date: newest ? `Latest · ${cardDay(newest)}` : undefined },
    headline: "What happened, why, and what it means for your money",
    line: { text: "Briefs, weekly notes and explainers, each with its sources." },
    source: "afronomicsfeed.com/stories",
  };
}

export function toolsSignature(): SignatureCard {
  return {
    accent: accentFor(null),
    kicker: "Afronomics · Tools",
    stamp: { word: "TOOLS", date: "Free · no sign-up" },
    headline: "Calculators and checkers, one question each",
    line: { text: tools.slice(0, 6).map((t) => t.title).join(" · ") },
    source: "Free, no sign-up · afronomicsfeed.com/tools",
  };
}

/** The question each tool page asks in its heading (checked against the page by tests/site/test_share_cards.py). */
export const toolQuestions: Record<string, string> = {
  "/rates/kenya/net-salary": "What will you actually take home?",
  "/rates/kenya/loan-cost": "What does this loan really cost?",
  "/rates/kenya/savings-goal": "How much do you need to save each month?",
  "/rates/kenya/inflation": "What your shilling has lost",
  "/rates/kenya/mpesa-charges": "What do M-PESA and Fuliza really cost you?",
  "/markets/ipo-calculator": "What does your money buy in the IPO?",
  "/markets/kenya-tbills/calculator": "What will my Treasury bill pay?",
  "/markets/kenya-tbills/auction": "Before and after Kenya’s T-bill auction",
  "/rates/kenya/check": "Is the rate you were offered fair?",
  "/chama": "Where should our chama put its money?",
  "/diaspora": "Money home, and what it earns there",
};

type Example = Pick<SignatureCard, "figure" | "line" | "source">;

/** One worked example per calculator, from the calculator's own opening values. Null: show the question alone. */
const examples: Record<string, () => Example | null> = {
  "/rates/kenya/net-salary": () => {
    const rates = loadPayrollRates();
    const r = netSalary(rates, { gross: D.salary.gross, nssf: 0, pension: 0, mortgageInterest: 0, postRetirementMedical: 0 });
    return {
      figure: { value: kes(r.net), label: `take-home a month on ${kes(r.gross)} gross, before NSSF` },
      line: { text: `PAYE ${kes(r.paye)} · SHIF ${kes(r.shif)} · Housing Levy ${kes(r.housingLevy)}` },
      source: `Source: KRA, SHA and NSSF rates · checked ${cardDay(rates.checked)}`,
    };
  },
  "/rates/kenya/loan-cost": () => {
    const L = D.loan;
    const r = loanCost({ amount: L.amount, rate: L.rate, unit: L.unit, basis: L.basis, months: L.months, upfrontFees: 0, monthlyFees: 0 });
    if (!Number.isFinite(r.apr)) return null;
    return {
      figure: { value: `${pct1(r.apr)} a year`, label: `the true cost of ${kes(L.amount)} at ${L.rate}% a ${L.unit} ${L.basis}, over ${L.months} months` },
      line: { text: `${kes(r.payment)} a month, ${kes(r.totalCost)} in total. Information, not advice.` },
      source: `Afronomics calculation from the quoted terms · ${cardDay(today())}`,
    };
  },
  "/rates/kenya/savings-goal": () => {
    const places = savingsPlaces();
    const { today: t, defaultBy } = savingsDates();
    const rows = plan(D.savingsGoal.goal, 0, monthsUntil(t, defaultBy), places);
    const best = rows[0];
    const worst = rows[rows.length - 1];
    if (!best || !worst || !Number.isFinite(best.monthly)) return null;
    const short = (p: (typeof rows)[number]["place"]) => p.short ?? p.name;
    return {
      figure: { value: `${kes(best.monthly)} a month`, label: `${D.savingsGoal.label}: ${kes(D.savingsGoal.goal)} by ${monthLabel(defaultBy)}, in ${short(best.place)}` },
      line: { text: `or ${kes(worst.monthly)} a month in ${short(worst.place)}` },
      source: `After-tax rates from the fund managers and the CBK · ${cardDay(t)}`,
    };
  },
  "/rates/kenya/inflation": () => {
    const index = cpiIndex();
    const latest = index[index.length - 1]?.month;
    const w = latest ? worth(D.inflation.amount, D.inflation.from, latest, index) : null;
    if (!w) return null;
    const src = loadCpi().sources[0]?.name ?? "Kenya National Bureau of Statistics";
    return {
      figure: { value: kes(w.value), label: `what ${kes(D.inflation.amount)} of ${monthLabel(D.inflation.from)} is in ${monthLabel(latest)} prices` },
      line: { text: `Kenyan prices rose ${pct1(w.cumulativePct)}, about ${pct1(w.yearlyPct)} a year` },
      source: `Source: ${src} · ${monthLabel(latest)}`,
    };
  },
  "/rates/kenya/mpesa-charges": () => {
    const t = loadMpesaTariffs();
    const c = charge(t, D.mpesa.kind, D.mpesa.amount);
    if (c == null) return null;
    return {
      figure: { value: kes(c), label: `to send ${kes(D.mpesa.amount)} to an M-PESA number` },
      line: { text: "Sending, withdrawing and Fuliza, at Safaricom's own published charges" },
      source: `Source: Safaricom tariffs · checked ${cardDay(t.checked)}`,
    };
  },
  "/markets/ipo-calculator": () => {
    const offer = loadIpoOffers()[0];
    if (!offer) return null;
    const a = apply(offer, D.ipo.amount);
    return {
      figure: { value: `${a.units.toLocaleString("en-US")} ${offer.units}`, label: `what ${kes(D.ipo.amount)} buys in the ${offer.name} offer, at ${kes2(offer.price)}` },
      line: { text: `If the price opens 10% lower: ${kes(scenario(offer, a.units, -10).value)}; 10% higher: ${kes(scenario(offer, a.units, 10).value)}` },
      source: `Offer terms checked ${cardDay(offer.checked)} · information, not advice`,
    };
  },
  "/markets/kenya-tbills/calculator": () => {
    const b = latestByTenor(loadTbills().rows).get(364)?.latest;
    if (!b) return null;
    const q = quoteBill(b.weighted_avg_rate, 364, D.tbill.amount, D.tbill.mode, b.price_per_100);
    return {
      figure: { value: kes(q.net), label: `kept after 15% tax on ${kes(q.cost)} in the 364-day bill` },
      line: { text: `Pay ${kes(q.cost)}, get ${kes(q.face)} back in a year, at ${b.weighted_avg_rate.toFixed(2)}%` },
      source: `Source: Central Bank of Kenya auction · value ${cardDay(b.value_date)}`,
    };
  },
};

/** A tool's card: its question and, where the calculator has one, the example it opens with. */
export function toolSignature(href: string): SignatureCard {
  const tool = tools.find((t) => t.href === href);
  let example: Example | null = null;
  try {
    example = examples[href]?.() ?? null;
  } catch {
    example = null; // a data file that cannot be read: the question alone, never a guess
  }
  return {
    accent: accentFor(null),
    kicker: `Tools · ${tool?.title ?? "Calculator"}`,
    stamp: { word: "TOOL", date: example ? `Worked · ${cardDay(today())}` : "Free · no sign-up" },
    headline: toolQuestions[href] ?? tool?.title ?? "Afronomics tools",
    figure: example?.figure ?? null,
    line: example?.line ?? (tool ? { text: tool.answers } : null),
    source: example?.source ?? "Free, no sign-up · afronomicsfeed.com",
  };
}

/**
 * "Share this number": one figure, by reference. A Today tile by its id, or a Receipt tile by the Receipt's slug and
 * the tile's place; the value, label, source and date are read here. Null when the reference does not exist (or the
 * Receipt is a draft on a production deployment).
 */
export function numberSignature(spec: Extract<ShareSpec, { kind: "number" }>): { card: SignatureCard; title: string; description: string } | null {
  if (spec.receipt) {
    const r = getReceipt(spec.receipt);
    const tile = r?.tiles[Number(spec.tile) - 1];
    if (!r || !tile) return null;
    const card: SignatureCard = {
      accent: receiptAccent(r),
      kicker: `${deskName(r)} · the number`,
      stamp: { word: "NUMBER", date: `Receipt · ${cardDay(r.date)}` },
      headline: r.title,
      figure: { value: tile.value, label: tile.label },
      line: tile.note ? { text: tile.note } : null,
      source: receiptSource(r, tile.source),
    };
    return { card, title: `${tile.label}: ${tile.value}`, description: `From the Afronomics Receipt "${r.title}". ${card.source}.` };
  }
  const tile = numbersThatMoved().find((t) => t.id === spec.tile);
  if (!tile) return null;
  const card: SignatureCard = {
    accent: accentFor(null),
    kicker: "Today in 30 seconds",
    stamp: { word: "TODAY", date: cardDay(tile.evidence.asOf) },
    headline: tile.label,
    figure: { value: tile.value, label: tile.change ?? tile.label },
    line: null,
    source: `Source: ${tile.evidence.source} · ${tile.evidence.dateKind === "value" ? "value " : ""}${cardDay(tile.evidence.asOf)}`,
  };
  return { card, title: `${tile.label}: ${tile.value}`, description: `${tile.label}, ${tile.value}${tile.change ? ` (${tile.change})` : ""}. ${card.source}. Afronomics Today.` };
}

/** /record: the next call to be settled, with its due date and the source that settles it. */
export function recordSignature(): SignatureCard {
  const rows = editorialRows();
  const s = editorialScore(rows);
  const next = rows.find((r) => r.status === "open");
  const tally = `${s.open} open · ${s.held} held · ${s.missed} missed`;
  if (!next) {
    return { accent: accentFor(null), kicker: "Our record", stamp: { word: "RECORD", date: cardDay(today()) }, headline: "Every call we make, graded against the source", line: { text: tally }, source: `Afronomics calls ledger · ${cardDay(today())}` };
  }
  return {
    accent: accentFor(null),
    kicker: `Our record · ${tally}`,
    stamp: { word: "CALL", date: `Due · ${cardDay(next.check_date)}` },
    headline: next.statement,
    figure: { value: cardDay(next.check_date), label: `due date · settled by ${next.check_source}` },
    line: { text: "Dated before the result, graded when the source publishes. Win or lose, it stays on the record." },
    source: `Afronomics calls ledger · ${cardDay(today())}`,
  };
}

/** A rates page led by one of the Today figures: the latest rate, its change, its source and date. */
export function rateSignature(tileId: string, kicker: string, headline: string): SignatureCard {
  const tile = numbersThatMoved().find((t) => t.id === tileId);
  if (!tile) return sectionSignature(kicker, headline, null);
  return {
    accent: accentFor("markets"),
    kicker,
    stamp: { word: "RATE", date: cardDay(tile.evidence.asOf) },
    headline,
    figure: { value: tile.value, label: tile.change ? `${tile.label}: ${tile.change}` : tile.label },
    line: null,
    source: `Source: ${tile.evidence.source} · ${tile.evidence.dateKind === "value" ? "value " : ""}${cardDay(tile.evidence.asOf)}`,
  };
}

/** Mobile loans: the lowest published charge for KES 1,000. */
export function mobileLoansSignature(): SignatureCard {
  const cheapest = mobileLoanBoard()[0];
  if (!cheapest) return sectionSignature("Kenya rates · mobile loans", "What a mobile loan really costs", null);
  return {
    accent: accentFor("cost-of-living"),
    kicker: "Kenya rates · mobile loans",
    stamp: { word: "RATE", date: `Read · ${cardDay(cheapest.read_on)}` },
    headline: "What a mobile loan really costs",
    figure: { value: `${cheapest.from ? "from " : ""}${kes(cheapest.costPer1000)}`, label: `for KES 1,000 over ${cheapest.days} days on ${cheapest.product}, the lowest published charge` },
    line: { text: `About ${Math.round(cheapest.yearlySimple)}% as a simple yearly rate` },
    source: `Source: ${cheapest.provider}, published charges · read ${cardDay(cheapest.read_on)}`,
  };
}

/** Receipt lists (all, a desk's, a series'): the newest Receipt in the list, under the list's name. */
export function receiptListSignature(kicker: string, filter: (r: Receipt) => boolean = () => true): SignatureCard {
  const r = visibleReceipts().find(filter);
  return r ? receiptSignature(r, `${kicker} · latest`) : sectionSignature(kicker, "Receipts: our verdict on one money event a day", null);
}

/** A hub or list page without one headline number: its name, what it holds, and the date it was drawn. */
export function sectionSignature(kicker: string, headline: string, line: string | null, desk: string | null = null): SignatureCard {
  return { accent: accentFor(desk), kicker, stamp: { word: "SOURCED", date: cardDay(today()) }, headline, line: line ? { text: line } : null, source: `Afronomics · figures from the publishers · ${cardDay(today())}` };
}
