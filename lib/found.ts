/**
 * Shillings found (docs/rebuild/upgrade-U2-plan.md, decided as D-029). Each money tool ends with one line worked out
 * here: what the reader's option costs or earns, the cheapest or best-earning option we hold for the same use, the
 * difference per year, and the source and date of both sides. Only options a reader can take are compared (a fund,
 * a government bill, a mobile loan, a money transfer service); an average (CBK's, SASRA's) is never a comparable.
 *
 * Pure arithmetic and fixed wording, with no imports, so the same code runs in the browser, in /api/found (which
 * recomputes every difference before it is counted) and in tests/site/test_found.py. A model never writes a line.
 * Information, not advice: the wording states a difference; it never tells a reader to switch or move money.
 */

export const FOUND_TOOLS = ["save_check", "mobile_loans", "fuliza", "mmf", "remit"] as const;
export type FoundTool = (typeof FOUND_TOOLS)[number];
export const isFoundTool = (t: unknown): t is FoundTool => typeof t === "string" && (FOUND_TOOLS as readonly string[]).includes(t);

export type FoundCurrency = "KES" | "GHS" | "NGN" | "USD";
export type FoundLang = "en" | "sw";

/** One side of the comparison: what it is, its figure as shown, who published it, where and when. */
export type FoundSide = { name: string; figure: string; publisher: string; url: string; date: string };

export type FoundResult = {
  tool: FoundTool;
  market: string;
  currency: FoundCurrency;
  /** found: the comparable is better by at least one unit a year; best: the reader's option is already the best we hold; none: no comparable held. */
  status: "found" | "best" | "none";
  /** The difference per year in major units (shillings, cedis, naira, dollars), rounded to whole units; 0 unless found. */
  yearly: number;
  mine: FoundSide | null;
  other: FoundSide | null;
  /** The line, sentence by sentence, in the language asked for. Empty when status is none. */
  lines: string[];
};

/* ---------- Formatting (no Intl dependency beyond toLocaleString, so tests and browsers agree) ---------- */

const monthsEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthsSw = ["Januari", "Februari", "Machi", "Aprili", "Mei", "Juni", "Julai", "Agosti", "Septemba", "Oktoba", "Novemba", "Desemba"];

/** "2026-10-21" -> "21 Oct 2026" (or "21 Oktoba 2026"); "2026-08" -> "Aug 2026"; anything else unchanged. */
export function foundDate(iso: string, lang: FoundLang = "en"): string {
  const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(iso ?? "");
  if (!m) return iso;
  const month = (lang === "sw" ? monthsSw : monthsEn)[Number(m[2]) - 1];
  if (!month) return iso;
  return m[3] ? `${Number(m[3])} ${month} ${m[1]}` : `${month} ${m[1]}`;
}

export const whole = (n: number) => Math.round(n).toLocaleString("en-US");
const two = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (n: number) => `${n.toFixed(2)}%`;
/** "KES 1,850", "GHS 120", "USD 25.20" (dollars keep cents: a transfer fee is a few dollars). */
export function money(currency: FoundCurrency, n: number) {
  return currency === "USD" ? `USD ${two(n)}` : `${currency} ${whole(n)}`;
}

/** A stable key for a product, fund or service name (used in share links). */
export const foundSlug = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

const notAdvice = (lang: FoundLang) => (lang === "sw" ? "Ni taarifa, si ushauri." : "Information, not advice.");
const ok = (n: unknown, min: number, max: number): n is number => typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;
const none = (tool: FoundTool, market: string, currency: FoundCurrency): FoundResult => ({ tool, market, currency, status: "none", yearly: 0, mine: null, other: null, lines: [] });

/* ---------- Caps (decision C) ---------- */

/** The most one result may add to the count, a year: KES 500,000 on savings and loans, USD 2,000 on sending money home. */
export const CAPS = { KES: 500_000, USD: 2_000 } as const;

/**
 * The cap in a result's own currency. Cedis and naira use KES 500,000 converted at the day's reference rates we show
 * (`usdRates`: units per US dollar, as lib/data/fx.ts loads them); with no rate for either currency, null: not counted.
 */
export function capFor(currency: FoundCurrency, usdRates: Record<string, number> | null | undefined): number | null {
  if (currency === "KES") return CAPS.KES;
  if (currency === "USD") return CAPS.USD;
  const kes = usdRates?.KES;
  const local = usdRates?.[currency];
  if (!ok(kes, 1e-9, 1e9) || !ok(local, 1e-9, 1e9)) return null;
  return (CAPS.KES / kes) * local;
}

