/**
 * The Mwananchi engine: which everyday money problem Afronomics should build for, write about or push next.
 * Free of imports so tests run it directly (tests/site/test_mwananchi.py); the catalogue is data/mwananchi/pains.json
 * and the desk shows the ranking (app/desk/MwananchiPanel.tsx).
 *
 * Score = need × season × data × money × demand × build.
 * - need: reach × hurt (the desk's 1-5 estimates), more for problems felt daily than yearly.
 * - season: 1.5 in a month the problem peaks, or the month before (time to publish ahead of it).
 * - data: held 1, public 0.7 (one reader to write first), none 0.4 (a story, not a tool).
 * - money: 1 + 0.15 for each way it can earn (newsletter, alerts, referral, sponsor, pro, b2b).
 * - demand: 1, plus up to 1 for readers' empty searches matching its keywords, plus up to 1 for its pages' views.
 * - build: a problem with no tool yet scores 1 / √effort days; one we already serve scores 0.5, so it surfaces when
 *   in season or in demand ("push it"), not every day.
 */

export type Often = "daily" | "monthly" | "termly" | "yearly" | "once";
export type Money = "newsletter" | "alerts" | "referral" | "sponsor" | "pro" | "b2b";
export type Pain = {
  id: string;
  pain: string;
  who: string;
  reach: number;
  hurt: number;
  often: Often;
  months: number[];
  data: "held" | "public" | "none";
  money: Money[];
  effort_days: number;
  tool: string | null;
  paths: string[];
  keywords: string[];
  next: string;
};
export type Signals = {
  /** 1-12. */
  month: number;
  /** Readers' searches that found nothing (cleaned words, lib/signals-core.ts), with counts. */
  misses?: { query: string; count: number }[];
  /** Page views over 7 days by path. */
  views?: { path: string; views: number }[];
};
export type Action = "build" | "collect" | "story" | "push" | "keep";
export type Ranked = { pain: Pain; score: number; action: Action; why: string[] };

const OFTEN: Record<Often, number> = { daily: 1.5, monthly: 1.3, termly: 1.15, yearly: 1, once: 0.8 };
const DATA = { held: 1, public: 0.7, none: 0.4 } as const;

export const ACTION_LABEL: Record<Action, string> = {
  build: "Build the tool",
  collect: "Collect the data, then build",
  story: "Write the story",
  push: "Push it this week",
  keep: "Keep it fresh",
};

/** In season: a peak month, or the month before one. */
export function inSeason(months: number[], month: number) {
  const next = (month % 12) + 1;
  return months.includes(month) || months.includes(next);
}

/** Readers' empty searches that mention one of the problem's keywords (substring match on the cleaned words). */
export function missesFor(p: Pain, misses: Signals["misses"] = []) {
  const keys = p.keywords.map((k) => k.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  return misses.filter((m) => keys.some((k) => k && m.query.includes(k))).reduce((n, m) => n + m.count, 0);
}

export function viewsFor(p: Pain, views: Signals["views"] = []) {
  return views.filter((v) => p.paths.includes(v.path)).reduce((n, v) => n + v.views, 0);
}

export function score(p: Pain, s: Signals): Ranked {
  const why: string[] = [];
  const need = p.reach * p.hurt * OFTEN[p.often];
  const season = inSeason(p.months, s.month) ? 1.5 : 1;
  if (season > 1) why.push("in season");
  const data = DATA[p.data];
  const money = 1 + 0.15 * p.money.length;
  const missed = missesFor(p, s.misses);
  const viewed = viewsFor(p, s.views);
  const demand = 1 + Math.min(1, missed / 20) + Math.min(1, viewed / 500);
  if (missed) why.push(`${missed} empty search${missed === 1 ? "" : "es"}`);
  if (viewed) why.push(`${viewed} views in 7 days`);
  const build = p.tool ? 0.5 : 1 / Math.sqrt(Math.max(1, p.effort_days));

  let action: Action;
  if (p.tool) action = season > 1 || missed > 0 ? "push" : "keep";
  else if (p.data === "held") action = "build";
  else if (p.data === "public") action = "collect";
  else action = "story";
  if (!p.tool) why.push(p.data === "held" ? "we hold the data" : p.data === "public" ? "data is published" : "no data yet");
  why.push(`earns via ${p.money.join(", ")}`);

  return { pain: p, score: Math.round(need * season * data * money * demand * build * 10) / 10, action, why };
}

/** The whole catalogue, best first. */
export function rank(pains: Pain[], s: Signals): Ranked[] {
  return pains.map((p) => score(p, s)).sort((a, b) => b.score - a.score || a.pain.id.localeCompare(b.pain.id));
}

/**
 * What the desk shows: the three problems we do not serve yet, best first (build, collect or write), and the three we
 * do serve that are in season or being searched for (push). A served problem with no signal is left to its routine.
 */
export function nextMoves(pains: Pain[], s: Signals, n = 3) {
  const all = rank(pains, s);
  return { build: all.filter((r) => !r.pain.tool).slice(0, n), push: all.filter((r) => r.action === "push").slice(0, n) };
}
