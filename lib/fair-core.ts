import { COUNTRIES, country as findCountry } from "@/lib/reader-reports-core";

/**
 * Pay and rent check ("Is my salary fair?", "Is my rent fair?"): the jobs, homes and towns readers can report,
 * and the checks on a report. Shared by the form, the API route and the pages. Figures are published only as the
 * median and middle range of at least MIN_FAIR reports per cell (supabase/migrations/0027_pay_rent_reports.sql).
 */

export const MIN_FAIR = 5;
export type FairKind = "pay" | "rent";
export { COUNTRIES };

const TOWN_NAMES: Record<string, string[]> = {
  KE: ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Machakos", "Nyeri", "Kakamega", "Kericho"],
  NG: ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu", "Benin City"],
  GH: ["Accra", "Kumasi", "Takoradi", "Tamale", "Tema", "Cape Coast"],
  UG: ["Kampala", "Entebbe", "Jinja", "Mbarara", "Gulu", "Mukono"],
  TZ: ["Dar es Salaam", "Arusha", "Dodoma", "Mwanza", "Zanzibar", "Mbeya"],
  ZA: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Gqeberha", "Bloemfontein"],
};

export const TOWNS: Record<string, { id: string; label: string }[]> = Object.fromEntries(
  Object.entries(TOWN_NAMES).map(([code, names]) => [
    code,
    [...names.map((label) => ({ id: label.toLowerCase().replace(/[^a-z0-9]+/g, "_"), label })), { id: "other", label: "Elsewhere" }],
  ]),
);

export type Category = { id: string; label: string; group?: string };

export const JOBS: Category[] = [
  { id: "teacher", label: "Teacher", group: "Public service" },
  { id: "nurse", label: "Nurse", group: "Public service" },
  { id: "doctor", label: "Doctor", group: "Public service" },
  { id: "police", label: "Police officer", group: "Public service" },
  { id: "civil_servant", label: "Civil servant (clerical)", group: "Public service" },
  { id: "accountant", label: "Accountant", group: "Office" },
  { id: "banker", label: "Bank officer", group: "Office" },
  { id: "admin_assistant", label: "Administrative assistant", group: "Office" },
  { id: "hr", label: "HR officer", group: "Office" },
  { id: "marketing", label: "Marketing or communications", group: "Office" },
  { id: "sales", label: "Sales representative", group: "Office" },
  { id: "customer_service", label: "Customer service or call centre", group: "Office" },
  { id: "lawyer", label: "Lawyer", group: "Professional" },
  { id: "engineer", label: "Engineer", group: "Professional" },
  { id: "software_developer", label: "Software developer", group: "Professional" },
  { id: "data_analyst", label: "Data analyst", group: "Professional" },
  { id: "manager", label: "Manager", group: "Professional" },
  { id: "driver", label: "Driver", group: "Skilled and service" },
  { id: "security_guard", label: "Security guard", group: "Skilled and service" },
  { id: "shop_attendant", label: "Shop attendant", group: "Skilled and service" },
  { id: "waiter", label: "Waiter or hospitality", group: "Skilled and service" },
  { id: "construction", label: "Construction worker", group: "Skilled and service" },
  { id: "electrician", label: "Electrician or plumber", group: "Skilled and service" },
  { id: "domestic_worker", label: "Domestic worker", group: "Skilled and service" },
];

export const HOMES: Category[] = [
  { id: "single_room", label: "Single room" },
  { id: "bedsitter", label: "Bedsitter or studio" },
  { id: "one_bedroom", label: "One bedroom" },
  { id: "two_bedroom", label: "Two bedrooms" },
  { id: "three_bedroom", label: "Three bedrooms" },
  { id: "house", label: "House, four bedrooms or more" },
];

export const categories = (kind: FairKind) => (kind === "pay" ? JOBS : HOMES);
export const categoryLabel = (kind: FairKind, id: string) => categories(kind).find((c) => c.id === id)?.label ?? id;
export const townLabel = (code: string, id: string) => (id === "all" ? `All of ${findCountry(code)?.name ?? code}` : TOWNS[code]?.find((t) => t.id === id)?.label ?? id);

// Monthly amounts in US dollars that a figure must fall within: wide on purpose, only to catch typos.
const BOUNDS_USD: Record<FairKind, [number, number]> = { pay: [15, 60000], rent: [5, 15000] };

export type FairInput = { kind: FairKind; country: string; town: string; category: string; amount: number };

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export function parseFair(body: unknown): { ok: true; value: FairInput } | { ok: false; reason: string } {
  const b = (body ?? {}) as Record<string, unknown>;
  const kind = b.kind === "pay" || b.kind === "rent" ? b.kind : null;
  if (!kind) return { ok: false, reason: "Choose salary or rent." };
  const c = findCountry(clean(b.country, 2).toUpperCase());
  if (!c || !TOWNS[c.code]) return { ok: false, reason: "Choose a country." };
  const town = clean(b.town, 40);
  if (!TOWNS[c.code].some((t) => t.id === town)) return { ok: false, reason: "Choose a town." };
  const category = clean(b.category, 40);
  if (!categories(kind).some((x) => x.id === category)) return { ok: false, reason: kind === "pay" ? "Choose your job." : "Choose the kind of home." };
  const amount = typeof b.amount === "number" ? b.amount : parseFloat(clean(b.amount, 20).replace(/[,\s]/g, ""));
  if (!Number.isFinite(amount) || amount <= 0) return { ok: false, reason: "Type the monthly amount as a number." };
  const [lo, hi] = BOUNDS_USD[kind].map((usd) => usd * c.usd);
  if (amount < lo || amount > hi) {
    return { ok: false, reason: `That looks out of range for a monthly ${kind === "pay" ? "salary" : "rent"} in ${c.name}. Check the figure (a month, in ${c.currency}).` };
  }
  return { ok: true, value: { kind, country: c.code, town, category, amount } };
}

export type FairCell = { country: string; town: string; category: string; n: number; low: number | null; median: number | null; high: number | null };