/**
 * What one result adds to the public count, in minor units (cents), or null when nothing is counted: no positive
 * difference, no cap in this currency, or a difference above the cap (a mistyped amount is refused, not trimmed).
 */
export function countable(r: FoundResult, cap: number | null): number | null {
  if (r.status !== "found" || !(r.yearly >= 1) || cap == null || r.yearly > cap) return null;
  return Math.round(r.yearly * 100);
}

/* ---------- Is my rate fair? (save) ---------- */

/** An option a saver can take: a fund or a government bill, with what it keeps (after tax where `taxed`). */
export type SaveOption = { name: string; rate: number; publisher: string; url: string; date: string };

/**
 * The saver's rate against the best option we hold. Kenya: the best money market fund or the 364-day bill, both after
 * 15% withholding tax, as the reader's rate is (tax 0.15). Ghana and Nigeria: the best Treasury bill, both before tax
 * (tax 0), as the page compares them; we hold no tax rule for those markets, so none is applied to either side.
 */
export function foundSave(
  input: { market: string; currency: FoundCurrency; rate: number; amount: number; tax: number; options: SaveOption[] },
  lang: FoundLang = "en",
): FoundResult {
  const { market, currency, rate, amount, tax } = input;
  if (!ok(rate, 0, 100) || !ok(amount, 1, 1e10) || !ok(tax, 0, 0.5)) return none("save_check", market, currency);
  const best = [...input.options].filter((o) => ok(o.rate, 0, 100)).sort((a, b) => b.rate - a.rate)[0];
  if (!best) return none("save_check", market, currency);
  const keep = rate * (1 - tax);
  const yearly = Math.round((amount * (best.rate - keep)) / 100);
  const afterTax = tax > 0;
  const kept = afterTax ? (lang === "sw" ? "baada ya kodi" : "after tax") : lang === "sw" ? "kabla ya kodi" : "before tax";
  const mine: FoundSide = { name: lang === "sw" ? "Riba yako" : "Your rate", figure: pct(keep), publisher: lang === "sw" ? "uliyoandika" : "your entry", url: "", date: "" };
  const other: FoundSide = { name: best.name, figure: pct(best.rate), publisher: best.publisher, url: best.url, date: best.date };
  const otherLine =
    lang === "sw"
      ? `Chaguo linalolipa zaidi tunalofuatilia, ${best.name}, linakupa ${pct(best.rate)} ${kept} (${best.publisher}, ${foundDate(best.date, lang)}).`
      : `The best-earning option we track, ${best.name}, keeps ${pct(best.rate)} ${kept} (${best.publisher}, ${foundDate(best.date)}).`;
  const mineLine = afterTax
    ? lang === "sw"
      ? `Riba yako ya ${pct(rate)} ni ${pct(keep)} baada ya kodi ya zuio ya ${Math.round(tax * 100)}%.`
      : `Your ${pct(rate)} keeps ${pct(keep)} after ${Math.round(tax * 100)}% withholding tax.`
    : lang === "sw"
      ? `Riba yako ni ${pct(rate)} kwa mwaka, kabla ya kodi.`
      : `Your rate is ${pct(rate)} a year, before tax.`;
  if (yearly < 1) {
    return {
      tool: "save_check",
      market,
      currency,
      status: "best",
      yearly: 0,
      mine,
      other,
      lines: [
        mineLine,
        lang === "sw"
          ? `Kwa takwimu hizi, hakuna chaguo tunalofuatilia linalolipa zaidi: lililo bora, ${best.name}, linakupa ${pct(best.rate)} ${kept} (${best.publisher}, ${foundDate(best.date, lang)}). ${notAdvice(lang)}`
          : `On these figures, no option we track earns more: the best, ${best.name}, keeps ${pct(best.rate)} ${kept} (${best.publisher}, ${foundDate(best.date)}). ${notAdvice(lang)}`,
      ],
    };
  }
  return {
    tool: "save_check",
    market,
    currency,
    status: "found",
    yearly,
    mine,
    other,
    lines: [
      mineLine,
      otherLine,
      lang === "sw"
        ? `Kwa ${money(currency, amount)} kwa mwaka mmoja, hiyo ni ${money(currency, yearly)} zaidi kwa mwaka.`
        : `On ${money(currency, amount)} for a year, that is ${money(currency, yearly)} a year more.`,
      lang === "sw"
        ? `Vyanzo: ulichoandika; ${best.publisher}, ${foundDate(best.date, lang)}. ${notAdvice(lang)}`
        : `Sources: your entry; ${best.publisher}, ${foundDate(best.date)}. ${notAdvice(lang)}`,
    ],
  };
}

