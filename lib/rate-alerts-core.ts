/**
 * Email rate alerts: what each alert watches and when it is due. Pure functions over a snapshot of the site's
 * own datasets (built in lib/rate-alerts.ts), so the due-check can be tested without a database or the network.
 *
 * Each alert remembers `last_sent_key`, the latest thing it has told the reader about (or, for a new alert, what
 * was already published when it was set). An alert is due only when the data has moved past that key.
 */

export const alertKinds = ["auction", "tbill_above", "tbill_below", "ng_savings_bond", "policy_change"] as const;
export type AlertKind = (typeof alertKinds)[number];
export const alertTenors = [91, 182, 364] as const;
export type AlertTenor = (typeof alertTenors)[number];

export const kindLabel: Record<AlertKind, string> = {
  auction: "Every Kenya T-bill auction result",
  tbill_above: "A Kenya T-bill rate rises above a level",
  tbill_below: "A Kenya T-bill rate falls below a level",
  ng_savings_bond: "A new Nigeria FGN Savings Bond offer",
  policy_change: "Any central bank changes its policy rate",
};

export type AlertInput = { email: string; kind: AlertKind; tenor: AlertTenor | null; threshold: number | null };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Validate and normalise what a reader submitted. Returns the cleaned alert or a reason to show them. */
export function parseAlertInput(body: unknown): { ok: true; value: AlertInput } | { ok: false; reason: string } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const email = typeof b.email === "string" ? b.email.trim().toLowerCase() : "";
  if (!emailPattern.test(email) || email.length > 200) return { ok: false, reason: "Please enter a valid email address." };
  const kind = alertKinds.find((k) => k === b.kind);
  if (!kind) return { ok: false, reason: "Choose what you want to hear about." };
  if (kind !== "tbill_above" && kind !== "tbill_below") return { ok: true, value: { email, kind, tenor: null, threshold: null } };
  const tenor = alertTenors.find((t) => t === Number(b.tenor));
  if (!tenor) return { ok: false, reason: "Choose the 91-, 182- or 364-day bill." };
  const threshold = typeof b.threshold === "number" ? b.threshold : Number(String(b.threshold ?? "").replace(",", "."));
  if (!Number.isFinite(threshold) || threshold <= 0 || threshold >= 100) return { ok: false, reason: "Enter a rate between 0 and 100, for example 9.5." };
  return { ok: true, value: { email, kind, tenor, threshold: Math.round(threshold * 100) / 100 } };
}

/** The slice of the site's data the alerts read. Newest first throughout. */
export type AlertSnapshot = {
  kenya: {
    sourcePage: string;
    /** Whole auctions (all tenors on one value date), newest first. */
    auctions: { date: string; rates: Partial<Record<AlertTenor, number>>; source: string | null }[];
  };
  ngBond: { offer: string; source: string; opening: string | null; closing: string | null; bonds: { years: number; rate: number }[] } | null;
  policy: {
    /** Rate changes in the order they were first seen (the history file is append-only). */
    changes: { index: number; date: string; market: string; marketName: string; rate: number; previous: number; upper: number | null; source: string }[];
  };
};

export type LiveAlert = { id: string; email: string; kind: AlertKind; tenor: number | null; threshold: number | null; token: string; last_sent_key: string | null };

export type AlertMessage = { subject: string; lines: string[]; link: string; source: string | null };

/** What this kind of alert would be keyed on right now: stored when an alert is created, so it only reports what comes after. */
export function currentKey(kind: AlertKind, tenor: number | null, s: AlertSnapshot): string | null {
  switch (kind) {
    case "auction":
      return s.kenya.auctions[0]?.date ?? null;
    case "tbill_above":
    case "tbill_below":
      return s.kenya.auctions.find((a) => tenor != null && a.rates[tenor as AlertTenor] != null)?.date ?? null;
    case "ng_savings_bond":
      return s.ngBond?.offer ?? null;
    case "policy_change": {
      const last = s.policy.changes.at(-1);
      return last ? policyKey(last.index, last.date) : policyKey(-1, "none");
    }
  }
}

const policyKey = (index: number, date: string) => `policy:${index}:${date}`;
const policyIndex = (key: string | null) => {
  const n = key?.startsWith("policy:") ? Number.parseInt(key.split(":")[1], 10) : NaN;
  return Number.isFinite(n) ? n : null;
};

const fmt = (n: number, d = 2) => n.toFixed(d);
const bp = (from: number, to: number) => {
  const delta = Math.round((to - from) * 100);
  return `${delta > 0 ? "+" : delta < 0 ? "−" : "±"}${Math.abs(delta)} bps`;
};
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const day = (iso: string) => (/^\d{4}-\d{2}-\d{2}/.test(iso) ? dateFmt.format(new Date(iso.slice(0, 10))) : iso);

export type DueResult =
  | { action: "none" }
  /** No key yet (the data did not exist when the alert was set): record where things stand, send nothing. */
  | { action: "baseline"; key: string }
  | { action: "send"; key: string; message: AlertMessage };

