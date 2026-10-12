/**
 * Kenya government tenders: the shape of data/kenya/tenders.json (scripts/kenya_tenders.py) and the keyword
 * matching shared by the tenders page (in the browser) and the alert sender (on the server).
 */

export type Tender = {
  id: string;
  ref: string;
  title: string;
  buyer: string;
  category: string;
  method: string;
  published: string;
  closes: string; // Nairobi time, ISO
  value: number | null;
  first_seen: string; // ISO timestamp, or "before" for tenders open when reading started
};

export const PORTAL = "https://tenders.go.ke/";
export const TENDER_PRICE_KES = 500;
export const TRIAL_DAYS = 14;
export const MAX_KEYWORDS = 10;

export const CATEGORY_LABEL: Record<string, string> = {
  goods: "Goods",
  works: "Works",
  services: "Services",
  consultingServices: "Consultancy",
};

const METHOD_LABEL: Record<string, string> = { open: "Open tender", selective: "Restricted", limited: "Restricted", direct: "Direct" };
export const methodLabel = (m: string) => METHOD_LABEL[m] ?? (m ? m[0].toUpperCase() + m.slice(1) : "");

/** "ICT, cleaning; Kisumu" -> ["ict", "cleaning", "kisumu"]: 2-40 characters each, at most ten, no repeats. */
export function parseKeywords(input: unknown): string[] {
  const raw = Array.isArray(input) ? input.join(",") : typeof input === "string" ? input : "";
  const out: string[] = [];
  for (const part of raw.split(/[,;\n]+/)) {
    const k = part.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 40);
    if (k.length >= 2 && !out.includes(k)) out.push(k);
    if (out.length === MAX_KEYWORDS) break;
  }
  return out;
}

const norm = (s: string) => ` ${s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;

/** Does any keyword appear in the tender's title or buyer? Whole words or word starts ("clean" finds "cleaning"). */
export function matches(t: Pick<Tender, "title" | "buyer">, keywords: string[]) {
  const hay = norm(`${t.title} ${t.buyer}`);
  return keywords.some((k) => {
    const n = norm(k).trim();
    return n.length >= 2 && hay.includes(` ${n}`);
  });
}

/** Whole days from now until the closing time (0 = closes today). */
export function daysLeft(closes: string, now = Date.now()) {
  const day = (ms: number) => Math.floor((ms + 3 * 3600_000) / 86_400_000); // Nairobi calendar days
  return day(Date.parse(closes)) - day(now);
}

export function closesLabel(closes: string, now = Date.now()) {
  const d = daysLeft(closes, now);
  const date = new Date(closes).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Nairobi" });
  const time = new Date(closes).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" });
  return { date, time, days: d, when: d <= 0 ? "closes today" : d === 1 ? "closes tomorrow" : `${d} days left` };
}
