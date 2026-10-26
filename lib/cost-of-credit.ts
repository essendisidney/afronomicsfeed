/**
 * Kenya Cost of Credit Index (KCCI), version 0: what borrowing costs in Kenya, by kind of lender, on one yardstick.
 * Method: content/methods/kcci.md (published at /rates/kenya/cost-of-credit/method).
 *
 * Pure arithmetic with no imports, so it runs in tests (tests/site/test_cost_of_credit.py) and anywhere else. The
 * loader that feeds it from data/ is lib/data/cost-of-credit.ts.
 *
 * The yardstick is the site's existing one (lib/data/mobile-loans.ts): the yearly simple rate, i.e. the charge for a
 * term × 365 ÷ term days, and the charge in shillings on KES 1,000 borrowed for 30 days.
 *
 * v0 publishes one reading per category of lender. It does not blend them into a single number: we hold no lending
 * volumes to weight them, and two of the four categories are not in yet (a gap and a pending decision). Categories,
 * not companies, are the unit (D-028): a product's published price is an input, never a verdict.
 */

export const KCCI_VERSION = "0.1";
export const KCCI_NAME = "Afronomics Kenya Cost of Credit Index";
export const KCCI_SHORT = "KCCI";

/** A CBK month counts for this many days after the month ends (CBK publishes the average about six to eight weeks late). */
export const BANK_STALE_DAYS = 120;
/** A provider's published terms count for this many days after we read them; they are re-read at least quarterly. */
export const MOBILE_STALE_DAYS = 92;
/** Fewest products with a full published price for the mobile reading to print. */
export const MOBILE_MIN_PRODUCTS = 2;
/** The term the yardstick uses, in days. */
export const TERM_DAYS = 30;

const DAY = 86400000;

export type BankInput = {
  month: string; // YYYY-MM
  lending: number; // % a year, CBK weighted average lending rate across commercial banks
  source: string;
};

export type MobileProductInput = {
  product: string;
  provider: string;
  source: string;
  readOn: string; // YYYY-MM-DD
  termCostPct: number; // all published charges for `days`, as % of the amount borrowed
  days: number;
  from: boolean; // the provider publishes a "from" or "starting at" price: a floor, not the price
};

export type KcciInput = {
  asOf: string; // YYYY-MM-DD, the reading date
  bank: BankInput | null;
  mobile: MobileProductInput[];
};

export type ComponentStatus = "included" | "insufficient" | "gap" | "excluded";

export type MobileProductView = MobileProductInput & {
  yearlySimple: number;
  costPer1000: number;
  counted: boolean;
  reason: string | null; // why a product is not counted
};

export type KcciComponent = {
  key: "bank" | "mobile" | "sacco" | "loan_apps";
  label: string;
  status: ComponentStatus;
  yearly: number | null; // % a year, simple
  per1000: number | null; // KES on KES 1,000 for 30 days
  asOf: string | null; // the date or month of the input
  basis: string;
  note: string;
};

export type KcciReading = {
  version: string;
  asOf: string;
  components: KcciComponent[];
  mobileProducts: MobileProductView[];
  included: number; // categories with a reading
  categories: number; // categories in the design
  composite: null; // v0 publishes no blended number; see the method
};

