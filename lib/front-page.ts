import { getArticlesByCategory } from "@/lib/content";
import { countries } from "@/lib/data/countries";
import { articleHref } from "@/lib/format";
import { deskSlug, sectorNames, visibleReceipts, type DeskSlug, type Receipt } from "@/lib/receipts";
import { rotateRow } from "@/lib/rotation";
import type { Article } from "@/lib/types";

/**
 * The front page's story rows (redesign preview, docs: this file). Published Receipts and briefs are mixed by date
 * into four reader topics, each a row on Today. Nothing here writes or changes a figure: a card shows the item's own
 * headline, its own first figure tile (Receipts) and its own date.
 *
 * Topic mapping, so it can be checked:
 *   Receipts, by `sector`:
 *     cost-of-living, banking          -> "Your money"
 *     public-money, markets            -> "Government borrowing" (budgets, borrowing, bills and bonds)
 *     companies                        -> "Companies & IPOs"
 *     africa                           -> "Across Africa"
 *   Briefs (content/briefs), first rule that matches:
 *     1. the title names Africa / African or an African country other than Kenya -> "Across Africa" (Africa desk colour)
 *     2. topics include nse-disclosures, capital-markets-conduct, listed-banks or insurance -> "Companies & IPOs"
 *     3. topics include saccos or bank-supervision -> "Your money" (Banking colour)
 *     4. the title is about a saver's or sender's shillings (savers, "KES <n>", "Sending $") -> "Your money" (Cost of living colour)
 *     5. topics include treasury-bills, mpc or money-markets -> "Government borrowing" (Markets colour)
 *     otherwise the brief stays off the front page (it is still on /stories).
 *
 * Kind label: a Receipt is "Verdict" (type verdict) or "Data" (type data); a brief whose title starts "How to",
 * "Anatomy of" or "When the" is an "Explainer", any other brief "Data".
 *
 * Headline number: a Receipt's first figure tile (value and label, as published). A brief shows a number only when the
 * first teaser line holds exactly one figure (an amount or a percentage), labelled with its own clause of that line,
 * so a figure is never shown without what it measures; otherwise the card has none.
 */

export type TopicId = "money" | "borrowing" | "companies" | "africa";

export const topicRows: { id: TopicId; anchor: string; title: string; chip: string; blurb: string }[] = [
  { id: "money", anchor: "your-money", title: "Your money", chip: "Your money", blurb: "Savings, loans, banks, SACCOs and the cost of living" },
  { id: "borrowing", anchor: "borrowing", title: "Government borrowing", chip: "Borrowing", blurb: "Budgets, bills, bonds and what the state pays to borrow" },
  { id: "companies", anchor: "companies", title: "Companies & IPOs", chip: "Companies", blurb: "Listed and listing companies, offers and results" },
  { id: "africa", anchor: "africa", title: "Across Africa", chip: "Africa", blurb: "Money events across the continent" },
];

export type StoryKind = "Verdict" | "Data" | "Explainer";

export type StoryCard = {
  key: string;
  href: string;
  title: string;
  date: string;
  kind: StoryKind;
  /** Colour and chip label: one of the six desks. */
  desk: DeskSlug;
  deskLabel: string;
  topic: TopicId;
  figure: { value: string; label: string | null } | null;
  /** Receipts first on the same day. */
  order: number;
};

const sectorTopic: Record<string, TopicId> = {
  "cost-of-living": "money",
  banking: "money",
  "public-money": "borrowing",
  markets: "borrowing",
  companies: "companies",
  africa: "africa",
};

