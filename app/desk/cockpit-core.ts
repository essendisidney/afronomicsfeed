import type { Health } from "@/lib/data/health";
import type { CallRow } from "@/lib/editorial";
import type { Receipt } from "@/lib/receipts";
import { toUsd, type Deal } from "./CommandCentre";
import type { KeyRow, MoneyWindow } from "./today-core";

/**
 * The desk cockpit (docs/rebuild/phase-7b-plan.md, 7b-1): four lanes, each with a light, its three numbers and the
 * next action. The rules for each light are here, in one place, so the desk and its tests agree on what "red" means.
 */

export type Light = "green" | "amber" | "red";
export type LaneFigure = { label: string; value: string; note?: string };
export type Lane = { id: string; title: string; light: Light; why: string; figures: LaneFigure[]; next: string; href: string };

const DAY = 86_400_000;
const usd = (n: number) => `$${n < 10 && n > 0 ? n.toFixed(2) : Math.round(n).toLocaleString("en-US")}`;
const pct = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : null);
const worst = (...ls: Light[]): Light => (ls.includes("red") ? "red" : ls.includes("amber") ? "amber" : "green");

export function moneyLane(o: {
  windows: MoneyWindow[];
  perUsd: Record<string, number>;
  deals: Deal[];
  keys: KeyRow[];
  failedPayments7d: number;
  now: number;
}): Lane {
  const month = toUsd(o.windows.find((w) => w.label === "30 days")?.rows ?? [], o.perUsd).total;
  const all = toUsd(o.windows.find((w) => w.label === "all time")?.rows ?? [], o.perUsd).total;
  const open = o.deals.filter((d) => !["won", "lost", "prospect"].includes(d.stage));
  const trials = o.keys.filter((k) => k.plan === "trial" && !k.revoked_at && k.expires_at);
  const ending = (days: number) => trials.filter((k) => Date.parse(k.expires_at!) - o.now <= days * DAY && Date.parse(k.expires_at!) > o.now);
  const today = new Date(o.now).toISOString().slice(0, 10);
  const due = o.deals.filter((d) => d.next_date && d.next_date <= today && !["won", "lost"].includes(d.stage));
  const light = worst(o.failedPayments7d ? "red" : "green", ending(3).length ? "red" : ending(7).length || due.length ? "amber" : "green");
  const why = o.failedPayments7d
    ? `${o.failedPayments7d} payment${o.failedPayments7d === 1 ? "" : "s"} failed this week`
    : ending(3).length
      ? `${ending(3).length} trial${ending(3).length === 1 ? "" : "s"} end within 3 days`
      : due.length
        ? `${due.length} follow-up${due.length === 1 ? "" : "s"} due`
        : "Nothing overdue";
  return {
    id: "money",
    title: "Money and sales",
    light,
    why,
    figures: [
      { label: "Paid, 30 days", value: usd(month), note: `${usd(all)} all time` },
      { label: "Open deals", value: String(open.length), note: `${o.deals.filter((d) => d.stage === "pilot").length} on pilot` },
      { label: "Trials ending, 7 days", value: String(ending(7).length), note: `${trials.length} live` },
    ],
    next: due[0] ? `${due[0].organisation}: ${due[0].next_step ?? "follow up"}` : ending(7)[0] ? `Trial ending: ${ending(7)[0].label}` : "Chase the next pilot to payment",
    href: "#pipeline",
  };
}

export function readersLane(o: { people7d: number | null; peoplePrev7d: number | null; views7d: number; viewsPrev7d: number; signups7d: number; topSource: string | null }): Lane {
  const now = o.people7d ?? o.views7d;
  const prev = o.people7d != null ? (o.peoplePrev7d ?? 0) : o.viewsPrev7d;
  const change = pct(now, prev);
  const light: Light = (change != null && change <= -30) || o.signups7d === 0 ? "red" : change != null && change <= -10 ? "amber" : "green";
  return {
    id: "readers",
    title: "Readers and traffic",
    light,
    why: change != null && change <= -10 ? `Readers ${change}% on last week` : o.signups7d === 0 ? "No new Morning sign-up this week" : change != null ? `Readers ${change >= 0 ? "+" : ""}${change}% on last week` : "First week of counts",
    figures: [
      { label: o.people7d != null ? "People, 7 days" : "Views, 7 days", value: now.toLocaleString("en-US"), note: change != null ? `${change >= 0 ? "+" : ""}${change}% on the week before` : undefined },
      { label: "New sign-ups, 7 days", value: String(o.signups7d) },
      { label: "Top source", value: o.topSource ?? "—" },
    ],
    next: o.signups7d === 0 ? "Post today's Receipt on LinkedIn with the sign-up link" : "Keep the daily Receipt and LinkedIn post going",
    href: "#ref-audience",
  };
}

