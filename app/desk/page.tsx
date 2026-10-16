import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { loadBonds } from "@/lib/data/kenya-bonds";
import { loadKenyaRates } from "@/lib/data/kenya-rates";
import { loadHealth } from "@/lib/data/health";
import { loadLatency } from "@/lib/data/latency";
import { renderTime } from "@/lib/data/fetcher";
import { rpc } from "@/lib/store";
import { moneyLabel } from "@/lib/billing/plans";
import { CONTACTED } from "@/lib/strategy/board";
import { DeskKey } from "./DeskKey";
import { OwnerDevice } from "./OwnerDevice";
import { MoneyPanel, type Money, type Referral } from "./MoneyPanel";
import { CommandCentre, toUsd, type PilotKey } from "./CommandCentre";
import { StrategyBoard } from "./StrategyBoard";
import { FunnelPanel, type Funnel } from "./FunnelPanel";
import { loadFxQuote } from "@/lib/data/fx";
import { AddCorrection, AddPress, GrantAccess, HideReport } from "./DeskActions";
import { country as reportCountry, item as reportItem } from "@/lib/reader-reports-core";
import { TodayStrip, type Gate } from "./TodayStrip";
import { PipelineBoard } from "./PipelineBoard";
import { Inbox } from "./Inbox";
import { PilotsPanel } from "./PilotsPanel";
import { CasebookPanel } from "./CasebookPanel";
import { loadCases } from "@/lib/cases";
import { ContentPanel, type Campaign } from "./ContentPanel";
import { DecisionsPanel, HealthPanel, RoutinesPanel, type Freshness } from "./OpsPanels";
import { Cockpit } from "./Cockpit";
import { contentLane, healthLane, moneyLane, readersLane } from "./cockpit-core";
import { loadReceipts } from "@/lib/receipts";
import { editorialRows } from "@/lib/editorial";
import {
  inboxFallback,
  inboxFromRaw,
  needsToday,
  readSocialLog,
  readStoryLog,
  type DealRow,
  type KeyRow,
  type MoneyWindow,
  type RawInbox,
  type TodayData,
} from "./today-core";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Desk", robots: { index: false, follow: false } };

type Payments = {
  recent: { reference: string; email: string | null; plan: string | null; amount: number; currency: string | null; status: string; channel: string | null; paid_at: string; access_sent_at: string | null }[];
  totals: { currency: string | null; count: number; amount: number; month_amount: number }[];
  subscriptions: { code: string; email: string | null; plan_code: string | null; status: string; next: string | null }[];
};

type Desk = {
  views_by_day: { day: string; views: number }[];
  views_7d: number;
  views_prev_7d: number;
  top_pages: { path: string; views: number }[];
  referrers: { host: string; views: number }[];
  countries: { country: string; views: number }[];
  downloads_7d: { path: string; views: number }[];
  api_7d: { path: string; caller: string; calls: number }[];
  embeds_7d: { path: string; host: string; views: number }[];
  subscribers: number;
  subscribers_7d: number;
  unsubscribed_7d: number;
  alert_subs: number;
  alert_subs_7d: number;
  leads: { when: string; organisation: string | null; interest: string; message: string | null; name: string | null; email: string }[];
  leads_total: number;
  feedback: { when: string; path: string; found: boolean; role: string | null; looking_for: string | null }[];
  feedback_found_rate: number | null;
  fx_last_day: string | null;
  wire_last: string | null;
  wire_24h: number;
  push_state: { market: string; last_date: string }[];
};

type ReaderReport = { id: number; kind: string; country: string; item: string | null; amount: number | null; place: string | null; note: string | null; contact: string | null; status: string; created_at: string };

type People = {
  people_by_day: { day: string; people: number; views: number }[];
  people_7d: number;
  people_prev_7d: number;
  people_sources_7d: { source: string; people: number }[];
  people_countries_7d: { country: string; people: number }[];
  actions_7d: { name: string; count: number | null; prev: number | null }[];
  actions_pages_7d: { name: string; path: string; count: number }[];
};

const ACTION_LABEL: Record<string, string> = {
  newsletter_signup: "Newsletter sign-ups",
  alert_signup: "Email rate alerts",
  push_alert_on: "Phone alerts switched on",
  reader_report: "Prices and rates reported",
  reader_story: "Stories sent to the editor",
  rate_check: "“Is my rate fair?” checks",
  share: "Shares",
  enquiry: "Enquiries",
  checkout_start: "Checkouts started",
};

// People per day are counted from 7 Oct 2026, when the daily marker and owner exclusion went live.
const PEOPLE_FROM = "2026-10-07";

type Audience = {
  returning_by_day: { day: string; views: number; returning: number }[];
  returning_7d: number;
  linkedin: { path: string; source: string; views: number; views_7d: number | null; last_day: string }[];
};

