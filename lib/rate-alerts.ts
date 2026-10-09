import fs from "node:fs";
import path from "node:path";
import { auctionWeeks, loadTbills } from "@/lib/data/kenya-tbills";
import { loadHealth } from "@/lib/data/health";
import { mmfMonths } from "@/lib/data/mmf-months";
import { loadSavingsBond } from "@/lib/data/nigeria-savings-bond";
import { billMarkets } from "@/lib/data/sovereign-bills";
import { kindLabel, policyChanges, type AlertInput, type AlertMessage, type AlertSnapshot, type AlertTenor } from "@/lib/rate-alerts-core";
import { site } from "@/lib/site";

/**
 * Email rate alerts, server side: builds the snapshot the due-check reads (from data/*.json, the same files the
 * pages show) and renders the emails. The rules for when an alert is due live in lib/rate-alerts-core.ts.
 */

type PolicyHistoryRow = { first_seen: string; market: string; rate: number; upper: number | null; source: string };

function loadPolicyHistory(): PolicyHistoryRow[] {
  const file = path.join(process.cwd(), "data", "policy_rate_history.json");
  if (!fs.existsSync(file)) return [];
  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as { rows?: PolicyHistoryRow[] };
  return (raw.rows ?? []).filter((r) => r.market && Number.isFinite(r.rate));
}

export function alertSnapshot(): AlertSnapshot {
  const tbills = loadTbills();
  const auctions = auctionWeeks(tbills.rows, 6).map((w) => ({
    date: w.date,
    rates: Object.fromEntries(w.rows.map((r) => [r.tenor, r.weighted_avg_rate])) as Partial<Record<AlertTenor, number>>,
    source: w.source ?? null,
  }));
  const bond = loadSavingsBond()?.latest;
  const names = Object.fromEntries(billMarkets.map((m) => [m.slug, m.country]));
  const stale = new Set((loadHealth()?.items ?? []).filter((x) => x.area === "Money market funds" && x.status === "late").map((x) => x.name));
  return {
    kenya: { sourcePage: tbills.sourcePage, auctions },
    ngBond: bond ? { offer: bond.offer, source: bond.source, opening: bond.opening, closing: bond.closing, bonds: bond.bonds } : null,
    policy: { changes: policyChanges(loadPolicyHistory(), names) },
    mmf: {
      months: mmfMonths()
        .filter((m) => m.complete && m.rows.length)
        .map((m) => ({ month: m.month, label: m.label, rows: m.rows.map((r) => ({ name: r.name, gross: r.gross, net: r.net, monthly: r.days == null, stale: stale.has(r.name) })), pending: m.pending })),
    },
  };
}

/** Plain words for an alert, for the confirmation email and the confirmed page. */
export function describeAlert(a: Pick<AlertInput, "kind" | "tenor" | "threshold">) {
  if (a.kind === "tbill_above") return `the Kenya ${a.tenor}-day T-bill rate rises above ${Number(a.threshold).toFixed(2)}%`;
  if (a.kind === "tbill_below") return `the Kenya ${a.tenor}-day T-bill rate falls below ${Number(a.threshold).toFixed(2)}%`;
  if (a.kind === "auction") return "each new Kenya T-bill auction result is published";
  if (a.kind === "ng_savings_bond") return "a new Nigeria FGN Savings Bond offer is published";
  if (a.kind === "policy_change") return "an African central bank changes its policy rate";
  if (a.kind === "mmf_month") return "each month’s Kenya money market fund ranking is out";
  return kindLabel[a.kind];
}

export const confirmUrl = (token: string) => `${site.url}/api/rate-alerts/confirm?t=${token}`;
export const stopUrl = (token: string, all = false) => `${site.url}/api/rate-alerts/unsubscribe?t=${token}${all ? "&all=1" : ""}`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const base = "font-family:Archivo,Helvetica,Arial,sans-serif;color:#121826;";
const muted = "color:#636b7d;font-size:12px;line-height:18px;";

function shell(label: string, body: string, footer: string) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f5f6f4;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f5f6f4;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background:#ffffff;border:1px solid #e0e3df;">
<tr><td style="background:#0e1524;padding:18px 24px;${base}color:#f5f6f4;font-size:16px;font-weight:700;letter-spacing:1px;">AFRONOMICS <span style="color:#a08cff;font-size:11px;letter-spacing:3px;">${esc(label)}</span></td></tr>
<tr><td style="padding:22px 24px 8px;${base}font-size:15px;line-height:23px;">${body}</td></tr>
<tr><td style="padding:12px 24px 22px;${base}${muted}">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

const para = (lines: string[]) =>
  lines
    .join("\n")
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px;">${p.split("\n").map(esc).join("<br>")}</p>`)
    .join("");

export function confirmationEmail(a: AlertInput, token: string) {
  const what = describeAlert(a);
  const url = confirmUrl(token);
  const subject = "Confirm your Afronomics rate alert";
  const text = [
    `You (or someone using this address) asked Afronomics to email you when ${what}.`,
    "",
    `Confirm the alert: ${url}`,
    "",
    "If you didn’t ask for this, ignore this email: nothing will be sent and the request is deleted within 7 days.",
    "",
    `Afronomics · ${site.url}`,
  ].join("\n");
  const html = shell(
    "ALERTS",
    `${para([`You (or someone using this address) asked Afronomics to email you when ${what}.`])}
<p style="margin:16px 0 18px;"><a href="${esc(url)}" style="display:inline-block;background:#121826;color:#ffffff;text-decoration:none;font-weight:600;padding:11px 20px;border-radius:999px;">Confirm the alert</a></p>`,
    `If you didn’t ask for this, ignore this email: nothing will be sent and the request is deleted within 7 days.<br>Afronomics · <a href="${site.url}" style="color:#636b7d;">afronomicsfeed.com</a>`,
  );
  return { subject, text, html };
}

export function alertEmail(m: AlertMessage, token: string) {
  const stop = stopUrl(token);
  const stopAll = stopUrl(token, true);
  const link = `${m.link}?utm_source=email&utm_medium=alert&utm_campaign=rate-alert`;
  const text = [
    ...m.lines,
    "",
    `Full result: ${link}`,
    ...(m.source ? [`Source: ${m.source}`] : []),
    "",
    "Information, not advice. Figures as published by the issuer; Afronomics checks them but is not the source.",
    "",
    `Stop this alert: ${stop}`,
    `Stop all Afronomics alerts: ${stopAll}`,
  ].join("\n");
  const html = shell(
    "RATE ALERT",
    `${para(m.lines)}
<p style="margin:16px 0 6px;"><a href="${esc(link)}" style="color:#121826;font-weight:600;">See the full result on Afronomics</a>${m.source ? ` · <a href="${esc(m.source)}" style="color:#636b7d;">source</a>` : ""}</p>`,
    `Information, not advice. Figures as published by the issuer; Afronomics checks them but is not the source.<br>
You set this alert at afronomicsfeed.com. <a href="${esc(stop)}" style="color:#636b7d;">Stop this alert</a> · <a href="${esc(stopAll)}" style="color:#636b7d;">stop all alerts</a>`,
  );
  return { subject: m.subject, text, html, unsubscribe: stop };
}
