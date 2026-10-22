import fs from "node:fs";
import path from "node:path";
import type { PilotKey } from "./money-core";

/**
 * The logic behind the morning desk: what needs the founder today, key status and the inbox. There are no follow-ups
 * here: the founder stopped all follow-ups and chasing on 22 Oct 2026 (D-034). Pure functions over what the desk functions return, so the page stays a plain layout.
 */

export const DAY = 86400000;
export const PILOT_DAYS = 30;

/** af_desk_today (migration 0040). Amounts in the currency's subunit; status 'success' only. */
export type TodayData = {
  money: { currency: string | null; today: number; d7: number; d30: number; all_time: number; n_today: number; n_all: number }[];
  key_days: { id: number; plan: string; expires_at: string | null; revoked_at: string | null; days_used: number; days_used_7d: number }[];
  campaigns: { campaign: string; views_7d: number; people_7d: number; views_30d: number; top_path: string | null }[];
  briefs: { path: string; views_7d: number; views_30d: number; linkedin_30d: number }[];
};

export type MoneyWindow = { label: string; rows: { currency: string | null; amount: number }[]; count?: number };

/** A key with everything the pilots panel shows. */
export type KeyRow = PilotKey & {
  prefix?: string;
  expires_at?: string | null;
  calls_7d: number | null;
  last_day: string | null;
  paths_30d: string[];
  days_used: number | null;
  days_used_7d: number | null;
};

export type InboxKind = "lead" | "survey" | "feedback";
export type InboxCategory = "pilot" | "invoice" | "enquiry" | "survey" | "feedback";
export type InboxItem = {
  kind: InboxKind;
  id: number | null;
  at: string;
  category: InboxCategory;
  title: string;
  meta: string;
  text: string | null;
  email: string | null;
  handled: boolean;
};

export type RawInbox = {
  kind: InboxKind;
  id: number;
  at: string;
  interest: string | null;
  source: string | null;
  organisation: string | null;
  name: string | null;
  email: string | null;
  text: string | null;
  path: string | null;
  handled_at: string | null;
}[];

export const CATEGORY_LABEL: Record<InboxCategory, string> = {
  pilot: "Pilot request",
  invoice: "Invoice request",
  enquiry: "Enquiry",
  survey: "Survey note",
  feedback: "Feedback",
};

const SURVEY_Q: Record<string, string> = { pay_next: "Would pay for next", use_for: "Uses it for" };

function leadCategory(source: string | null, message: string | null): InboxCategory {
  if (source?.startsWith("pilot:") || /^30-day pilot request/i.test(message ?? "")) return "pilot";
  if (source?.startsWith("invoice:") || /^Invoice request:/i.test(message ?? "")) return "invoice";
  return "enquiry";
}

/** From af_desk_inbox (0040): every item with its id, so it can be marked handled. */
export function inboxFromRaw(raw: RawInbox): InboxItem[] {
  return raw.map((r) => {
    if (r.kind === "lead") {
      const category = leadCategory(r.source, r.text);
      return {
        kind: r.kind, id: r.id, at: r.at, category, email: r.email, handled: Boolean(r.handled_at), text: r.text,
        title: r.organisation || r.name || "No organisation given",
        meta: [r.interest, r.name && r.organisation ? r.name : null, r.source?.replace(/^(pilot|invoice):/, "")].filter(Boolean).join(" · "),
      };
    }
    if (r.kind === "survey") {
      const [q, a] = (r.interest ?? ":").split(":");
      return { kind: r.kind, id: r.id, at: r.at, category: "survey", email: null, handled: Boolean(r.handled_at), text: r.text, title: `${SURVEY_Q[q] ?? q}: ${a}`, meta: r.path ?? "" };
    }
    return {
      kind: r.kind, id: r.id, at: r.at, category: "feedback", email: null, handled: Boolean(r.handled_at), text: r.text,
      title: r.interest === "found" ? "Found what they came for" : "Did not find it", meta: [r.path, r.source].filter(Boolean).join(" · "),
    };
  });
}