/* ---------- Mobile loans and Fuliza ---------- */

/** A mobile loan as its provider publishes it (data/kenya/mobile_loans.json). */
export type LoanProduct = {
  product: string;
  provider: string;
  url: string;
  date: string;
  basis: "flat" | "per_day" | "access_plus_daily";
  pct: number;
  /** The longest term the published charge covers, in days. */
  days: number;
  /** A "from" (lowest) rate: some borrowers pay more. Never used as the comparable; as the reader's side it is a floor. */
  from: boolean;
};

/** Fuliza's published fees (data/kenya/mpesa_tariffs.json): a one-off access fee and a daily fee by balance band. */
export type FulizaTariff = { access_fee_pct: number; daily: { min: number; max: number; fee: number }[]; url: string; date: string };

/**
 * What one loan of `amount` for `days` costs, in shillings, on the provider's published charges; null when the
 * charge does not cover it (more days than the published term, or a Fuliza balance above its top band).
 * Fuliza is costed with Safaricom's band table, as lib/mpesa-calc.ts fulizaCost does (the test checks they agree).
 */
export function loanCharge(p: LoanProduct, amount: number, days: number, fuliza: FulizaTariff | null): number | null {
  if (!ok(amount, 1, 1e7) || !ok(days, 1, p.days) || !Number.isInteger(days)) return null;
  if (p.basis === "flat") return (amount * p.pct) / 100;
  if (p.basis === "per_day") return (amount * p.pct * days) / 100;
  if (!fuliza) return null;
  const band = fuliza.daily.find((b) => amount >= b.min && amount <= b.max);
  if (!band) return null;
  return (amount * fuliza.access_fee_pct) / 100 + band.fee * days;
}

/**
 * The reader's mobile loan (or Fuliza) against the cheapest loan we hold for the same amount and days, times the
 * loans they take a year. Comparables are products with a fixed published charge; a "from" rate is never one.
 */
export function foundLoan(
  input: { tool: "mobile_loans" | "fuliza"; product: string; amount: number; days: number; times: number; products: LoanProduct[]; fuliza: FulizaTariff | null },
  lang: FoundLang = "en",
): FoundResult {
  const { tool, amount, days, times, products, fuliza } = input;
  const own = products.find((p) => p.product === input.product);
  if (!own || !ok(times, 1, 365) || !Number.isInteger(times) || !ok(days, 1, 366) || times * days > 366) return none(tool, "kenya", "KES");
  const mineCost = loanCharge(own, amount, days, fuliza);
  if (mineCost == null) return none(tool, "kenya", "KES");
  const priced = products
    .filter((p) => !p.from)
    .map((p) => ({ p, cost: loanCharge(p, amount, days, fuliza) }))
    .filter((x): x is { p: LoanProduct; cost: number } => x.cost != null)
    .sort((a, b) => a.cost - b.cost);
  const best = priced[0];
  if (!best) return none(tool, "kenya", "KES");
  const src = (p: LoanProduct) => (p.basis === "access_plus_daily" && fuliza ? { url: fuliza.url, date: fuliza.date } : { url: p.url, date: p.date });
  const kes = (n: number) => `KES ${n < 100 ? two(n).replace(/\.00$/, "") : whole(n)}`;
  const floor = own.from ? (lang === "sw" ? "angalau " : "at least ") : "";
  const mine: FoundSide = { name: own.product, figure: `${floor}${kes(mineCost)}`, publisher: own.provider, ...src(own) };
  const other: FoundSide = { name: best.p.product, figure: kes(best.cost), publisher: best.p.provider, ...src(best.p) };
  const borrow = lang === "sw" ? `kukopa ${money("KES", amount)} kwa siku ${days}` : `to borrow ${money("KES", amount)} for ${days} day${days === 1 ? "" : "s"}`;
  const mineLine =
    lang === "sw"
      ? `${own.product}: ${floor}${kes(mineCost)} ${borrow} (gharama zilizochapishwa na ${own.provider}, ${foundDate(mine.date, lang)}).`
      : `${own.product}: ${floor}${kes(mineCost)} ${borrow} (${own.provider}, published charges read ${foundDate(mine.date)}).`;
  const yearly = Math.round((mineCost - best.cost) * times);
  if (best.p.product === own.product || yearly < 1) {
    return {
      tool,
      market: "kenya",
      currency: "KES",
      status: "best",
      yearly: 0,
      mine,
      other,
      lines: [
        mineLine,
        lang === "sw"
          ? `Kwa kiasi na siku hizi, hakuna mkopo wa simu tunaofuatilia wenye gharama ya chini zaidi iliyochapishwa. ${notAdvice(lang)}`
          : `For this amount and these days, no mobile loan we track has a lower published charge. ${notAdvice(lang)}`,
      ],
    };
  }
  return {
    tool,
    market: "kenya",
    currency: "KES",
    status: "found",
    yearly,
    mine,
    other,
    lines: [
      mineLine,
      lang === "sw"
        ? `Mkopo wa simu wenye gharama ya chini zaidi tunaoufuatilia kwa kiasi na siku hizo, ${best.p.product}, ni ${kes(best.cost)} (${best.p.provider}, ${foundDate(other.date, lang)}).`
        : `The cheapest mobile loan we track for the same amount and days, ${best.p.product}, costs ${kes(best.cost)} (${best.p.provider}, read ${foundDate(other.date)}).`,
      lang === "sw"
        ? `Kwa mikopo ${times} kwa mwaka, hiyo ni ${money("KES", yearly)} pungufu kwa mwaka.`
        : `At ${times} loan${times === 1 ? "" : "s"} a year, that is ${money("KES", yearly)} a year less.`,
      lang === "sw"
        ? `Vyanzo: ${own.provider} na ${best.p.provider}, gharama zilizochapishwa.${own.from ? ` ${own.product} inachapisha kiwango cha "kuanzia", kwa hivyo gharama yako inaweza kuwa juu zaidi.` : ""} ${notAdvice(lang)}`
        : `Sources: ${own.provider} and ${best.p.provider}, published charges.${own.from ? ` ${own.product} publishes a "from" rate, so your charge may be higher.` : ""} ${notAdvice(lang)}`,
    ],
  };
}