/** Decide whether one alert has something new to say. Pure: the same alert and snapshot always give the same answer. */
export function dueCheck(alert: Pick<LiveAlert, "kind" | "tenor" | "threshold" | "last_sent_key">, s: AlertSnapshot, siteUrl: string): DueResult {
  const key = currentKey(alert.kind, alert.tenor, s);
  if (key == null) return { action: "none" };
  const last = alert.last_sent_key;
  if (last == null) return { action: "baseline", key };

  switch (alert.kind) {
    case "auction": {
      const [latest, previous] = s.kenya.auctions;
      if (!latest || latest.date <= last) return { action: "none" };
      const lines = alertTenors
        .filter((t) => latest.rates[t] != null)
        .map((t) => {
          const now = latest.rates[t]!;
          const before = previous?.rates[t];
          return `${t}-day: ${fmt(now, 3)}%${before != null ? ` (${bp(before, now)} vs the previous auction)` : ""}`;
        });
      const r364 = latest.rates[364];
      return {
        action: "send",
        key: latest.date,
        message: {
          subject: `Kenya T-bills, value date ${day(latest.date)}${r364 != null ? `: 364-day ${fmt(r364)}%` : ""}`,
          lines: [`The Central Bank of Kenya’s Treasury bill auction for value date ${day(latest.date)}, weighted average rates of accepted bids:`, "", ...lines],
          link: `${siteUrl}/markets/kenya-tbills/${latest.date}`,
          source: latest.source ?? s.kenya.sourcePage,
        },
      };
    }
    case "tbill_above":
    case "tbill_below": {
      const tenor = alert.tenor as AlertTenor;
      const threshold = Number(alert.threshold);
      const series = s.kenya.auctions.filter((a) => a.rates[tenor] != null);
      const [latest, previous] = series;
      if (!latest || latest.date <= last || !Number.isFinite(threshold)) return { action: "none" };
      const now = latest.rates[tenor]!;
      const before = previous?.rates[tenor];
      const past = (r: number) => (alert.kind === "tbill_above" ? r > threshold : r < threshold);
      // A crossing: past the level now, and not past it at the auction before.
      if (!past(now) || (before != null && past(before))) return { action: "none" };
      const word = alert.kind === "tbill_above" ? "above" : "below";
      return {
        action: "send",
        key: latest.date,
        message: {
          subject: `Kenya ${tenor}-day T-bill ${word} ${fmt(threshold)}%: ${fmt(now, 3)}%`,
          lines: [
            `The Kenya ${tenor}-day Treasury bill came in at ${fmt(now, 3)}% (weighted average of accepted bids) for value date ${day(latest.date)}, ${word} the ${fmt(threshold)}% you set.`,
            ...(before != null ? [`The auction before: ${fmt(before, 3)}% (${bp(before, now)}).`] : []),
          ],
          link: `${siteUrl}/markets/kenya-tbills/${latest.date}`,
          source: latest.source ?? s.kenya.sourcePage,
        },
      };
    }
    case "ng_savings_bond": {
      const o = s.ngBond;
      if (!o || o.offer === last) return { action: "none" };
      return {
        action: "send",
        key: o.offer,
        message: {
          subject: `FGN Savings Bond, ${o.offer} offer: ${o.bonds.map((b) => `${b.years}-year ${fmt(b.rate, 3)}%`).join(", ")}`,
          lines: [
            `Nigeria’s Debt Management Office has published the ${o.offer} FGN Savings Bond offer.`,
            "",
            ...o.bonds.map((b) => `${b.years}-year: ${fmt(b.rate, 3)}% a year`),
            ...(o.opening && o.closing ? ["", `Open ${day(o.opening)} to ${day(o.closing)}.`] : []),
          ],
          link: `${siteUrl}/rates/nigeria/savings-bond`,
          source: o.source,
        },
      };
    }
    case "policy_change": {
      const from = policyIndex(last);
      const fresh = s.policy.changes.filter((c) => c.index > (from ?? Number.POSITIVE_INFINITY));
      if (!fresh.length) return { action: "none" };
      const lines = fresh.map(
        (c) => `${c.marketName}: ${fmt(c.rate)}%, from ${fmt(c.previous)}% (${bp(c.previous, c.rate)}), first seen ${day(c.date)}${c.upper != null ? `; corridor to ${fmt(c.upper)}%` : ""}`,
      );
      const head = fresh.length === 1 ? `${fresh[0].marketName} policy rate ${fresh[0].rate > fresh[0].previous ? "raised" : fresh[0].rate < fresh[0].previous ? "cut" : "changed"} to ${fmt(fresh[0].rate)}%` : `${fresh.length} central-bank policy rate changes`;
      const lastChange = fresh.at(-1)!;
      return {
        action: "send",
        key: policyKey(lastChange.index, lastChange.date),
        message: {
          subject: head,
          lines: ["As printed on each central bank’s own website when Afronomics read it:", "", ...lines],
          link: `${siteUrl}/rates/policy`,
          source: fresh.length === 1 ? fresh[0].source : null,
        },
      };
    }
  }
}

/** Policy-rate changes from the append-only history file: a row whose rate or corridor differs from the market's previous row. */
export function policyChanges(
  rows: { first_seen: string; market: string; rate: number; upper: number | null; source: string }[],
  names: Record<string, string>,
): AlertSnapshot["policy"]["changes"] {
  const out: AlertSnapshot["policy"]["changes"] = [];
  const prev = new Map<string, { rate: number; upper: number | null }>();
  rows.forEach((r, index) => {
    const p = prev.get(r.market);
    if (p && (p.rate !== r.rate || (p.upper ?? null) !== (r.upper ?? null))) {
      out.push({ index, date: r.first_seen, market: r.market, marketName: names[r.market] ?? r.market, rate: r.rate, previous: p.rate, upper: r.upper ?? null, source: r.source });
    }
    prev.set(r.market, { rate: r.rate, upper: r.upper ?? null });
  });
  return out;
}
