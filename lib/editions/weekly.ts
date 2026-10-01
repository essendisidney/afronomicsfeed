import { rpcRead } from "@/lib/store";
import { currencyName, formatFx, loadFxQuote } from "@/lib/data/fx";
import { loadBonds, type BondAuction } from "@/lib/data/kenya-bonds";
import { latestByTenor, loadTbills, tenorLabel, tenors, type Tenor } from "@/lib/data/kenya-tbills";
import { loadAfricaProjects, type Project } from "@/lib/data/projects";
import { loadDataSignals, type DataSignal } from "@/lib/data/signals";
import { loadWire, type WireDesk, type WireItem } from "@/lib/data/wire";
import { billIndexLatest } from "@/lib/data/bill-index";

/**
 * The weekly edition, assembled from the datasets on the site. Every line is generated from a published
 * number or headline and carries its source; nothing is written by hand or by a model.
 */

export type BillLine = { tenor: Tenor; label: string; rate: number; changeBps: number | null; date: string; subscription: number | null; source: string };
export type FxMove = { code: string; name: string; now: number; then: number; changePct: number; from: string; to: string };

export type WeeklyEdition = {
  weekOf: string; // Monday, YYYY-MM-DD
  generatedAt: string;
  bills: BillLine[];
  bonds: BondAuction[];
  fx: { moves: FxMove[]; asOf: string | null; days: number } | null;
  stories: WireItem[];
  boards: Project[];
  signals: DataSignal[];
  index: { value: number; date: string; bpsWeek: number | null; bpsYear: number | null; markets: number } | null;
};

const DAY = 86400000;

export function mondayOf(now: number) {
  // Nairobi time (UTC+3): the edition turns over at 00:00 Monday EAT.
  const local = new Date(now + 3 * 3600000);
  const dow = (local.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - dow)).toISOString().slice(0, 10);
}

async function fxMoves(): Promise<WeeklyEdition["fx"]> {
  const [history, quote] = await Promise.all([rpcRead("af_fx_history", { p_days: 10 }, 3600), loadFxQuote()]);
  if (!history.ok || !Array.isArray(history.value) || !quote) return null;
  const rows = history.value as { day: string; code: string; rate: number | string }[];
  const days = [...new Set(rows.map((row) => row.day))].sort();
  if (days.length < 2) return { moves: [], asOf: days[0] ?? null, days: days.length };
  // Compare the latest archived day with the one closest to seven days earlier.
  const last = days.at(-1)!;
  const target = new Date(new Date(last).getTime() - 7 * DAY).toISOString().slice(0, 10);
  const first = days.reduce((best, day) => (Math.abs(Date.parse(day) - Date.parse(target)) < Math.abs(Date.parse(best) - Date.parse(target)) ? day : best), days[0]);
  if (first === last) return { moves: [], asOf: last, days: days.length };
  const at = (day: string) => new Map(rows.filter((row) => row.day === day).map((row) => [row.code, Number(row.rate)]));
  const then = at(first);
  const now = at(last);
  const moves: FxMove[] = [];
  for (const { code } of quote.codes) {
    if (["USD", "EUR", "GBP", "CNY"].includes(code)) continue;
    const a = then.get(code);
    const b = now.get(code);
    if (!a || !b) continue;
    // Units per dollar rising means the currency weakened: report the currency's own move.
    const changePct = (a / b - 1) * 100;
    moves.push({ code, name: currencyName(code), now: b, then: a, changePct, from: first, to: last });
  }
  moves.sort((x, y) => Math.abs(y.changePct) - Math.abs(x.changePct));
  return { moves, asOf: last, days: days.length };
}