/* ---------- Money market funds ---------- */

/** A fund as its manager publishes it, with what a saver keeps after 15% withholding tax (`net`). */
export type FundOption = { name: string; manager: string; url: string; date: string; net: number };

export function foundMmf(input: { fund: string; amount: number; funds: FundOption[] }, lang: FoundLang = "en"): FoundResult {
  const own = input.funds.find((f) => f.name === input.fund);
  const best = [...input.funds].filter((f) => ok(f.net, 0, 100)).sort((a, b) => b.net - a.net)[0];
  if (!own || !best || !ok(input.amount, 1, 1e10) || !ok(own.net, 0, 100)) return none("mmf", "kenya", "KES");
  const yearly = Math.round((input.amount * (best.net - own.net)) / 100);
  const mine: FoundSide = { name: own.name, figure: pct(own.net), publisher: own.manager, url: own.url, date: own.date };
  const other: FoundSide = { name: best.name, figure: pct(best.net), publisher: best.manager, url: best.url, date: best.date };
  const mineLine =
    lang === "sw"
      ? `Mfuko wako, ${own.name}, unakupa ${pct(own.net)} baada ya kodi ya zuio ya 15% (mavuno yaliyochapishwa na ${own.manager}, yalisomwa ${foundDate(own.date, lang)}).`
      : `Your fund, ${own.name}, keeps ${pct(own.net)} after 15% withholding tax (${own.manager}, published yield read ${foundDate(own.date)}).`;
  if (best.name === own.name || yearly < 1) {
    return {
      tool: "mmf",
      market: "kenya",
      currency: "KES",
      status: "best",
      yearly: 0,
      mine,
      other,
      lines: [
        mineLine,
        lang === "sw"
          ? `Hakuna mfuko tunaoufuatilia unaolipa zaidi baada ya kodi kwa sasa. Mavuno ya zamani si ahadi ya mavuno yajayo. ${notAdvice(lang)}`
          : `No fund we track keeps more after tax right now. A published yield is not a promise of future returns. ${notAdvice(lang)}`,
      ],
    };
  }
  return {
    tool: "mmf",
    market: "kenya",
    currency: "KES",
    status: "found",
    yearly,
    mine,
    other,
    lines: [
      mineLine,
      lang === "sw"
        ? `Mfuko unaolipa zaidi tunaoufuatilia, ${best.name}, unakupa ${pct(best.net)} (${best.manager}, yalisomwa ${foundDate(best.date, lang)}).`
        : `The best-earning fund we track, ${best.name}, keeps ${pct(best.net)} (its published yield on ${foundDate(best.date)}).`,
      lang === "sw"
        ? `Kwa ${money("KES", input.amount)} kwa mwaka mmoja, hiyo ni ${money("KES", yearly)} zaidi kwa mwaka.`
        : `On ${money("KES", input.amount)} for a year, that is ${money("KES", yearly)} a year more.`,
      lang === "sw"
        ? `Vyanzo: ${own.manager}, ${foundDate(own.date, lang)}; ${best.manager}, ${foundDate(best.date, lang)}. Mavuno yaliyochapishwa si ahadi ya mavuno yajayo. ${notAdvice(lang)}`
        : `Sources: ${own.manager}, ${foundDate(own.date)}; ${best.manager}, ${foundDate(best.date)}. A published yield is not a promise of future returns. ${notAdvice(lang)}`,
    ],
  };
}