// Returning readers are counted from 5 Oct 2026, when the first-visit marker went live.
const RETURNING_FROM = "2026-10-05";

/** "utm:linkedin/story" -> "LinkedIn post (story)"; a bare host stays as it is. */
const sourceLabel = (source: string) => {
  const m = source.match(/^utm:linkedin\/?(.*)$/);
  return m ? `LinkedIn post${m[1] ? ` (${m[1]})` : ""}` : source;
};

const DAY = 86400000;

const EMPTY_DESK: Desk = {
  views_by_day: [], views_7d: 0, views_prev_7d: 0, top_pages: [], referrers: [], countries: [], downloads_7d: [], api_7d: [], embeds_7d: [],
  subscribers: 0, subscribers_7d: 0, unsubscribed_7d: 0, alert_subs: 0, alert_subs_7d: 0, leads: [], leads_total: 0, feedback: [],
  feedback_found_rate: null, fx_last_day: null, wire_last: null, wire_24h: 0, push_state: [],
};
const ago = (iso: string | null, now: number) => {
  if (!iso) return "never";
  const h = (now - Date.parse(iso)) / 3600000;
  return h < 1 ? `${Math.round(h * 60)} min ago` : h < 48 ? `${Math.round(h)} h ago` : `${Math.round(h / 24)} d ago`;
};
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

function Stat({ label, value, note, tone }: { label: string; value: string | number; note?: string; tone?: "up" | "down" | "warn" }) {
  return (
    <div className="bg-surface px-4 py-4">
      <p className="text-[12px] text-muted">{label}</p>
      <p className={`mt-1 font-serif text-3xl ${tone === "warn" ? "text-down" : "text-ink"}`}>{value}</p>
      {note ? <p className={`mt-0.5 text-[12px] ${tone === "up" ? "text-up" : tone === "down" ? "text-down" : "text-muted"}`}>{note}</p> : null}
    </div>
  );
}