/** Up to `limit` stories from the last seven days, spread across desks so no single beat fills the list. */
function pickStories(items: WireItem[], now: number, limit = 10) {
  const promo = /\b(programme|program|MBA|webinar|masterclass|sponsored|partner content|advertorial|course|scholarship|award nominations?|podcast|quiz|horoscope)\b/i;
  const recent = items.filter((item) => now - Date.parse(item.publishedAt) < 7 * DAY && !promo.test(item.title));
  const desks: WireDesk[] = ["markets", "economy", "capital", "trade", "technology", "climate", "policy"];
  const out: WireItem[] = [];
  const used = new Set<string>();
  const publishers = new Map<string, number>();
  for (let round = 0; out.length < limit && round < 4; round += 1) {
    for (const desk of desks) {
      const pick = recent.find(
        (item) => item.desks.includes(desk) && !used.has(item.id) && (publishers.get(item.publisher) ?? 0) <= round && item.countries.length > 0,
      );
      if (!pick) continue;
      used.add(pick.id);
      publishers.set(pick.publisher, (publishers.get(pick.publisher) ?? 0) + 1);
      out.push(pick);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export async function buildWeeklyEdition(now: number): Promise<WeeklyEdition> {
  const weekOf = mondayOf(now);
  const [wire, projects, signals, fx] = await Promise.all([loadWire(), loadAfricaProjects(), loadDataSignals(1), fxMoves()]);

  const latest = latestByTenor(loadTbills().rows);
  const bills: BillLine[] = tenors.flatMap((tenor) => {
    const item = latest.get(tenor);
    if (!item) return [];
    const { latest: row, previous } = item;
    return [
      {
        tenor,
        label: tenorLabel[tenor],
        rate: row.weighted_avg_rate,
        changeBps: previous ? Math.round((row.weighted_avg_rate - previous.weighted_avg_rate) * 100) : null,
        date: row.value_date,
        subscription: row.subscription_pct ?? null,
        source: row.source,
      },
    ];
  });

  const bondRows = loadBonds().rows;
  const newestBond = bondRows[0]?.value_date;
  const bonds = newestBond
    ? bondRows.filter((row) => Date.parse(newestBond) - Date.parse(row.value_date) <= 7 * DAY && now - Date.parse(row.value_date) <= 45 * DAY)
    : [];

  const today = new Date(now).toISOString().slice(0, 10);
  const horizon = new Date(now + 45 * DAY).toISOString().slice(0, 10);
  const boards = projects
    .filter((project) => project.status === "Pipeline" && project.approvalDate && project.approvalDate.slice(0, 10) >= today && project.approvalDate.slice(0, 10) <= horizon)
    .sort((a, b) => (a.approvalDate ?? "").localeCompare(b.approvalDate ?? "") || b.amountUsd - a.amountUsd)
    .slice(0, 8);

  const idx = billIndexLatest(364);
  return {
    weekOf,
    generatedAt: new Date(now).toISOString(),
    index: idx ? { value: idx.latest.value, date: idx.latest.date, bpsWeek: idx.bpsWeek, bpsYear: idx.bpsYear, markets: idx.latest.markets } : null,
    bills,
    bonds,
    fx,
    stories: pickStories(wire, now),
    boards,
    signals: signals.slice(0, 4),
  };
}

const signed = (value: number, digits = 1) => `${value > 0 ? "+" : value < 0 ? "−" : "±"}${Math.abs(value).toFixed(digits)}`;
export const bpsText = (bps: number | null) => (bps == null ? "" : `${bps > 0 ? "+" : bps < 0 ? "−" : "±"}${Math.abs(bps)} bps`);
export const pctText = (value: number, digits = 1) => `${signed(value, digits)}%`;
export const fxText = formatFx;

/** The week in a handful of sentences, for the page standfirst, the email preheader and social posts. */
export function headlines(edition: WeeklyEdition): string[] {
  const lines: string[] = [];
  if (edition.index) {
    const w = edition.index.bpsWeek;
    lines.push(
      `The Afronomics African Sovereign Bill Index stands at ${edition.index.value.toFixed(2)}%${w == null ? "" : `, ${w === 0 ? "unchanged" : `${w > 0 ? "up" : "down"} ${Math.abs(w)} bps`} on the week`}${edition.index.bpsYear == null ? "" : ` and ${edition.index.bpsYear > 0 ? "up" : "down"} ${Math.abs(edition.index.bpsYear)} bps on a year ago`}.`,
    );
  }
  const bill = edition.bills.find((b) => b.tenor === 91) ?? edition.bills[0];
  if (bill) {
    const move = bill.changeBps == null || bill.changeBps === 0 ? "unchanged" : `${bill.changeBps > 0 ? "up" : "down"} ${Math.abs(bill.changeBps)} bps`;
    lines.push(`Kenya’s ${bill.label} Treasury bill cleared at ${bill.rate.toFixed(3)}%, ${move} on the previous auction.`);
  }
  const bond = [...edition.bonds].filter((b) => b.kind !== "switch" && b.kind !== "buyback").sort((a, b) => (b.accepted_kes_m ?? 0) - (a.accepted_kes_m ?? 0))[0];
  if (bond) {
    const taken = bond.accepted_kes_m != null ? `, KES ${(bond.accepted_kes_m / 1000).toFixed(1)}bn accepted` : "";
    lines.push(`Treasury bond ${bond.issue} priced at ${bond.weighted_avg_rate.toFixed(3)}%${taken}.`);
  }
  const fxMove = edition.fx?.moves[0];
  if (fxMove && Math.abs(fxMove.changePct) >= 0.2) {
    lines.push(`The ${fxMove.name} ${fxMove.changePct > 0 ? "gained" : "lost"} ${Math.abs(fxMove.changePct).toFixed(1)}% against the dollar over the week.`);
  }
  const board = edition.boards[0];
  if (board && board.amountUsd > 0) {
    lines.push(`${edition.boards.length} World Bank operations are scheduled for Board approval in the next six weeks, led by ${board.country.name}’s $${(board.amountUsd / 1e6).toFixed(0)}m ${board.name}.`);
  }
  return lines;
}