/* ---------- Sending money home ---------- */

/** One corridor of the World Bank's Remittance Prices Worldwide survey, every service surveyed with its cost of sending USD 200. */
export type RemitCorridor = { src: string; srcName: string; dst: string; dstName: string; market: string; firms: { firm: string; type: string; pct: number }[] };
/** The survey itself: its period label ("January to March 2025") and the dataset link. */
export type RemitSurvey = { period: string; url: string; publisher: string; date: string };
/** The USD/KES reference rate we show, with its source and date (lib/data/fx.ts). */
export type FxRef = { kesPerUsd: number; source: string; url: string; date: string } | null;

/** USD per transfer of USD 200 = 2 × the cost in %. */
const per200 = (p: number) => 2 * p;

export function foundRemit(
  input: { corridor: RemitCorridor | null; firm: string; sends: number; survey: RemitSurvey; fx: FxRef },
  lang: FoundLang = "en",
): FoundResult {
  const c = input.corridor;
  if (!c) return none("remit", "africa", "USD");
  const own = c.firms.find((f) => f.firm === input.firm);
  const best = [...c.firms].filter((f) => ok(f.pct, 0, 100)).sort((a, b) => a.pct - b.pct)[0];
  if (!own || !best || !ok(own.pct, 0, 100) || !ok(input.sends, 1, 365) || !Number.isInteger(input.sends)) return none("remit", c.market, "USD");
  const s = input.survey;
  const mine: FoundSide = { name: own.firm, figure: `USD ${two(per200(own.pct))}`, publisher: s.publisher, url: s.url, date: s.date };
  const other: FoundSide = { name: best.firm, figure: `USD ${two(per200(best.pct))}`, publisher: s.publisher, url: s.url, date: s.date };
  const yearlyExact = (per200(own.pct) - per200(best.pct)) * input.sends;
  // Dollars keep cents on the line; the count is in cents too.
  const yearly = Math.round(yearlyExact * 100) / 100;
  const mineLine =
    lang === "sw"
      ? `Kutuma USD 200 kutoka ${c.srcName} kwenda ${c.dstName} kupitia ${own.firm} kunagharimu USD ${two(per200(own.pct))} kwa ada na tofauti ya kiwango cha ubadilishaji.`
      : `Sending USD 200 from ${c.srcName} to ${c.dstName} with ${own.firm} costs USD ${two(per200(own.pct))} in fees and exchange-rate margin.`;
  const sourceLine =
    lang === "sw"
      ? `Chanzo: ${s.publisher}, utafiti wa ${s.period}. ${notAdvice(lang)}`
      : `Source: ${s.publisher}, survey of ${s.period}. ${notAdvice(lang)}`;
  if (best.firm === own.firm || yearly < 0.01) {
    return {
      tool: "remit",
      market: c.market,
      currency: "USD",
      status: "best",
      yearly: 0,
      mine,
      other,
      lines: [
        mineLine,
        lang === "sw" ? `Hakuna huduma iliyochunguzwa kwenye njia hii iliyo nafuu zaidi.` : `No service surveyed on this corridor costs less.`,
        sourceLine,
      ],
    };
  }
  const kes = input.fx && ok(input.fx.kesPerUsd, 1, 10000) ? input.fx : null;
  const inKes = kes
    ? lang === "sw"
      ? ` (takriban KES ${whole(yearly * kes.kesPerUsd)} kwa KES ${kes.kesPerUsd.toFixed(2)} kwa dola, ${kes.source}, ${foundDate(kes.date, lang)})`
      : ` (about KES ${whole(yearly * kes.kesPerUsd)} at KES ${kes.kesPerUsd.toFixed(2)} per dollar, ${kes.source}, ${foundDate(kes.date)})`
    : "";
  return {
    tool: "remit",
    market: c.market,
    currency: "USD",
    status: "found",
    yearly,
    mine,
    other,
    lines: [
      mineLine,
      lang === "sw"
        ? `Huduma nafuu zaidi iliyochunguzwa kwenye njia hiyo hiyo, ${best.firm}, inagharimu USD ${two(per200(best.pct))}.`
        : `The cheapest service surveyed on the same corridor, ${best.firm}, costs USD ${two(per200(best.pct))}.`,
      lang === "sw"
        ? `Kwa kutuma mara ${input.sends} kwa mwaka, hiyo ni USD ${two(yearly)} pungufu kwa mwaka${inKes}.`
        : `At ${input.sends} send${input.sends === 1 ? "" : "s"} a year, that is USD ${two(yearly)} a year less${inKes}.`,
      sourceLine,
    ],
  };
}

