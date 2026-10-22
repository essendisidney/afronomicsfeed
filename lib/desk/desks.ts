import fs from "node:fs";
import path from "node:path";
import { corrections } from "@/lib/corrections";

/**
 * The agent desks (docs/desks/, UPGRADE U7): one mandate file per desk, and a run log read from files in the repository
 * (no database table). A desk's own log lives in docs/desks/logs/<slug>/<YYYY-MM>.md; some desks already leave a
 * record elsewhere (the social log, the story log, data/health.json, the UI/UX audit), which is read as it is.
 *
 * Files are read at render time from the last deploy. A commit that only touches docs/ or editions/ does not redeploy
 * (vercel.json ignoreCommand), so a log line shows here after the next deploy.
 */

export const MANDATE_BASE = "https://github.com/essendisidney/afronomicsfeed/blob/main/docs/desks";

export type DeskSource = "log" | "social-receipts" | "social-posts" | "story-log" | "uiux-audit" | "health";
export type Desk = { slug: string; name: string; when: string; quiet: string | null; sources: DeskSource[] };

/** Times are Nairobi (UTC+3), as recorded in lib/desk/reference.ts and the mandate files. */
export const DESKS: Desk[] = [
  { slug: "sale-watch", name: "Sale watch", when: "Every 2 h, 07:07–21:07", quiet: "No new payments.", sources: ["log"] },
  { slug: "desk-operator", name: "Desk operator and support", when: "Weekdays 08:41, 13:41, 17:41", quiet: "Desk quiet.", sources: ["log"] },
  { slug: "sales-operator", name: "Sales operator", when: "Weekdays 09:23; Fri 15:47 report", quiet: "Sales quiet.", sources: ["log"] },
  { slug: "editorial", name: "Editorial desk (stories and Receipts)", when: "Mon, Wed, Fri 07:47; dated releases 06:45", quiet: null, sources: ["log", "story-log"] },
  { slug: "receipt-autopost", name: "Receipt auto-post", when: "One Receipt a run", quiet: "No new Receipt to post.", sources: ["log", "social-receipts"] },
  { slug: "company-posts", name: "Company-page posts", when: "Weekdays 07:25; Thu 18:13 T-bills", quiet: null, sources: ["log", "social-posts"] },
  { slug: "uiux-weekly", name: "UI/UX weekly pass", when: "Weekly", quiet: null, sources: ["log", "uiux-audit"] },
  { slug: "data-readers", name: "Data readers and workflows", when: "GitHub Actions; health check daily 07:47", quiet: null, sources: ["log", "health"] },
];

export const OUTCOMES = ["done", "quiet", "held", "escalated", "failed"] as const;
export type Outcome = (typeof OUTCOMES)[number];
export type RunEntry = { date: string; time: string | null; outcome: Outcome; summary: string; from: string };

/** `- 2026-10-22 08:41 · escalated · one pilot request waits on the founder (lead 42)` */
const LINE = /^-\s*(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?\s*·\s*(done|quiet|held|escalated|failed)\s*·\s*(.+?)\s*$/;

export function parseRunLog(text: string, from: string): RunEntry[] {
  const out: RunEntry[] = [];
  for (const line of text.split("\n")) {
    const m = line.match(LINE);
    if (m) out.push({ date: m[1], time: m[2] ?? null, outcome: m[3] as Outcome, summary: m[4], from });
  }
  return out;
}

// Every path below is a literal under process.cwd(), so the build traces only those folders.
const readFile = (f: string) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null);

function deskLog(slug: string): RunEntry[] {
  const dir = path.join(process.cwd(), "docs", "desks", "logs", slug);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}\.md$/.test(f))
    .flatMap((f) => parseRunLog(fs.readFileSync(path.join(dir, f), "utf8"), `docs/desks/logs/${slug}/${f}`));
}

/** editions/social/log lines: `- 2026-10-17 · Receipt: … · https://…`. */
function socialLog(): { date: string; title: string }[] {
  const dir = path.join(process.cwd(), "editions", "social", "log");
  if (!fs.existsSync(dir)) return [];
  const out: { date: string; title: string }[] = [];
  for (const f of fs.readdirSync(dir).filter((x) => /^\d{4}-\d{2}\.md$/.test(x))) {
    for (const line of fs.readFileSync(path.join(dir, f), "utf8").split("\n")) {
      const m = line.match(/^-\s*(\d{4}-\d{2}-\d{2})\s*·\s*(.+?)(?:\s*·\s*\S+)?\s*$/);
      if (m) out.push({ date: m[1], title: m[2] });
    }
  }
  return out;
}