function Bars({ rows, now }: { rows: { day: string; views: number; returning?: number }[]; now: number }) {
  const max = Math.max(1, ...rows.map((r) => r.views));
  const days: { day: string; views: number; returning: number }[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(now - i * DAY).toISOString().slice(0, 10);
    const row = rows.find((r) => r.day === d);
    days.push({ day: d, views: row?.views ?? 0, returning: row?.returning ?? 0 });
  }
  return (
    <div className="flex h-28 items-end gap-[3px]">
      {days.map((d) => (
        <div
          key={d.day}
          className="flex h-full flex-1 flex-col justify-end"
          title={`${dayFmt.format(new Date(d.day))}: ${d.views} views${d.day >= RETURNING_FROM ? `, ${d.returning} from returning readers` : ""}`}
        >
          {/* Returning readers in forest at the foot of each bar, first visits above in accent. */}
          <div className="flex w-full flex-col justify-end overflow-hidden rounded-t-sm bg-accent" style={{ height: `${Math.max(2, (d.views / max) * 100)}%` }}>
            <div className="w-full bg-forest" style={{ height: `${d.views ? (d.returning / d.views) * 100 : 0}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

type ApiKey = PilotKey & { prefix: string; expires_at?: string | null };

/** A function missing from the database (migration not applied) rather than a refusal or an outage. */
const missing = (r: { ok: boolean; reason?: string } | null) => Boolean(r && !r.ok && /PGRST202|^404/.test(r.reason ?? ""));
const value = <T,>(r: { ok: boolean; value?: unknown } | null, isOk: (v: unknown) => boolean = (v) => v != null): T | null =>
  r?.ok && isOk(r.value) ? (r.value as T) : null;

/** Nairobi is UTC+3 all year: the founder's day starts at 21:00 UTC. */
const NAIROBI = 3 * 3600000;

/** A folded reference group: everything the morning panels do not need, one tap away. */
function Ref({ id, title, note, children }: { id: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <details id={id} className="scroll-mt-20 rounded-2xl border border-rule bg-surface px-4 py-3 sm:px-5">
      <summary className="cursor-pointer list-none">
        <span className="font-serif text-lg text-ink">{title}</span>
        <span className="block text-[12px] text-muted">{note}</span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

const NAV: [string, string][] = [
  ["#cockpit", "At a glance"],
  ["#needs", "Today"],
  ["#pipeline", "Pipeline"],
  ["#inbox", "Inbox"],
  ["#pilots", "Pilots"],
  ["#content", "Content"],
  ["#health", "Data"],
  ["#routines", "Routines"],
  ["#decisions", "Decisions"],
  ["#casebook", "Casebook"],
  ["#reference", "Reference"],
];

export default async function DeskPage() {
  const key = (await cookies()).get("af_desk")?.value ?? "";
  // Local development only: the desk key "preview-empty" opens the desk with no data, to check layout and empty
  // states without the real key. Never active in a production build.
  const preview = process.env.NODE_ENV === "development" && key === "preview-empty";
  const result = key && !preview ? await rpc("af_desk", { p_secret: key }) : null;
  const desk = preview ? EMPTY_DESK : result?.ok && result.value ? (result.value as Desk) : null;

  if (!desk) {
    return (
      <PageShell share={false} crumbs={[{ href: "/", label: "Home" }, { label: "Desk" }]} kicker="Private" title="The desk">
        <p className="max-w-xl text-sm text-ink-soft">The owner’s view of Afronomics: money, the pipeline, the inbox, pilots, content and data health. Enter the desk key.</p>
        <div className="mt-6 max-w-sm">
          <DeskKey wrong={Boolean(key)} />
        </div>
      </PageShell>
    );
  }

  // Every desk function at once (each re-checks the key); the page waits for the slowest, not the sum.
  const call = (fn: string, args: Record<string, unknown> = {}) => (preview ? Promise.resolve(null) : rpc(fn, { p_secret: key, ...args }));
  const [pay, aud, ppl, mon, ref, keyList, dl, fun, rep, tod, inb, fx] = await Promise.all([
    call("af_payments"),
    call("af_desk_audience"),
    call("af_desk_people"),
    call("af_desk_money"),
    call("af_desk_referrals"),
    call("af_api_keys_list"),
    call("af_deals_list"),
    call("af_desk_funnel"),
    call("af_reader_report_list", { p_limit: 60 }),
    call("af_desk_today"),
    call("af_desk_inbox", { p_days: 30 }),
    preview ? Promise.resolve(null) : loadFxQuote(),
  ]);
  const payments = value<Payments>(pay);
  const audience = value<Audience>(aud);
  const people = value<People>(ppl);
  const money = value<Money>(mon);
  const referrals = value<Referral[]>(ref, Array.isArray) ?? [];
  const apiKeys = value<ApiKey[]>(keyList, Array.isArray) ?? [];
  const deals = value<DealRow[]>(dl, Array.isArray) ?? [];
  const funnel = value<Funnel>(fun);
  const reports = value<ReaderReport[]>(rep, Array.isArray) ?? [];
  const today0040 = value<TodayData>(tod);
  const rawInbox = value<RawInbox>(inb, Array.isArray);
  // Units of each currency per US dollar; a fixed fallback for KES only if the live rate is unavailable.
  const perUsd: Record<string, number> = { USD: 1, ...(fx?.rates ?? { KES: 129 }) };
  const fxNote = fx ? `${fx.sourceName} rates of ${fx.updated.slice(5, 16)}` : "a fixed KES 129 to the dollar (live rate unavailable)";

  const now = renderTime();
  const todayNbo = new Date(now + NAIROBI).toISOString().slice(0, 10);
  const nboMidnight = Date.parse(`${todayNbo}T00:00:00Z`) - NAIROBI;
  const weekAgoDay = new Date(now - 7 * DAY).toISOString().slice(0, 10);

  // Money: real payments (status 'success') only. From af_desk_today (0040) or, before it, the existing functions.
  const successes = (payments?.recent ?? []).filter((p) => p.status === "success" && p.paid_at);
  const w7 = money?.windows.find((w) => w.days === 7) ?? funnel?.windows.find((w) => w.days === 7);
  const w30 = money?.windows.find((w) => w.days === 30) ?? funnel?.windows.find((w) => w.days === 30);
  const windows: MoneyWindow[] = today0040
    ? [
        { label: "today", rows: today0040.money.map((m) => ({ currency: m.currency, amount: m.today })), count: today0040.money.reduce((n, m) => n + m.n_today, 0) },
        { label: "7 days", rows: today0040.money.map((m) => ({ currency: m.currency, amount: m.d7 })) },
        { label: "30 days", rows: today0040.money.map((m) => ({ currency: m.currency, amount: m.d30 })) },
        { label: "all time", rows: today0040.money.map((m) => ({ currency: m.currency, amount: m.all_time })), count: today0040.money.reduce((n, m) => n + m.n_all, 0) },
      ]
    : [
        {
          label: "today",
          rows: successes.filter((p) => Date.parse(p.paid_at) >= nboMidnight).map((p) => ({ currency: p.currency, amount: p.amount })),
          count: successes.filter((p) => Date.parse(p.paid_at) >= nboMidnight).length,
        },
        { label: "7 days", rows: w7?.paid ?? [] },
        { label: "30 days", rows: w30?.paid ?? [] },
        {
          label: "all time",
          rows: money ? money.revenue.map((r) => ({ currency: r.currency, amount: r.all_time })) : (payments?.totals ?? []).map((t) => ({ currency: t.currency, amount: t.amount })),
          count: money ? money.revenue.reduce((n, r) => n + r.payments, 0) : (payments?.totals ?? []).reduce((n, t) => n + t.count, 0),
        },
      ];
  const paidCount = windows[3].count ?? 0;
  const firstPaid = successes.map((p) => p.paid_at).sort()[0];

  // Keys: the list, plus 7-day use and markets (af_desk_funnel) and days used (af_desk_today).
  const usage = new Map((funnel?.keys ?? []).map((k) => [k.id, k]));
  const days = new Map((today0040?.key_days ?? []).map((k) => [k.id, k]));
  const keys: KeyRow[] = apiKeys.map((k) => ({
    ...k,
    calls_7d: usage.get(k.id)?.calls_7d ?? null,
    last_day: usage.get(k.id)?.last_day ?? null,
    paths_30d: usage.get(k.id)?.paths_30d ?? [],
    expires_at: k.expires_at ?? days.get(k.id)?.expires_at ?? null,
    days_used: days.get(k.id)?.days_used ?? null,
    days_used_7d: days.get(k.id)?.days_used_7d ?? null,
  }));

  const inbox = rawInbox ? inboxFromRaw(rawInbox) : inboxFallback(desk.leads, desk.feedback, funnel?.survey_notes ?? []);

  // Setup gaps the server can see without revealing a value: a missing migration, an unset secret.
  const setup: { label: string; detail: string }[] = [];
  if (!preview && (missing(tod) || missing(inb))) setup.push({ label: "Apply migration 0040", detail: "supabase/migrations/0040_desk_today.sql: days used, money today, inbox “mark handled”, traffic by campaign" });
  if (!preview && missing(fun)) setup.push({ label: "Apply migration 0034", detail: "the funnel, click counts and surveys" });
  if (!process.env.PAID_KEY_SECRET) setup.push({ label: "Set PAID_KEY_SECRET in Vercel", detail: "Paid keys are derived from the Paystack secret until it is set (security review L-5). A fresh 32-byte random value." });
  if (!process.env.DOWNLOAD_SECRET) setup.push({ label: "Set DOWNLOAD_SECRET in Vercel", detail: "Download sessions are signed with a key derived from PAID_KEY_SECRET or the cron secret until it is set." });
  if (!process.env.PAYSTACK_SECRET_KEY) setup.push({ label: "PAYSTACK_SECRET_KEY is not set here", detail: "Checkout and payment checks cannot run on this deployment." });

  const needs = needsToday({ payments: payments?.recent ?? [], deals, inbox, keys, setup, now, today: todayNbo });

  const contacted = deals.filter((d) => d.stage !== "prospect").length;
  const gate: Gate = {
    contacts: contacted,
    contactsNote: `deals past prospect; ${CONTACTED.count} sent per the decision log`,
    pilots5: today0040 ? today0040.key_days.filter((k) => k.plan === "trial" && k.days_used >= 5).length : null,
    pilotsNote: today0040
      ? `of ${keys.filter((k) => k.plan === "trial").length} pilot keys issued`
      : "needs migration 0040",
    firstPayment: firstPaid ? firstPaid.slice(0, 10) : paidCount > 0 ? "yes" : null,
  };

  // Content: the last 7 days of stories and LinkedIn posts, and what each campaign brought.
  const stories = readStoryLog(weekAgoDay);
  const posts = readSocialLog(weekAgoDay);
  const briefViews = today0040 ? new Map(today0040.briefs.map((b) => [b.path, b])) : null;
  const liBySource = new Map<string, number>();
  for (const r of audience?.linkedin ?? []) liBySource.set(r.source, (liBySource.get(r.source) ?? 0) + (r.views_7d ?? 0));
  const campaigns: Campaign[] = today0040
    ? today0040.campaigns
    : [...liBySource].map(([source, v]) => ({ campaign: sourceLabel(source), views_7d: v, people_7d: null, views_30d: null, top_path: null })).sort((a, b) => b.views_7d - a.views_7d);

  // Feed freshness from the repo files, so a stalled extractor shows here before anyone notices.
  const bonds = loadBonds().rows[0]?.value_date ?? null;
  const rates = loadKenyaRates();
  const freshness: Freshness[] = [
    ...billMarkets.map((m) => {
      const last = loadBillMarket(m.slug).rows[0]?.date ?? null;
      const age = last ? Math.round((now - Date.parse(last)) / DAY) : null;
      const expect = m.slug === "nigeria" || m.slug === "tanzania" || m.slug === "zambia" || m.slug === "uganda" ? 21 : 10;
      return { name: `${m.country} bills`, value: age == null ? "none" : `${age} d`, stale: age == null || age > expect, note: last ?? undefined };
    }),
    { name: "Kenya bonds", value: bonds ? `${Math.round((now - Date.parse(bonds)) / DAY)} d` : "none", stale: !bonds || now - Date.parse(bonds) >= 45 * DAY },
    { name: "Kenya rates", value: rates.updated_at ? ago(rates.updated_at, now) : "none", stale: !rates.updated_at || now - Date.parse(rates.updated_at) >= 3 * DAY },
    { name: "FX archive", value: desk.fx_last_day ?? "none", stale: !desk.fx_last_day || now - Date.parse(desk.fx_last_day) >= 2 * DAY },
    { name: "Wire archive", value: `${desk.wire_24h} / 24h`, stale: desk.wire_24h === 0, note: ago(desk.wire_last, now) },
    { name: "Alert checker", value: `${desk.push_state.length} markets`, stale: false },
  ];

  const change = desk.views_prev_7d ? Math.round(((desk.views_7d - desk.views_prev_7d) / desk.views_prev_7d) * 100) : null;
  const apiCalls = desk.api_7d.reduce((n, r) => n + r.calls, 0);
  const downloads = desk.downloads_7d.reduce((n, r) => n + r.views, 0);
  const returningShare = audience && desk.views_7d ? Math.round((audience.returning_7d / desk.views_7d) * 100) : null;
  const linkedin7d = audience ? audience.linkedin.reduce((n, r) => n + (r.views_7d ?? 0), 0) : null;
  const health = loadHealth();
  const lanes = [
    moneyLane({
      windows,
      perUsd,
      deals,
      keys,
      failedPayments7d: (payments?.recent ?? []).filter((p) => p.status === "failed" && (!p.paid_at || now - Date.parse(p.paid_at) < 7 * DAY)).length,
      now,
    }),
    readersLane({
      people7d: people?.people_7d ?? null,
      peoplePrev7d: people?.people_prev_7d ?? null,
      views7d: desk.views_7d,
      viewsPrev7d: desk.views_prev_7d,
      signups7d: desk.subscribers_7d,
      topSource: people?.people_sources_7d[0] ? sourceLabel(people.people_sources_7d[0].source) : (desk.referrers[0]?.host ?? null),
    }),
    contentLane({ receipts: loadReceipts(), calls: editorialRows(todayNbo), ideas: reports.filter((r) => r.kind === "story" && r.status === "new").length, today: todayNbo }),
    healthLane({ health, staleFeeds: freshness.filter((f) => f.stale).map((f) => f.name) }),
  ];
  const moneyNote = `Real payments only (status “success”; tests never counted). Today starts at midnight Nairobi. US dollars at ${fxNote}.${today0040 ? "" : " Before migration 0040, today is read from the 50 latest payments."}`;

  return (
    <PageShell share={false} crumbs={[{ href: "/", label: "Home" }, { label: "Desk" }]} kicker={`Private · ${new Date(now + NAIROBI).toUTCString().replace(" GMT", "").slice(0, -3)} Nairobi`} title="The desk">
      <nav aria-label="Desk sections" className="-mt-2 mb-5 flex flex-wrap gap-1.5">
        {NAV.map(([href, label]) => (
          <a key={href} href={href} className="inline-flex min-h-9 items-center rounded-full border border-rule px-3 text-[12px] font-medium text-ink-soft hover:border-accent hover:text-forest">
            {label}
          </a>
        ))}
      </nav>

      <Cockpit lanes={lanes} />

      <div className="mt-12" />
      <TodayStrip windows={windows} perUsd={perUsd} moneyNote={moneyNote} gate={gate} needs={needs} />

      <div className="mt-12 space-y-12">
        <PipelineBoard deals={deals} today={todayNbo} />
        <Inbox items={inbox} now={now} canHandle={Boolean(rawInbox)} />
        <PilotsPanel keys={keys} now={now} daysKnown={Boolean(today0040)} />
        <ContentPanel
          stories={stories}
          posts={posts}
          briefViews={briefViews}
          campaigns={campaigns}
          campaignsNote={
            today0040
              ? "Every tagged link (utm source/campaign): LinkedIn posts, email alerts, Telegram, widgets, shares. People = one browser a day."
              : "LinkedIn only, from af_desk_audience; every campaign and people counts after migration 0040."
          }
        />
        <HealthPanel health={health} latency={loadLatency()} freshness={freshness} />
        <RoutinesPanel />
        <DecisionsPanel />
        <CasebookPanel cases={loadCases()} />
      </div>

      <section id="reference" className="mt-14 scroll-mt-20 space-y-3">
        <SectionTitle kicker="Reference" title="Everything else, folded" note="The weekly views: the USD 1m command centre, the funnel, model vs reality, money by product, audience, payments, traffic, reader reports and admin forms." />
        <Ref id="ref-command" title="Command centre and strategy" note="Collected vs signed vs pipeline; milestones to USD 1m a month; model vs reality; status board">
          <CommandCentre money={money} deals={deals} pilots={apiKeys} perUsd={perUsd} fxNote={fxNote} />
          <StrategyBoard
            collectedThisMonthUsd={toUsd((money?.revenue ?? []).map((r) => ({ currency: r.currency, amount: r.this_month })), perUsd).total}
            payingInstitutions={deals.filter((x) => x.stage === "won").length}
            pilots={apiKeys.filter((k) => k.plan === "trial" && !k.revoked_at).length}
            prospects={deals.filter((x) => x.stage === "prospect").length}
            apiCalls7d={apiCalls}
            now={now}
          />
        </Ref>
        <Ref id="ref-funnel" title="Funnel: visitor to payment" note="Real counts, 7 and 30 days; moments that matter; survey answers">
          <FunnelPanel funnel={funnel} now={now} />
        </Ref>
        <Ref id="ref-money" title="Money by product and reader funnels" note="Revenue by plan, recurring, test payments counted apart, money-transfer referrals">
          <MoneyPanel money={money} referrals={referrals} />
        </Ref>
        <Ref id="ref-payments" title="Payments" note="The 20 latest, with “mark access granted”">
                    <section className="mt-10">
            <SectionTitle kicker="Revenue" title="Payments" />
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              {payments?.totals.length ? (
                payments.totals.map((t) => (
                  <span key={t.currency ?? "x"} className="rounded-full border border-rule bg-surface px-3 py-1">
                    <strong>{moneyLabel(t.month_amount, t.currency)}</strong> this month · {moneyLabel(t.amount, t.currency)} all time · {t.count} payment{t.count === 1 ? "" : "s"}
                  </span>
                ))
              ) : (
                <span className="text-muted">No payments yet{process.env.PAYSTACK_SECRET_KEY ? "" : " — Paystack key not set"}.</span>
              )}
            </div>
            {payments?.recent.length ? (
              <ul className="mt-2 divide-y divide-rule">
                {payments.recent.slice(0, 20).map((p) => (
                  <li key={p.reference} className="flex flex-wrap items-baseline gap-x-3 py-2 text-sm">
                    <span className="font-semibold text-ink">{moneyLabel(p.amount, p.currency)}</span>
                    <span className="text-ink-soft">{p.plan ?? "—"}</span>
                    <a href={`mailto:${p.email ?? ""}`} className="underline">{p.email ?? "no email"}</a>
                    <span className="text-[12px] text-muted">{p.channel ?? ""} · {ago(p.paid_at, now)} · {p.reference}</span>
                    {p.access_sent_at ? <span className="text-[12px] text-up">access sent</span> : <GrantAccess reference={p.reference} />}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        </Ref>
        <Ref id="ref-audience" title="Audience" note={`${desk.views_7d} views and ${people?.people_7d ?? "—"} people in 7 days; subscribers, sign-ups, downloads, API`}>
                    <section className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule grid-cols-2 lg:grid-cols-4">
            <Stat label="Page views, 7 days" value={desk.views_7d} note={change == null ? "no prior week" : `${change > 0 ? "+" : ""}${change}% vs prior week`} tone={change == null ? undefined : change >= 0 ? "up" : "down"} />
            <Stat label="Returning readers, 7 days" value={audience ? audience.returning_7d : "—"} note={returningShare == null ? "not available" : `${returningShare}% of views · counted from 5 Oct`} />
            <Stat label="LinkedIn visits, 7 days" value={linkedin7d ?? "—"} note="from posts and linkedin.com" />
            <Stat label="Subscribers" value={desk.subscribers} note={`+${desk.subscribers_7d} this week${desk.unsubscribed_7d ? `, −${desk.unsubscribed_7d}` : ""}`} tone="up" />
            <Stat label="Alert sign-ups" value={desk.alert_subs} note={`+${desk.alert_subs_7d} this week`} />
            <Stat label="Data downloads, 7 days" value={downloads} />
            <Stat label="API calls, 7 days" value={apiCalls} />
            <Stat label="Leads" value={desk.leads_total} note={desk.feedback_found_rate == null ? "no feedback yet" : `${desk.feedback_found_rate}% found what they came for`} />
          </section>
                    <section className="mt-10">
            <SectionTitle kicker={`Outside readers · counted from ${PEOPLE_FROM}`} title="People, not page views" note="One person = one browser on one day. Your own devices are left out." />
                {people ? (
              <div className="mt-3 grid gap-8 lg:grid-cols-3">
                <div>
                  <p className="font-serif text-4xl text-ink">{people.people_7d}</p>
                  <p className="text-[12px] text-muted">
                    people in the last 7 days{people.people_prev_7d ? ` (prior week ${people.people_prev_7d})` : ""}
                  </p>
                  <table className="data-table mt-3">
                    <tbody>
                      {people.people_by_day.filter((d) => d.day >= PEOPLE_FROM).slice(-10).reverse().map((d) => (
                        <tr key={d.day}>
                          <td className="text-sm">{d.day}</td>
                          <td className="text-right text-sm font-semibold">{d.people}</td>
                          <td className="text-right text-xs text-muted">{d.views} views</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">Where they came from, 7 days</p>
                  <table className="data-table mt-2">
                    <tbody>
                      {people.people_sources_7d.map((s) => (
                        <tr key={s.source}>
                          <td className="text-sm">{sourceLabel(s.source)}</td>
                          <td className="text-right text-sm font-semibold">{s.people}</td>
                        </tr>
                      ))}
                      {people.people_countries_7d.map((c) => (
                        <tr key={`c-${c.country}`}>
                          <td className="text-sm text-muted">{c.country}</td>
                          <td className="text-right text-sm">{c.people}</td>
                        </tr>
                      ))}
                      {!people.people_sources_7d.length ? (
                        <tr>
                          <td className="text-sm text-muted">No outside readers counted yet</td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">What they did, 7 days</p>
                  <table className="data-table mt-2">
                    <tbody>
                      {Object.keys(ACTION_LABEL).map((name) => {
                        const a = people.actions_7d.find((x) => x.name === name);
                        return (
                          <tr key={name}>
                            <td className="text-sm">{ACTION_LABEL[name]}</td>
                            <td className="text-right text-sm font-semibold">{a?.count ?? 0}</td>
                            <td className="text-right text-xs text-muted">{a?.prev ? `prior ${a.prev}` : ""}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {people.actions_pages_7d.length ? (
                    <p className="mt-2 text-[12px] leading-5 text-muted">
                      Top: {people.actions_pages_7d.slice(0, 5).map((a) => `${ACTION_LABEL[a.name] ?? a.name} on ${a.path} (${a.count})`).join(" · ")}
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted">Not available.</p>
            )}
          </section>
        </Ref>
        <Ref id="ref-traffic" title="Traffic" note="Views over 30 days, LinkedIn by page over 90 days, top pages, referrers, downloads, API and embeds">
                    <section className="mt-10">
            <SectionTitle kicker="Traffic" title="Views, last 30 days" />
            <div className="mt-4">
              <Bars rows={audience?.returning_by_day ?? desk.views_by_day} now={now} />
            </div>
            <p className="mt-2 text-[12px] text-muted">
              <span className="mr-1 inline-block h-2 w-2 rounded-sm bg-forest" />
              returning readers (counted from 5 Oct) <span className="ml-3 mr-1 inline-block h-2 w-2 rounded-sm bg-accent" />
              first visits
            </p>
          </section>
                    <section className="mt-10">
            <SectionTitle kicker="90 days" title="Visits from LinkedIn" />
            <table className="data-table mt-2">
              <thead>
                <tr>
                  <th>Page</th>
                  <th>From</th>
                  <th className="text-right">7 days</th>
                  <th className="text-right">90 days</th>
                  <th className="text-right">Last visit</th>
                </tr>
              </thead>
              <tbody>
                {audience?.linkedin.map((r) => (
                  <tr key={`${r.path}-${r.source}`}>
                    <td className="text-xs">
                      <Link href={r.path} className="hover:text-forest">
                        {r.path}
                      </Link>
                    </td>
                    <td className="text-xs text-muted">{sourceLabel(r.source)}</td>
                    <td className="text-right text-xs">{r.views_7d ?? 0}</td>
                    <td className="text-right text-xs">{r.views}</td>
                    <td className="text-right text-xs text-muted">{dayFmt.format(new Date(r.last_day))}</td>
                  </tr>
                ))}
                {!audience?.linkedin.length ? (
                  <tr>
                    <td colSpan={5} className="text-xs text-muted">
                      No LinkedIn visits yet. Post links carry utm_source=linkedin, so each click is counted here.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </section>
                    <section className="mt-10 grid gap-10 lg:grid-cols-3">
            <div>
              <SectionTitle kicker="7 days" title="Top pages" />
              <table className="data-table mt-2">
                <tbody>
                  {desk.top_pages.map((r) => (
                    <tr key={r.path}>
                      <td className="text-xs">
                        <Link href={r.path} className="hover:text-forest">
                          {r.path}
                        </Link>
                      </td>
                      <td className="text-right text-xs">{r.views}</td>
                    </tr>
                  ))}
                  {!desk.top_pages.length ? <tr><td className="text-xs text-muted">No views yet</td></tr> : null}
                </tbody>
              </table>
            </div>
            <div>
              <SectionTitle kicker="7 days" title="Where visitors came from" />
              <table className="data-table mt-2">
                <tbody>
                  {desk.referrers.map((r) => (
                    <tr key={r.host}>
                      <td className="text-xs">{r.host}</td>
                      <td className="text-right text-xs">{r.views}</td>
                    </tr>
                  ))}
                  {desk.countries.map((r) => (
                    <tr key={`c-${r.country}`}>
                      <td className="text-xs text-muted">{r.country}</td>
                      <td className="text-right text-xs text-muted">{r.views}</td>
                    </tr>
                  ))}
                  {!desk.referrers.length && !desk.countries.length ? <tr><td className="text-xs text-muted">Nothing yet</td></tr> : null}
                </tbody>
              </table>
            </div>
            <div>
              <SectionTitle kicker="7 days" title="Downloads, API and embeds" />
              <table className="data-table mt-2">
                <tbody>
                  {desk.downloads_7d.map((r) => (
                    <tr key={r.path}>
                      <td className="text-xs">{r.path.replace("/download/data/", "")}</td>
                      <td className="text-right text-xs">{r.views}</td>
                    </tr>
                  ))}
                  {desk.api_7d.map((r) => (
                    <tr key={`${r.path}-${r.caller}`}>
                      <td className="text-xs">
                        {r.path.replace("/api/v1/", "api: ")} <span className="text-muted">{r.caller}</span>
                      </td>
                      <td className="text-right text-xs">{r.calls}</td>
                    </tr>
                  ))}
                  {desk.embeds_7d.map((r) => (
                    <tr key={`${r.path}-${r.host}`}>
                      <td className="text-xs">
                        {r.path.replace("/embed/", "embed: ")} <span className="text-muted">{r.host}</span>
                      </td>
                      <td className="text-right text-xs">{r.views}</td>
                    </tr>
                  ))}
                  {!desk.downloads_7d.length && !desk.api_7d.length && !desk.embeds_7d.length ? <tr><td className="text-xs text-muted">Nothing yet</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </Ref>
        <Ref id="ref-readers" title="Reader reports" note="Stories for the editor and prices readers paid; hide a wrong figure">
                    <section className="mt-10 grid gap-10 lg:grid-cols-2">
            <div>
              <SectionTitle kicker="Readers" title="Stories for the editor" note="Never published as sent. Check before reporting anything." />
              <ul className="mt-2 divide-y divide-rule">
                {reports.filter((r) => r.kind === "story").slice(0, 20).map((r) => (
                  <li key={r.id} className={`py-3 text-sm ${r.status === "hidden" ? "opacity-50" : ""}`}>
                    <p className="text-[12px] text-muted">
                      {reportCountry(r.country)?.name ?? r.country}
                      {r.place ? ` · ${r.place}` : ""} · {ago(r.created_at, now)}
                      {r.contact ? ` · ${r.contact}` : ""} · {r.status === "hidden" ? "done" : <HideReport id={r.id} />}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-[13px] text-ink-soft">{r.note}</p>
                  </li>
                ))}
                {!reports.some((r) => r.kind === "story") ? <li className="py-3 text-sm text-muted">No stories yet</li> : null}
              </ul>
            </div>
            <div>
              <SectionTitle kicker="Readers" title="Latest prices and rates" note="Hide a figure that is plainly wrong; it leaves the published medians." />
              <ul className="mt-2 divide-y divide-rule">
                {reports.filter((r) => r.kind !== "story").slice(0, 30).map((r) => (
                  <li key={r.id} className={`flex flex-wrap items-baseline gap-x-2 py-2 text-sm ${r.status === "hidden" ? "line-through opacity-50" : ""}`}>
                    <span className="text-ink">{reportItem(r.item ?? "")?.label ?? r.item}</span>
                    <span className="font-semibold">{r.amount}{r.kind === "rate" ? "%" : ` ${reportCountry(r.country)?.currency ?? ""}`}</span>
                    <span className="text-[12px] text-muted">
                      {reportCountry(r.country)?.name ?? r.country}
                      {r.place ? ` · ${r.place}` : ""} · {ago(r.created_at, now)}
                    </span>
                    {r.status !== "hidden" ? <HideReport id={r.id} /> : null}
                  </li>
                ))}
                {!reports.some((r) => r.kind !== "story") ? <li className="py-3 text-sm text-muted">No reports yet</li> : null}
              </ul>
              <p className="mt-2 text-[12px] text-muted">
                Published at <Link href="/rates/what-readers-paid" className="underline">/rates/what-readers-paid</Link>.
              </p>
            </div>
          </section>
        </Ref>
        <Ref id="ref-admin" title="Corrections and press list" note="Log a correction to a published figure; add to the Monday ASBI release list">
                    <section className="mt-10 grid gap-10 lg:grid-cols-2">
            <div>
              <SectionTitle kicker="Reference" title="Log a correction to a published figure" />
              <div className="mt-4">
                <AddCorrection />
              </div>
            </div>
            <div>
              <SectionTitle kicker="Press" title="Who gets the Monday ASBI release" />
              <div className="mt-4">
                <AddPress />
              </div>
            </div>
          </section>
        </Ref>
      </section>

      <div className="mt-8">
        <OwnerDevice />
      </div>
            <p className="mt-10 text-xs text-muted">
        Counts come from the privacy-first page counter (no cookies, no IPs). Leads and feedback are what people typed. GitHub Actions and Vercel logs hold the rest.
      </p>
    </PageShell>
  );
}