const otherCountries = countries.filter((c) => c.slug !== "kenya").map((c) => c.name.replace("’", "'"));
const AFRICA_RX = new RegExp(`\\b(Africa|African|${otherCountries.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "i");
const has = (a: Article, ...topics: string[]) => topics.some((t) => a.topics?.includes(t));

function briefTopic(a: Article): { topic: TopicId; desk: DeskSlug } | null {
  const title = a.title.replace("’", "'");
  if (AFRICA_RX.test(title)) return { topic: "africa", desk: "africa" };
  if (has(a, "nse-disclosures", "capital-markets-conduct", "listed-banks", "insurance")) return { topic: "companies", desk: "companies" };
  if (has(a, "saccos", "bank-supervision")) return { topic: "money", desk: "banking" };
  if (/\bsavers?\b|\bKES \d|^Sending \$/i.test(title)) return { topic: "money", desk: "cost-of-living" };
  if (has(a, "treasury-bills", "mpc", "money-markets")) return { topic: "borrowing", desk: "markets" };
  return null;
}

/** A figure: an amount in KES, US$, $, ₦ or GH₵ (with bn/m/trn), or a percentage. */
const FIGURE_RX = /(?:KES|US\$|\$|₦|GH₵)\s?\d[\d,]*(?:\.\d+)?\s?(?:bn|trn|m)?\b|\d+(?:\.\d+)?%/g;

export function briefFigure(a: Article): StoryCard["figure"] {
  const first = a.teaser[0] ?? "";
  const found = first.match(FIGURE_RX) ?? [];
  // The figure's own clause as its label, so it is never shown without what it measures.
  return found.length === 1 ? { value: found[0].trim(), label: first.split(";")[0].trim() } : null;
}

const briefKind = (a: Article): StoryKind => (/^(How to|Anatomy of|When the)\b/i.test(a.title) ? "Explainer" : "Data");

export function receiptCard(r: Receipt): StoryCard {
  const desk = deskSlug(r.desk) ?? (r.sector as DeskSlug);
  const tile = r.tiles[0];
  return {
    key: `r-${r.slug}`,
    href: `/receipts/${r.slug}`,
    title: r.title,
    date: r.date,
    kind: r.type === "verdict" ? "Verdict" : "Data",
    desk,
    deskLabel: sectorNames[desk] ?? desk,
    topic: sectorTopic[r.sector] ?? "money",
    figure: tile ? { value: tile.value, label: tile.label } : null,
    order: 0,
  };
}

function briefCard(a: Article): StoryCard | null {
  const t = briefTopic(a);
  if (!t) return null;
  return {
    key: `b-${a.slug}`,
    href: articleHref(a.category, a.slug),
    title: a.title,
    date: a.date,
    kind: briefKind(a),
    desk: t.desk,
    deskLabel: sectorNames[t.desk],
    topic: t.topic,
    figure: briefFigure(a),
    order: 1,
  };
}

const PER_ROW = 4;

/**
 * The four rows without the lead story; empty rows are dropped. Each row's newest card stays first; with `now`, the
 * other places take turns among the next cards (lib/rotation.ts), so the page changes every few hours.
 */
export function frontPageRows(leadSlug: string | null, receipts: Receipt[] = visibleReceipts(), now?: number) {
  const cards = [
    ...receipts.filter((r) => r.slug !== leadSlug).map(receiptCard),
    ...getArticlesByCategory("brief").map(briefCard).filter((c): c is StoryCard => c != null),
  ].sort((a, b) => b.date.localeCompare(a.date) || a.order - b.order || a.key.localeCompare(b.key));
  return topicRows
    .map((row, i) => {
      const items = cards.filter((c) => c.topic === row.id);
      // "See all": the Receipts filtered to the row's most common sector, or the stories list when the row has no Receipts.
      const sectors = receipts.filter((r) => sectorTopic[r.sector] === row.id).map((r) => r.sector);
      const top = sectors.sort((a, b) => sectors.filter((s) => s === b).length - sectors.filter((s) => s === a).length)[0];
      return { ...row, items: now == null ? items.slice(0, PER_ROW) : rotateRow(items, PER_ROW, now, i), more: top ? `/receipts?sector=${top}` : "/stories" };
    })
    .filter((row) => row.items.length > 0);
}

const DAY = 86_400_000;
const fmtDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
/** Midnight in Nairobi (UTC+3, no daylight saving) at the start of an ISO date. */
const nairobiMidnight = (iso: string) => Date.parse(`${iso.slice(0, 10)}T00:00:00+03:00`);
const nairobiDay = (ms: number) => new Date(ms + 3 * 3_600_000).toISOString().slice(0, 10);

/**
 * Freshness from the item's date against the time the page was rendered on the server (`now`), never the reader's
 * clock, so the server and the browser print the same words. Items carry a date, not a time, so this is by Nairobi
 * calendar day: "Today", "Yesterday", "3 days ago" up to six days, then the date. "New" is under 48 hours since the
 * start of the item's day.
 */
export function freshness(iso: string, now: number) {
  const days = Math.round((nairobiMidnight(nairobiDay(now)) - nairobiMidnight(iso)) / DAY);
  const label = days <= 0 ? "Today" : days === 1 ? "Yesterday" : days < 7 ? `${days} days ago` : fmtDate.format(new Date(`${iso.slice(0, 10)}T00:00:00Z`));
  return { label, isNew: now - nairobiMidnight(iso) < 2 * DAY };
}