function storyLog(): RunEntry[] {
  try {
    const j = JSON.parse(readFile(path.join(process.cwd(), "data", "story_log.json")) ?? "{}") as { stories?: { date: string; slug: string }[] };
    return (j.stories ?? []).map((s) => ({ date: s.date, time: null, outcome: "done" as const, summary: `Story published: ${s.slug}`, from: "data/story_log.json" }));
  } catch {
    return [];
  }
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function uiuxAudit(): RunEntry[] {
  const text = readFile(path.join(process.cwd(), "docs", "design", "ui-ux-audit.md")) ?? "";
  const out: RunEntry[] = [];
  for (const m of text.matchAll(/^# Weekly pass (\d+): (\d{1,2}) (\w+) (\d{4})/gm)) {
    const month = MONTHS.indexOf(m[3]) + 1;
    if (month) out.push({ date: `${m[4]}-${String(month).padStart(2, "0")}-${m[2].padStart(2, "0")}`, time: null, outcome: "done", summary: `Weekly pass ${m[1]}`, from: "docs/design/ui-ux-audit.md" });
  }
  return out;
}

function healthCheck(): RunEntry[] {
  try {
    const h = JSON.parse(readFile(path.join(process.cwd(), "data", "health.json")) ?? "null") as { checked_on?: string; workflows?: { name: string; failures_in_row: number }[] } | null;
    if (!h?.checked_on) return [];
    const failing = (h.workflows ?? []).filter((w) => w.failures_in_row > 0).map((w) => w.name);
    return [
      {
        date: h.checked_on,
        time: null,
        outcome: failing.length ? "failed" : "done",
        summary: failing.length ? `Health check: failing ${failing.join(", ")}` : `Health check: ${(h.workflows ?? []).length} workflows passing`,
        from: "data/health.json",
      },
    ];
  } catch {
    return [];
  }
}

export type DeskStatus = Desk & { last: RunEntry | null; week: number };

/** Every desk with its latest recorded run and how many runs were recorded in the 7 days to `today` (YYYY-MM-DD). */
export function deskStatus(today: string): DeskStatus[] {
  const weekAgo = new Date(Date.parse(`${today}T00:00:00Z`) - 6 * 86400000).toISOString().slice(0, 10);
  const social = socialLog();
  return DESKS.map((d) => {
    const runs: RunEntry[] = d.sources.flatMap((s): RunEntry[] => {
      if (s === "log") return deskLog(d.slug);
      if (s === "story-log") return storyLog();
      if (s === "uiux-audit") return uiuxAudit();
      if (s === "health") return healthCheck();
      const receipts = s === "social-receipts";
      return social
        .filter((p) => p.title.startsWith("Receipt:") === receipts)
        .map((p) => ({ date: p.date, time: null, outcome: "done" as const, summary: `Posted: ${p.title}`, from: "editions/social/log" }));
    });
    runs.sort((a, b) => `${b.date} ${b.time ?? ""}`.localeCompare(`${a.date} ${a.time ?? ""}`));
    return { ...d, last: runs[0] ?? null, week: runs.filter((r) => r.date >= weekAgo && r.date <= today).length };
  });
}

export type NamedVerdict = { slug: string; names: string[]; approved: string; how: string; reply: string };
export type ReplyEntry = { receipt: string; subject: string; sent: string; window_ends: string; reply: string; quoted_on: string | null };
export type NamedVerdicts = {
  updated: string;
  target: number;
  verdicts: NamedVerdict[];
  held: { slug: string; names: string[]; why: string }[];
  replies: ReplyEntry[];
  corrections: number;
};

/** data/desk/named-verdicts.json, with corrections counted from the public log (lib/corrections.ts). */
export function loadNamedVerdicts(): NamedVerdicts | null {
  try {
    const j = JSON.parse(readFile(path.join(process.cwd(), "data", "desk", "named-verdicts.json")) ?? "null") as Omit<NamedVerdicts, "corrections"> | null;
    if (!j) return null;
    const slugs = new Set(j.verdicts.map((v) => v.slug));
    const fixed = corrections.filter((c) => {
      const m = c.pieceHref.match(/\/receipts\/([^/?#]+)/);
      return m ? slugs.has(m[1]) : false;
    }).length;
    return { ...j, corrections: fixed };
  } catch {
    return null;
  }
}
