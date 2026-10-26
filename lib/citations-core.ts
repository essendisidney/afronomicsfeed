/**
 * The citation log (docs/rebuild/upgrade-U6-plan.md, item C): every place outside Afronomics that quoted or linked
 * one of our figures, with its link. The log is data/citations.json, appended by scripts/log_citation.py (founder or
 * the Distribution desk) and never rewritten: a wrong entry is withdrawn by a new entry whose `corrects` names it.
 * Pure functions, no imports: tests/site/test_citations.py runs this file directly, and the Python script applies
 * the same rules.
 */

export const CITATION_KINDS = ["news", "research", "government", "industry", "blog", "social", "other"] as const;
export type CitationKind = (typeof CITATION_KINDS)[number];

export type Citation = {
  id: string;
  /** The day the citing piece was published, YYYY-MM-DD. */
  date: string;
  outlet: string;
  title: string;
  url: string;
  kind: CitationKind;
  /** What of ours it used, in a few words: "Kenya 364-day T-bill rate", "the Fuliza Receipt". */
  what: string;
  /** Our page it cited or linked, a path on the site ("/markets/kenya-tbills"), when known. */
  our_path: string | null;
  /** True when the piece links back to the site, not only names it. */
  linked: boolean;
  logged_on: string;
  logged_by: string;
  /** Set on a withdrawal: the id of the entry this one withdraws. */
  corrects?: string | null;
};

const ISO = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const ID = /^[a-z0-9][a-z0-9-]{2,80}$/;
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;
const OWN_HOST = /^https?:\/\/(www\.)?afronomicsfeed\.com(\/|$)/i;

/** What is wrong with one entry, as plain sentences; empty when it is fine. `today` bounds the dates (YYYY-MM-DD). */
export function citationErrors(c: Partial<Citation>, today: string): string[] {
  const errors: string[] = [];
  const text = (v: unknown) => typeof v === "string" && v.trim().length > 0;
  if (!text(c.id) || !ID.test(c.id!)) errors.push("id must be lower-case letters, digits and hyphens");
  if (!text(c.date) || !ISO.test(c.date!)) errors.push("date must be YYYY-MM-DD");
  else if (c.date! > today) errors.push("date is in the future");
  if (!text(c.logged_on) || !ISO.test(c.logged_on!)) errors.push("logged_on must be YYYY-MM-DD");
  else if (c.date && c.logged_on! < c.date) errors.push("logged before it was published");
  for (const f of ["outlet", "title", "what", "logged_by"] as const) {
    if (!text(c[f])) errors.push(`${f} is required`);
    else if ((c[f] as string).length > 200) errors.push(`${f} is longer than 200 characters`);
  }
  if (!text(c.url) || !/^https:\/\/[^\s]+$/.test(c.url!)) errors.push("url must be an https link");
  else if (OWN_HOST.test(c.url!)) errors.push("url is our own site; log the outside page that cited us");
  if (!CITATION_KINDS.includes(c.kind as CitationKind)) errors.push(`kind must be one of ${CITATION_KINDS.join(", ")}`);
  if (c.our_path != null && !/^\/[^\s]*$/.test(c.our_path)) errors.push("our_path must be a path on the site, starting with /");
  if (typeof c.linked !== "boolean") errors.push("linked must be true or false");
  // People's contact details stay in the private contacts file (tests/site/test_no_contacts_in_docs.py).
  if ([c.outlet, c.title, c.what, c.logged_by].some((v) => typeof v === "string" && EMAIL.test(v))) errors.push("no email addresses in the log");
  return errors;
}

/** The entries that stand: every entry not withdrawn by a later one, and not itself a withdrawal. Newest first. */
export function standing(entries: Citation[]): Citation[] {
  const withdrawn = new Set(entries.map((e) => e.corrects).filter(Boolean));
  return entries.filter((e) => !e.corrects && !withdrawn.has(e.id)).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}

/** Counts for the desk and the scoreboard (UPGRADE §4, "Outside citations"). `today` is YYYY-MM-DD. */
export function citationSummary(entries: Citation[], today: string) {
  const list = standing(entries);
  const back = (days: number) => new Date(Date.parse(`${today}T00:00:00Z`) - days * 86400000).toISOString().slice(0, 10);
  const week = back(7);
  const month = back(30);
  return {
    total: list.length,
    last7: list.filter((e) => e.date > week).length,
    last30: list.filter((e) => e.date > month).length,
    linked: list.filter((e) => e.linked).length,
    outlets: new Set(list.map((e) => e.outlet.trim().toLowerCase())).size,
  };
}