export function contentLane(o: { receipts: Receipt[]; calls: CallRow[]; ideas: number; today: string }): Lane {
  const published = o.receipts.filter((r) => r.status === "published");
  const drafts = o.receipts.filter((r) => r.status !== "published");
  const last = published.map((r) => r.date).sort().at(-1) ?? null;
  const daysSince = last ? Math.round((Date.parse(o.today) - Date.parse(last)) / DAY) : null;
  const overdue = o.calls.filter((c) => c.status === "due");
  const soon = o.calls.filter((c) => c.status === "open" && Date.parse(c.check_date) - Date.parse(o.today) <= 14 * DAY);
  const light: Light = overdue.length || daysSince == null || daysSince > 2 ? "red" : drafts.length ? "amber" : "green";
  return {
    id: "content",
    title: "Content and stories",
    light,
    why: overdue.length
      ? `${overdue.length} call${overdue.length === 1 ? "" : "s"} past due with no outcome`
      : daysSince == null
        ? "No Receipt published yet"
        : daysSince > 2
          ? `No Receipt for ${daysSince} days`
          : drafts.length
            ? `${drafts.length} draft${drafts.length === 1 ? "" : "s"} waiting for you`
            : "On schedule",
    figures: [
      { label: "Receipts published", value: String(published.length), note: last ? `latest ${last}` : undefined },
      { label: "Calls due, 14 days", value: String(soon.length + overdue.length), note: overdue.length ? `${overdue.length} overdue` : undefined },
      { label: "Ideas in the queue", value: String(o.ideas) },
    ],
    next: overdue[0] ? `Record the outcome: ${overdue[0].statement}` : drafts[0] ? `Approve: ${drafts[0].title}` : "Draft the next Receipt from the queue",
    href: "#content",
  };
}

export function healthLane(o: { health: Health | null; staleFeeds: string[] }): Lane {
  const items = o.health?.items ?? [];
  const failed = items.filter((x) => x.status === "failed");
  const late = items.filter((x) => x.status === "late");
  const flows = o.health?.workflows ?? [];
  const broken = flows.filter((w) => w.failures_in_row >= 2);
  const failing = flows.filter((w) => w.failures_in_row === 1);
  const light: Light = failed.length || broken.length ? "red" : late.length || failing.length || o.staleFeeds.length ? "amber" : "green";
  const firstLate = [...failed, ...late][0];
  return {
    id: "health",
    title: "Data and site health",
    light,
    why: broken.length
      ? `${broken[0].name} has failed ${broken[0].failures_in_row} times in a row`
      : failed.length
        ? `${failed.length} source${failed.length === 1 ? "" : "s"} not read`
        : late.length
          ? `${late.length} figure${late.length === 1 ? "" : "s"} late: ${late.map((x) => x.name).slice(0, 2).join(", ")}`
          : "Every source on time",
    figures: [
      { label: "Sources late or not read", value: String(failed.length + late.length), note: o.health ? `checked ${o.health.checked_on}` : "no health file" },
      { label: "Workflows failing", value: flows.length ? String(broken.length + failing.length) : "—", note: flows.length ? `${flows.length} watched` : "recorded from the next data run" },
      { label: "Stale feeds", value: String(o.staleFeeds.length), note: o.staleFeeds.slice(0, 2).join(", ") || undefined },
    ],
    next: broken[0] ? `Open the ${broken[0].name} run log and fix it` : firstLate ? `${firstLate.name}: ${firstLate.detail}` : "Nothing to fix",
    href: "#health",
  };
}