/** Before migration 0040: the same items from af_desk and af_desk_funnel, without ids (read-only). */
export function inboxFallback(
  leads: { when: string; organisation: string | null; interest: string; message: string | null; name: string | null; email: string }[],
  feedback: { when: string; path: string; found: boolean; role: string | null; looking_for: string | null }[],
  surveyNotes: { when: string; question: string; answer: string; path: string; note: string }[],
): InboxItem[] {
  const items: InboxItem[] = [
    ...leads.map((l) => ({
      kind: "lead" as const, id: null, at: l.when, category: leadCategory(null, l.message), email: l.email, handled: false, text: l.message,
      title: l.organisation || l.name || "No organisation given", meta: [l.interest, l.organisation ? l.name : null].filter(Boolean).join(" · "),
    })),
    ...feedback
      .filter((f) => f.looking_for || !f.found)
      .map((f) => ({
        kind: "feedback" as const, id: null, at: f.when, category: "feedback" as const, email: null, handled: false, text: f.looking_for,
        title: f.found ? "Found what they came for" : "Did not find it", meta: [f.path, f.role].filter(Boolean).join(" · "),
      })),
    ...surveyNotes.map((s) => ({
      kind: "survey" as const, id: null, at: s.when, category: "survey" as const, email: null, handled: false, text: s.note,
      title: `${SURVEY_Q[s.question] ?? s.question}: ${s.answer}`, meta: s.path,
    })),
  ];
  return items.sort((a, b) => b.at.localeCompare(a.at));
}

/** Status for one key: the day of a pilot, days left, and whether it has ended. */
export function pilotFlag(k: KeyRow, now: number) {
  const day = Math.floor((now - Date.parse(k.created_at)) / DAY) + 1;
  const end = k.expires_at ? Date.parse(k.expires_at) : k.plan === "trial" ? Date.parse(k.created_at) + PILOT_DAYS * DAY : null;
  const daysLeft = end == null ? null : Math.ceil((end - now) / DAY);
  return { day, daysLeft, expired: !k.revoked_at && daysLeft != null && daysLeft <= 0 };
}

export type Need = { rule: string; label: string; detail?: string; href: string; tone: "down" | "warn" | "neutral"; action?: { kind: "access"; reference: string } };

/** "Needs you today": access to send, inbox items waiting, setup gaps. Never a follow-up. */
export function needsToday({
  payments,
  inbox,
  setup,
  now,
}: {
  payments: { reference: string; plan: string | null; amount: number; currency: string | null; status: string; paid_at: string; access_sent_at: string | null }[];
  inbox: InboxItem[];
  setup: { label: string; detail: string }[];
  now: number;
}): Need[] {
  const out: Need[] = [];
  for (const p of payments.filter((x) => x.status === "success" && !x.access_sent_at)) {
    out.push({ rule: "Access not sent", label: `${p.plan ?? "payment"} paid ${p.paid_at.slice(0, 10)}`, detail: p.reference, href: "#ref-payments", tone: "down", action: { kind: "access", reference: p.reference } });
  }
  const weekAgo = new Date(now - 7 * DAY).toISOString();
  const waiting = inbox.filter((i) => !i.handled && i.at >= weekAgo);
  const order: InboxCategory[] = ["pilot", "invoice", "enquiry", "survey", "feedback"];
  for (const i of waiting.sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category) || b.at.localeCompare(a.at))) {
    out.push({ rule: `${CATEGORY_LABEL[i.category]} waiting`, label: i.title, detail: i.meta, href: "#inbox", tone: i.category === "pilot" || i.category === "invoice" ? "warn" : "neutral" });
  }
  for (const s of setup) out.push({ rule: "Setup", label: s.label, detail: s.detail, href: "#needs", tone: "neutral" });
  return out;
}

/** Social posts logged in editions/social/log/<yyyy-mm>.md ("- 2026-10-12 · Title · url"), newest first. */
export function readSocialLog(sinceDay: string) {
  const dir = path.join(process.cwd(), "editions", "social", "log");
  if (!fs.existsSync(dir)) return [];
  const posts: { date: string; title: string; url: string | null }[] = [];
  for (const f of fs.readdirSync(dir).filter((x) => /^\d{4}-\d{2}\.md$/.test(x))) {
    for (const line of fs.readFileSync(path.join(dir, f), "utf8").split("\n")) {
      const m = line.match(/^-\s*(\d{4}-\d{2}-\d{2})\s*·\s*(.+?)(?:\s*·\s*(\S+))?\s*$/);
      if (m && m[1] >= sinceDay) posts.push({ date: m[1], title: m[2], url: m[3]?.startsWith("http") ? m[3] : null });
    }
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

/** Stories from data/story_log.json since a day, newest first. */
export function readStoryLog(sinceDay: string) {
  const f = path.join(process.cwd(), "data", "story_log.json");
  if (!fs.existsSync(f)) return [];
  try {
    const j = JSON.parse(fs.readFileSync(f, "utf8")) as { stories?: { date: string; market?: string; slug: string }[] };
    return (j.stories ?? []).filter((s) => s.date >= sinceDay).sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return [];
  }
}
