/**
 * "Since your last visit" on Today (phase-7b-plan.md, 7b-4 item 2): what moved between the snapshot a browser kept on
 * its last visit and the figures now. Kept only in that browser (localStorage); nothing is sent anywhere. Free of
 * imports so tests run it directly (tests/site/test_since.py).
 */

/** A figure as Today shows it, in percent (bill rates, the policy rate, the top fund's yield). */
export type Mark = { id: string; label: string; value: number };
export type Snapshot = { at: string; marks: Record<string, number>; receipts: string[] };
export type Story = { slug: string; title: string };

const DAY = 86_400_000;
const WEEKDAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "yesterday", "Tuesday" within the week, "3 Oct" before that (Nairobi time, UTC+3). */
export function whenLabel(thenIso: string, nowIso: string): string {
  const nbo = (iso: string) => new Date(Date.parse(iso) + 3 * 3_600_000);
  const then = nbo(thenIso);
  const now = nbo(nowIso);
  const days = Math.round((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.UTC(then.getUTCFullYear(), then.getUTCMonth(), then.getUTCDate())) / DAY);
  if (days <= 0) return "earlier today";
  if (days === 1) return "yesterday";
  if (days < 7) return WEEKDAY[then.getUTCDay()];
  return `${then.getUTCDate()} ${MONTH[then.getUTCMonth()]}`;
}

/** The changes, as short phrases: figures that moved by at least 1 basis point, then new stories. */
export function changes(prev: Snapshot, marks: Mark[], stories: Story[]): { moved: string[]; fresh: Story[] } {
  const moved: string[] = [];
  for (const m of marks) {
    const before = prev.marks[m.id];
    if (before == null || !Number.isFinite(before)) continue;
    const bps = Math.round((m.value - before) * 100);
    if (bps) moved.push(`${m.label} ${bps > 0 ? "+" : "−"}${Math.abs(bps)} bps`);
  }
  const seen = new Set(prev.receipts);
  return { moved, fresh: stories.filter((s) => !seen.has(s.slug)) };
}

export function snapshot(marks: Mark[], stories: Story[], nowIso: string): Snapshot {
  return { at: nowIso, marks: Object.fromEntries(marks.map((m) => [m.id, m.value])), receipts: stories.map((s) => s.slug) };
}

/** The one line the strip shows to a returning reader. */
export function sinceLine(prev: Snapshot, marks: Mark[], stories: Story[], nowIso: string): string {
  const { moved, fresh } = changes(prev, marks, stories);
  const when = whenLabel(prev.at, nowIso);
  const parts = [...moved];
  if (fresh.length === 1) parts.push(`new: ${fresh[0].title}`);
  else if (fresh.length > 1) parts.push(`${fresh.length} new Receipts`);
  const since = when === "earlier today" ? "Since earlier today" : `Since ${when}`;
  return parts.length ? `${since}: ${parts.join(" · ")}` : `${since}: no change in these numbers yet`;
}
