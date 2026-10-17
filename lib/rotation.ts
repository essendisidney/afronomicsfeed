import type { Receipt } from "@/lib/receipts";

/**
 * Front-page rotation (docs: this file). Today shows something different every few hours, without ever inventing an
 * order: the rotation only chooses which already-published item goes first.
 *
 * - The day is cut into 3-hour windows in Nairobi time (00:00, 03:00, ... 21:00). Each window has a number; the same
 *   window always gives the same page, so the server and every reader see the same thing, and the page (revalidated
 *   every 15 minutes) changes at most once a window.
 * - Lead story: a Receipt dated today (Nairobi) always leads on its first day; two or more on the same day take turns.
 *   Otherwise the lead takes turns among the public Receipts dated in the last LEAD_DAYS days. With none that recent,
 *   the newest leads, as before.
 * - Story rows: the newest card stays first, so a new story is never hidden; the other places take turns among the
 *   next ROW_POOL cards.
 * - Tools: the tiles take turns at the front, keeping their order otherwise.
 */

export const SLOT_HOURS = 3;
export const LEAD_DAYS = 14;
export const ROW_POOL = 9;

const HOUR = 3_600_000;
const NAIROBI_OFFSET = 3 * HOUR; // UTC+3, no daylight saving

/** The number of the 3-hour Nairobi window that holds `now`. */
export function slotOf(now: number): number {
  return Math.floor((now + NAIROBI_OFFSET) / (SLOT_HOURS * HOUR));
}

/** When the window holding `now` ends (ms since epoch), for "next change" notes and tests. */
export function slotEnds(now: number): number {
  return (slotOf(now) + 1) * SLOT_HOURS * HOUR - NAIROBI_OFFSET;
}

const nairobiDay = (ms: number) => new Date(ms + NAIROBI_OFFSET).toISOString().slice(0, 10);
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000);

/** `items` turned `n` places to the left: [a, b, c] by 1 is [b, c, a]. */
export function rotate<T>(items: T[], n: number): T[] {
  if (items.length < 2) return items.slice();
  const k = ((n % items.length) + items.length) % items.length;
  return [...items.slice(k), ...items.slice(0, k)];
}

/** The Receipts that take turns leading in this window, newest first (ties by slug). */
export function leadPool(receipts: Receipt[], now: number): Receipt[] {
  const today = nairobiDay(now);
  const sorted = receipts.slice().sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  const fresh = sorted.filter((r) => r.date.slice(0, 10) === today);
  if (fresh.length) return fresh;
  const recent = sorted.filter((r) => daysBetween(today, r.date.slice(0, 10)) <= LEAD_DAYS);
  return recent.length ? recent : sorted.slice(0, 1);
}

/** This window's lead story, or null when nothing is published. */
export function pickLead(receipts: Receipt[], now: number): Receipt | null {
  const pool = leadPool(receipts, now);
  return pool.length ? pool[slotOf(now) % pool.length] : null;
}

/** A story row for this window: the newest card first, then `size - 1` cards taking turns among the next ROW_POOL. */
export function rotateRow<T>(newestFirst: T[], size: number, now: number, salt = 0): T[] {
  if (newestFirst.length <= size) return newestFirst.slice();
  const [first, ...rest] = newestFirst;
  const pool = rest.slice(0, ROW_POOL);
  return [first, ...rotate(pool, slotOf(now) + salt).slice(0, size - 1)];
}