const round = (n: number, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp;

/** A rate quoted for `days` (as % of the amount) as a simple yearly rate. */
export function yearlySimple(termCostPct: number, days: number) {
  if (!(days > 0)) throw new Error("days must be positive");
  return (termCostPct * 365) / days;
}

/** Shillings charged on KES 1,000 for TERM_DAYS at a simple yearly rate. */
export function per1000(yearlyPct: number) {
  return (1000 * yearlyPct * TERM_DAYS) / 365 / 100;
}

export function median(values: number[]) {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function daysBetween(fromIso: string, toIso: string) {
  return (Date.parse(toIso) - Date.parse(fromIso)) / DAY;
}

/** The last day of a YYYY-MM month, as YYYY-MM-DD. */
export function monthEnd(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

export function computeKcci(input: KcciInput): KcciReading {
  const { asOf } = input;

  // Bank loans: CBK's monthly weighted average lending rate.
  let bank: KcciComponent;
  const b = input.bank;
  if (!b || !Number.isFinite(b.lending) || !/^\d{4}-\d{2}$/.test(b.month)) {
    bank = { key: "bank", label: "Bank loans", status: "insufficient", yearly: null, per1000: null, asOf: null, basis: "CBK weighted average lending rate", note: "No CBK lending average held." };
  } else {
    const age = daysBetween(monthEnd(b.month), asOf);
    const fresh = age >= 0 && age <= BANK_STALE_DAYS;
    bank = {
      key: "bank",
      label: "Bank loans",
      status: fresh ? "included" : "insufficient",
      yearly: fresh ? round(b.lending) : null,
      per1000: fresh ? round(per1000(b.lending)) : null,
      asOf: b.month,
      basis: "Central Bank of Kenya weighted average lending rate across commercial banks, for the month",
      note: fresh
        ? "An average of the interest rates banks charge, weighted by loan size. It leaves out fees, so the full cost of a bank loan is higher."
        : `The latest CBK month held (${b.month}) is more than ${BANK_STALE_DAYS} days old, so no bank reading prints.`,
    };
  }

  // Mobile loans: the median of products whose full published price we hold and read recently.
  const mobileProducts: MobileProductView[] = input.mobile
    .map((p) => {
      const y = yearlySimple(p.termCostPct, p.days);
      const age = daysBetween(p.readOn, asOf);
      const reason = p.from
        ? "Published as a “from” price: a floor, not the price most borrowers pay. Shown, not counted."
        : age > MOBILE_STALE_DAYS
          ? `Terms read more than ${MOBILE_STALE_DAYS} days before the reading date. Shown, not counted until re-read.`
          : age < 0
            ? "Terms read after the reading date. Not counted in this reading."
            : null;
      return { ...p, yearlySimple: round(y), costPer1000: round(per1000(y)), counted: reason == null, reason };
    })
    .sort((a, b) => a.product.localeCompare(b.product));
  const counted = mobileProducts.filter((p) => p.counted);
  const m = counted.length >= MOBILE_MIN_PRODUCTS ? median(counted.map((p) => yearlySimple(p.termCostPct, p.days))) : null;
  const latestRead = counted.map((p) => p.readOn).sort().at(-1) ?? null;
  const mobile: KcciComponent = {
    key: "mobile",
    label: "Mobile loans",
    status: m == null ? "insufficient" : "included",
    yearly: m == null ? null : round(m),
    per1000: m == null ? null : round(per1000(m)),
    asOf: latestRead,
    basis: `Median of the full published charges of ${counted.length} mobile loan product${counted.length === 1 ? "" : "s"}, for KES 1,000 over ${TERM_DAYS} days, as a simple yearly rate`,
    note:
      m == null
        ? `Fewer than ${MOBILE_MIN_PRODUCTS} products with a full, recent published price, so no mobile reading prints.`
        : "Every published charge is counted (fees and excise duty included). Late fees and rollovers are not, so a borrower who pays late pays more.",
  };

  const sacco: KcciComponent = {
    key: "sacco",
    label: "SACCO loans",
    status: "gap",
    yearly: null,
    per1000: null,
    asOf: null,
    basis: "Not held",
    note: "We hold no published SACCO loan rates yet. SASRA publishes dividends and deposit interest, not loan pricing. This category stays empty until we hold SACCOs’ own published loan rates, with sources and dates.",
  };

  const loanApps: KcciComponent = {
    key: "loan_apps",
    label: "Digital loan apps",
    status: "excluded",
    yearly: null,
    per1000: null,
    asOf: null,
    basis: "Borrowers’ own reports (unverified)",
    note: "The loan-app costs we collect are borrowers’ reports, not published prices, and are not checked against the lender. They stay out of the index until the founder decides whether, and how, they can enter it.",
  };

  const components = [bank, mobile, sacco, loanApps];
  return {
    version: KCCI_VERSION,
    asOf,
    components,
    mobileProducts,
    included: components.filter((c) => c.status === "included").length,
    categories: components.length,
    composite: null,
  };
}

/** One sentence to quote, built from the reading. Null when nothing prints. */
export function kcciQuote(r: KcciReading, longDate: (iso: string) => string) {
  const bank = r.components.find((c) => c.key === "bank");
  const mobile = r.components.find((c) => c.key === "mobile");
  const parts: string[] = [];
  if (bank?.yearly != null) parts.push(`bank loans ${bank.yearly.toFixed(2)}% a year (CBK average, ${bank.asOf})`);
  if (mobile?.yearly != null) parts.push(`mobile loans ${mobile.yearly.toFixed(0)}% a year (median published charge, KES 1,000 for 30 days)`);
  if (!parts.length) return null;
  return `The ${KCCI_NAME} (v${r.version}, indicative) read, on ${longDate(r.asOf)}: ${parts.join("; ")}. SACCO loans are not yet covered.`;
}
