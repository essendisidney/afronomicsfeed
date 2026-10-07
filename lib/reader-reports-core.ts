/**
 * Reader reports: what readers paid for everyday things and the rates they were paid or charged, plus stories for
 * the editor. Shared by the form, the API route and the page. Figures are published only as medians of at least
 * MIN_REPORTS reports (supabase/migrations/0019_reader_reports.sql).
 */

export const MIN_REPORTS = 3;
export const WINDOW_DAYS = 30;

export type Country = { code: string; name: string; currency: string; symbol: string; usd: number };

// usd: rough units of local currency per US dollar, used only to reject figures that cannot be right.
export const COUNTRIES: Country[] = [
  { code: "KE", name: "Kenya", currency: "KES", symbol: "KES ", usd: 130 },
  { code: "NG", name: "Nigeria", currency: "NGN", symbol: "₦", usd: 1550 },
  { code: "GH", name: "Ghana", currency: "GHS", symbol: "GH₵", usd: 12 },
  { code: "UG", name: "Uganda", currency: "UGX", symbol: "UGX ", usd: 3700 },
  { code: "TZ", name: "Tanzania", currency: "TZS", symbol: "TZS ", usd: 2600 },
  { code: "ZA", name: "South Africa", currency: "ZAR", symbol: "R", usd: 18 },
];

export type Item = {
  id: string;
  label: string;
  kind: "price" | "rate";
  group: string;
  /** price: a typical price in US dollars, for the sanity range; rate: [min, max] in % */
  typicalUsd?: number;
  spread?: number;
  range?: [number, number];
  unit?: string;
};

export const ITEMS: Item[] = [
  { id: "maize_flour_2kg", label: "Maize flour, 2 kg", kind: "price", group: "Food", typicalUsd: 1.3 },
  { id: "rice_1kg", label: "Rice, 1 kg", kind: "price", group: "Food", typicalUsd: 1.3 },
  { id: "sugar_1kg", label: "Sugar, 1 kg", kind: "price", group: "Food", typicalUsd: 1.2 },
  { id: "cooking_oil_1l", label: "Cooking oil, 1 litre", kind: "price", group: "Food", typicalUsd: 2.5 },
  { id: "bread_400g", label: "Bread, 400 g loaf", kind: "price", group: "Food", typicalUsd: 0.5 },
  { id: "milk_500ml", label: "Milk, 500 ml", kind: "price", group: "Food", typicalUsd: 0.5 },
  { id: "eggs_tray", label: "Eggs, tray of 30", kind: "price", group: "Food", typicalUsd: 3.5 },
  { id: "petrol_1l", label: "Petrol, 1 litre", kind: "price", group: "Getting around", typicalUsd: 1.3 },
  { id: "bus_fare", label: "Matatu, bus or taxi fare, one trip to work", kind: "price", group: "Getting around", typicalUsd: 0.6 },
  { id: "gas_refill", label: "Cooking gas refill, 12–13 kg", kind: "price", group: "Home", typicalUsd: 25 },
  { id: "rent_1br", label: "Rent, one-bedroom home, a month", kind: "price", group: "Home", typicalUsd: 150, spread: 15 },
  { id: "savings_rate", label: "Interest my bank, SACCO or fund pays on savings", kind: "rate", group: "Money", range: [0.01, 40], unit: "% a year" },
  { id: "loan_rate", label: "Interest I was charged on a bank or SACCO loan", kind: "rate", group: "Money", range: [1, 200], unit: "% a year" },
  { id: "mobile_loan", label: "Fee on a one-month mobile or app loan", kind: "rate", group: "Money", range: [0.1, 60], unit: "% for the month" },
];

export const country = (code: string) => COUNTRIES.find((c) => c.code === code);
export const item = (id: string) => ITEMS.find((i) => i.id === id);

/** The range a figure must fall in to be accepted, in local currency (prices) or % (rates). */
export function bounds(i: Item, c: Country): [number, number] {
  if (i.kind === "rate") return i.range!;
  const spread = i.spread ?? 8;
  const typical = i.typicalUsd! * c.usd;
  return [typical / spread, typical * spread];
}

export type ReportInput =
  | { kind: "price" | "rate"; country: string; item: string; amount: number; place: string }
  | { kind: "story"; country: string; note: string; contact: string; place: string };

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "");

export function parseReport(body: unknown): { ok: true; value: ReportInput } | { ok: false; reason: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const c = country(clean(b.country, 2).toUpperCase());
  if (!c) return { ok: false, reason: "Choose a country." };
  const place = clean(b.place, 80);
  if (b.kind === "story") {
    const note = clean(b.note, 2000);
    if (note.length < 20) return { ok: false, reason: "Tell us a little more (at least a sentence)." };
    return { ok: true, value: { kind: "story", country: c.code, note, contact: clean(b.contact, 200), place } };
  }
  const i = item(clean(b.item, 40));
  if (!i) return { ok: false, reason: "Choose what you are reporting." };
  const amount = typeof b.amount === "number" ? b.amount : parseFloat(clean(b.amount, 20).replace(/[,\s]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, reason: "Type the amount as a number." };
  const [lo, hi] = bounds(i, c);
  if (amount < lo || amount > hi) {
    const what = i.kind === "rate" ? `${lo}% to ${hi}%` : `${c.symbol}${Math.round(lo).toLocaleString("en-GB")} to ${c.symbol}${Math.round(hi).toLocaleString("en-GB")}`;
    return { ok: false, reason: `That looks out of range for ${i.label.toLowerCase()} in ${c.name} (we accept ${what}). Check the figure.` };
  }
  return { ok: true, value: { kind: i.kind, country: c.code, item: i.id, amount, place } };
}

export type SummaryRow = { country: string; item: string; n: number; low: number | null; median: number | null; high: number | null; latest: string };
