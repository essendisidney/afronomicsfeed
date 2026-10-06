import { isShareLang, type ShareLang } from "@/lib/learn-ui";
import { site } from "@/lib/site";

/**
 * Shareable results. A share link (/share?…) carries only what the reader typed — a rate, an amount, a term —
 * as strictly validated, clamped numbers and whitelisted keys. Every published figure on the card (the Treasury
 * bill, the bank averages, the funds, the mobile loans) is read from the site's own data when the card is drawn,
 * never from the link, so a link cannot make the card print an invented benchmark or arbitrary text.
 * No server imports: the share buttons use this in the browser.
 */

export const fairPlaces = ["bank", "sacco", "mmf", "other"] as const;
export type FairPlace = (typeof fairPlaces)[number];

export type ShareSpec =
  | { kind: "fair"; mode: "save" | "borrow"; mine: number; place: FairPlace }
  | { kind: "savings"; monthly: number; years: number; rate: number; lang: ShareLang }
  | { kind: "loan"; amount: number; rate: number; months: number; lang: ShareLang }
  | { kind: "mmf" }
  | { kind: "mobile" };

export const shareSources = ["whatsapp", "linkedin", "x", "copy", "native"] as const;
export type ShareSource = (typeof shareSources)[number];

const MAX_AMOUNT = 1_000_000_000;

/** Digits with an optional decimal part, nothing else; clamped to [min, max] and rounded to `dp` places. */
function num(raw: string | null, min: number, max: number, dp: number): number | null {
  if (raw == null || !/^\d{1,12}(\.\d{1,6})?$/.test(raw.trim())) return null;
  const v = Number(raw.trim());
  if (!Number.isFinite(v)) return null;
  const f = 10 ** dp;
  return Math.round(Math.min(max, Math.max(min, v)) * f) / f;
}

function pick<T extends string>(raw: string | null, allowed: readonly T[], fallback: T): T {
  return raw != null && (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback;
}

/** Reads a share from query parameters; null when anything required is missing or malformed. */
export function parseShare(q: URLSearchParams): ShareSpec | null {
  const kind = q.get("kind");
  const lang = q.get("lang");
  const shareLang: ShareLang = lang && isShareLang(lang) ? lang : "en";
  if (kind === "fair") {
    const mode = pick(q.get("mode"), ["save", "borrow"] as const, "save");
    const mine = num(q.get("mine"), 0, mode === "save" ? 100 : 200, 2);
    if (mine == null) return null;
    return { kind, mode, mine, place: pick(q.get("place"), fairPlaces, mode === "save" ? "bank" : "other") };
  }
  if (kind === "savings") {
    const monthly = num(q.get("monthly"), 0, MAX_AMOUNT, 0);
    const years = num(q.get("years"), 1, 40, 0);
    const rate = num(q.get("rate"), 0, 100, 2);
    if (monthly == null || years == null || rate == null) return null;
    return { kind, monthly, years, rate, lang: shareLang };
  }
  if (kind === "loan") {
    const amount = num(q.get("amount"), 0, MAX_AMOUNT, 0);
    const rate = num(q.get("rate"), 0, 200, 2);
    const months = num(q.get("months"), 1, 360, 0);
    if (amount == null || rate == null || months == null) return null;
    return { kind, amount, rate, months, lang: shareLang };
  }
  if (kind === "mmf" || kind === "mobile") return { kind };
  return null;
}

/** The canonical query for a share, in a fixed order (the card URL and the share link both use it). */
export function shareQuery(spec: ShareSpec): URLSearchParams {
  const q = new URLSearchParams({ kind: spec.kind });
  if (spec.kind === "fair") {
    q.set("mode", spec.mode);
    q.set("mine", String(spec.mine));
    q.set("place", spec.place);
  } else if (spec.kind === "savings") {
    q.set("monthly", String(spec.monthly));
    q.set("years", String(spec.years));
    q.set("rate", String(spec.rate));
    if (spec.lang !== "en") q.set("lang", spec.lang);
  } else if (spec.kind === "loan") {
    q.set("amount", String(spec.amount));
    q.set("rate", String(spec.rate));
    q.set("months", String(spec.months));
    if (spec.lang !== "en") q.set("lang", spec.lang);
  }
  return q;
}

/** The tool the share points back to. */
export function sharePath(spec: ShareSpec): { path: string; hash: string } {
  switch (spec.kind) {
    case "fair":
      return { path: "/rates/kenya/check", hash: "" };
    case "savings":
      return { path: spec.lang === "en" ? "/learn" : `/learn/${spec.lang}`, hash: "#savings-calculator" };
    case "loan":
      return { path: spec.lang === "en" ? "/learn" : `/learn/${spec.lang}`, hash: "#loan-calculator" };
    case "mmf":
      return { path: "/rates/kenya/money-market-funds", hash: "" };
    case "mobile":
      return { path: "/rates/kenya/mobile-loans", hash: "" };
  }
}

/** The link a reader shares: the /share landing page, which shows the card to link previews and sends people on. */
export function shareUrl(spec: ShareSpec, source: ShareSource): string {
  const q = shareQuery(spec);
  q.set("utm_source", source);
  q.set("utm_campaign", "share");
  return `${site.url}/share?${q.toString()}`;
}

export function cardUrl(spec: ShareSpec, base: string = site.url): string {
  return `${base}/share/card?${shareQuery(spec).toString()}`;
}

/** Thousands with commas, as the calculators show them. */
export const whole = (n: number) => Math.round(n).toLocaleString("en-GB");
/** A rate as typed: up to two decimals, no trailing zeros. */
export const rateText = (n: number) => String(Math.round(n * 100) / 100);

const saveWho: Record<FairPlace, string> = { bank: "My bank", sacco: "My SACCO", mmf: "My money market fund", other: "My offer" };
const borrowWho: Record<FairPlace, string> = { bank: "My bank", sacco: "My SACCO", mmf: "My lender", other: "My lender" };

export function fairWho(spec: Extract<ShareSpec, { kind: "fair" }>) {
  return (spec.mode === "save" ? saveWho : borrowWho)[spec.place];
}

/** The fair-rate headline, with the benchmark read from the site's data by the caller. */
export function fairSentence(spec: Extract<ShareSpec, { kind: "fair" }>, bench: { bill364Gross: number; lendingAvg: number }) {
  return spec.mode === "save"
    ? `${fairWho(spec)} pays ${rateText(spec.mine)}% a year. The 364-day Treasury bill pays ${bench.bill364Gross.toFixed(2)}%.`
    : `${fairWho(spec)} charges ${rateText(spec.mine)}% a year. Kenyan banks charge ${bench.lendingAvg.toFixed(2)}% on average.`;
}
