import { loadFxQuote } from "@/lib/data/fx";
import { fundLeague, rateOptions } from "@/lib/data/kenya-rates";
import { loadMobileLoans } from "@/lib/data/mobile-loans";
import { loadMpesaTariffs } from "@/lib/data/mpesa-tariffs";
import { countryName, destSlug, loadRemittances, periodLabel } from "@/lib/data/remittances";
import { latestBills, loadBillMarket } from "@/lib/data/sovereign-bills";
import type { FulizaTariff, FundOption, FxRef, LoanProduct, RemitCorridor, RemitSurvey, SaveOption } from "@/lib/found";

/**
 * The comparable options behind each "shillings found" line (lib/found.ts), read from the same data files the pages
 * show. Pages pass these to the tools; /api/found reads them again to recompute a result before it is counted, so a
 * browser can never supply a comparable. Only options a reader can take: no averages (decision A, D-029).
 */

/** Kenya, "Is my rate fair?" (save): every money market fund and the 364-day bill, after 15% withholding tax. */
export function kenyaSaveOptions(): SaveOption[] {
  const funds = fundLeague().map((f) => ({ name: f.name, rate: f.net, publisher: f.manager, url: f.source, date: f.readOn }));
  const bill = rateOptions().options.find((o) => o.name === "364-day Treasury bill");
  return [...funds, ...(bill ? [{ name: bill.name, rate: bill.net, publisher: bill.publisher, url: bill.source, date: bill.asOf }] : [])];
}

/** Ghana and Nigeria: the latest Treasury bill of each tenor, as the central bank publishes it (before tax). */
export function countrySaveOptions(slug: "ghana" | "nigeria"): SaveOption[] {
  const publisher = slug === "ghana" ? "Bank of Ghana" : "Central Bank of Nigeria";
  return [...latestBills(loadBillMarket(slug).rows).entries()].map(([tenor, b]) => ({
    name: `${tenor}-day Treasury bill`,
    rate: b.latest.rate,
    publisher: `${publisher}, auction`,
    url: b.latest.source,
    date: b.latest.date,
  }));
}

export function loanProducts(): LoanProduct[] {
  return loadMobileLoans().map((r) => ({ product: r.product, provider: r.provider, url: r.source, date: r.read_on, basis: r.basis, pct: r.pct, days: r.days, from: r.from }));
}

export function fulizaTariff(): FulizaTariff {
  const t = loadMpesaTariffs();
  return { access_fee_pct: t.fuliza.access_fee_pct, daily: t.fuliza.daily, url: t.sources.fuliza, date: t.checked };
}

export function fundOptions(): FundOption[] {
  return fundLeague().map((f) => ({ name: f.name, manager: f.manager, url: f.source, date: f.readOn, net: f.net }));
}

export function remitCorridors(): RemitCorridor[] {
  return (loadRemittances()?.corridors ?? []).map((c) => ({
    src: c.src,
    srcName: countryName(c.src_name),
    dst: c.dst,
    dstName: countryName(c.dst_name),
    market: destSlug(c.dst_name),
    firms: (c.firms ?? [c.cheapest]).map((f) => ({ firm: f.firm, type: f.type, pct: f.cost_pct })),
  }));
}

export function remitSurvey(): RemitSurvey | null {
  const f = loadRemittances();
  if (!f) return null;
  return { period: periodLabel(f.period), url: f.source_page, publisher: "World Bank, Remittance Prices Worldwide", date: (f.read_at ?? "").slice(0, 10) };
}

/** The USD/KES reference rate the site shows (the market strip on Today), with its source and date; null when unavailable. */
export async function fxRef(): Promise<{ ref: FxRef; rates: Record<string, number> | null }> {
  const fx = await loadFxQuote();
  if (!fx?.rates.KES) return { ref: null, rates: null };
  const d = new Date(fx.updated);
  return {
    ref: { kesPerUsd: fx.rates.KES, source: fx.sourceName, url: fx.sourceUrl, date: Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10) },
    rates: fx.rates,
  };
}