/* ---------- Labels ---------- */

export const toolLabel: Record<FoundTool, { en: string; sw: string }> = {
  save_check: { en: "Is my rate fair?", sw: "Je, riba yangu ni ya haki?" },
  mobile_loans: { en: "Mobile loans", sw: "Mikopo ya simu" },
  fuliza: { en: "Fuliza", sw: "Fuliza" },
  mmf: { en: "Money market funds", sw: "Mifuko ya soko la fedha" },
  remit: { en: "Sending money home", sw: "Kutuma pesa nyumbani" },
};

/** "Shillings found" on Kenya pages, "Money found" elsewhere (decision E). */
export function foundName(currency: FoundCurrency, lang: FoundLang = "en") {
  if (lang === "sw") return currency === "KES" ? "Shilingi zilizopatikana" : "Pesa zilizopatikana";
  return currency === "KES" ? "Shillings found" : "Money found";
}

/* ---------- What a browser sends to /api/found ---------- */

/** The tool and the reader's inputs, nothing else: the server looks up every comparable itself. */
export type FoundInput =
  | { tool: "save_check"; market: "kenya" | "ghana" | "nigeria"; rate: number; amount: number }
  | { tool: "mobile_loans" | "fuliza"; product: string; amount: number; days: number; times: number }
  | { tool: "mmf"; fund: string; amount: number }
  | { tool: "remit"; src: string; dst: string; firm: string; sends: number };

const name = (v: unknown) => (typeof v === "string" && v.length >= 1 && v.length <= 120 && !/[<>]/.test(v) && ![...v].some((ch) => ch.charCodeAt(0) < 32) ? v : null);
const numIn = (v: unknown, min: number, max: number, int = false) => (ok(v, min, max) && (!int || Number.isInteger(v)) ? v : null);

/** Strictly validates a /api/found body; null when anything is missing, of the wrong type or out of range. */
export function parseFoundInput(raw: unknown): FoundInput | null {
  if (!raw || typeof raw !== "object") return null;
  const b = raw as Record<string, unknown>;
  switch (b.tool) {
    case "save_check": {
      const market = b.market === "kenya" || b.market === "ghana" || b.market === "nigeria" ? b.market : null;
      const rate = numIn(b.rate, 0, 100);
      const amount = numIn(b.amount, 1, 1e10);
      return market && rate != null && amount != null ? { tool: "save_check", market, rate, amount } : null;
    }
    case "mobile_loans":
    case "fuliza": {
      const product = name(b.product);
      const amount = numIn(b.amount, 1, 1e7);
      const days = numIn(b.days, 1, 366, true);
      const times = numIn(b.times, 1, 365, true);
      return product && amount != null && days != null && times != null ? { tool: b.tool, product, amount, days, times } : null;
    }
    case "mmf": {
      const fund = name(b.fund);
      const amount = numIn(b.amount, 1, 1e10);
      return fund && amount != null ? { tool: "mmf", fund, amount } : null;
    }
    case "remit": {
      const src = typeof b.src === "string" && /^[A-Z]{3}$/.test(b.src) ? b.src : null;
      const dst = typeof b.dst === "string" && /^[A-Z]{3}$/.test(b.dst) ? b.dst : null;
      const firm = name(b.firm);
      const sends = numIn(b.sends, 1, 365, true);
      return src && dst && firm && sends != null ? { tool: "remit", src, dst, firm, sends } : null;
    }
    default:
      return null;
  }
}
