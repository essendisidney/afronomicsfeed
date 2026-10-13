import { sendEmail } from "@/lib/mail";
import { isWebmail, pilotMarkets, pilotNextOptions, type PilotResult } from "@/lib/billing/pilot";
import { institutionalPilot, localInstitutionPrices } from "@/lib/billing/ratecard";
import { rpc } from "@/lib/store";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const marketLabels = new Map<string, string>(pilotMarkets.map((m) => [m.id, m.label]));
const nextLabels = new Map<string, string>(pilotNextOptions.map((o) => [o.id, o.label]));

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * Self-serve 30-day pilot of the frontier local-debt data. Records a lead (af_lead, throttled to 5 a day per address)
 * and a deal at stage 'pilot' (the deals check constraint has no 'pilot_requested'), then issues a trial key at once
 * when migration 0034 is applied and the address is a work address; otherwise the desk issues it within a working day.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return Response.json({ ok: false, reason: "Please fill in the form." } satisfies PilotResult, { status: 400 });
  const str = (k: string, max: number) => (typeof body[k] === "string" ? (body[k] as string).trim().slice(0, max) : "");
  if (str("website", 200)) return Response.json({ ok: true, status: "pending", email: "" } satisfies PilotResult); // honeypot

  const name = str("name", 120);
  const email = str("email", 200).toLowerCase();
  const organisation = str("organisation", 160);
  const markets = (Array.isArray(body.markets) ? body.markets : []).filter((m): m is string => typeof m === "string" && marketLabels.has(m));
  const next = str("next", 20);
  const local = localInstitutionPrices.find((p) => p.id === str("country", 20));

  const missing = [
    !name && "your name",
    !emailPattern.test(email) && "a valid work email",
    organisation.length < 2 && "your organisation",
    !markets.length && "at least one market",
    !nextLabels.has(next) && "which you would pay for next",
  ].filter(Boolean);
  if (missing.length) return Response.json({ ok: false, reason: `Please add ${missing.join(", ")}.` } satisfies PilotResult, { status: 400 });

  const marketText = markets.map((m) => marketLabels.get(m)).join(", ");
  const nextText = nextLabels.get(next)!;
  const localText = local ? ` Local-institution price asked for: ${local.country} (${local.currency}).` : "";
  const webmail = isWebmail(email);
  const secret = process.env.AF_CRON_SECRET ?? "";

  const lead = await rpc("af_lead", {
    p_email: email,
    p_name: name,
    p_org: organisation,
    p_interest: "licensing",
    p_message: `30-day pilot request (self-serve). Markets: ${marketText}. Would pay for next: ${nextText}.${localText}`,
    p_source: `pilot:${str("source", 150) || "/data/frontier-local-debt"}`,
  });
  if (!lead.ok) console.log(`[pilot] lead not stored: ${lead.reason} ${JSON.stringify({ email, organisation, markets, next })}`);
  // af_lead returns false when this address has already sent five enquiries today: no new deal, no new key.
  if (lead.ok && lead.value === false) return Response.json({ ok: true, status: "duplicate", email } satisfies PilotResult);

  // A key, at once, only for a work address and only once migration 0034 provides af_trial_key_issue.
  let result: PilotResult = { ok: true, status: webmail ? "webmail" : "pending", email };
  if (!webmail && secret) {
    const issued = await rpc("af_trial_key_issue", { p_secret: secret, p_email: email, p_label: `Pilot: ${organisation} (${email})`, p_days: institutionalPilot.days });
    const v = issued.ok ? (issued.value as { status?: string; key?: string; expires_at?: string } | null) : null;
    if (v?.status === "issued" && v.key && v.expires_at) result = { ok: true, status: "issued", key: v.key, expiresAt: v.expires_at, email };
    else if (v?.status === "exists") result = { ok: true, status: "exists", expiresAt: v.expires_at, email };
    else if (v?.status === "limited") result = { ok: true, status: "limited", email };
    else if (!issued.ok && !/PGRST202|404/.test(issued.reason)) console.log(`[pilot] key not issued: ${issued.reason}`);
  }

  if (secret && result.ok && result.status !== "exists") {
    const keyNote = result.status === "issued" ? `Trial key ${result.key.slice(0, 10)}… issued, ends ${day(result.expiresAt)}.` : "Key to issue from /desk (plan: trial).";
    const deal = await rpc("af_deal_save", {
      p_secret: secret, p_id: null, p_organisation: organisation, p_segment: "other", p_product: "frontier_debt", p_stage: "pilot",
      p_value_usd_month: null, p_source: "Self-serve pilot form", p_next_step: result.status === "issued" ? "Check in before the pilot ends: which plan fits?" : "Issue the 30-day trial key and send it",
      p_next_date: new Date(Date.now() + (result.status === "issued" ? 21 : 1) * 86_400_000).toISOString().slice(0, 10),
      p_notes: `${name} <${email}>. Markets: ${marketText}. Would pay for next: ${nextText}.${localText}${webmail ? " Personal email address." : ""} ${keyNote}`, p_signed_at: null,
    });
    if (!deal.ok || deal.value == null) console.log(`[pilot] deal not stored: ${deal.ok ? "rejected" : deal.reason}`);
  }

  await notify(result, { name, organisation, marketText, nextText }).catch((e) => console.log(`[pilot] mail: ${String(e)}`));
  return Response.json(result);
}

/** Confirmation to the requester (with the key when it was issued) and a note to the desk. Best effort. */
async function notify(result: PilotResult, p: { name: string; organisation: string; marketText: string; nextText: string }) {
  if (!result.ok) return;
  const docs = `${site.url}/data-api`;
  const lines =
    result.status === "issued"
      ? [
          `Your 30-day pilot key for Afronomics Data (it works until ${day(result.expiresAt)}):`,
          ``,
          result.key,
          ``,
          `Send it as a header: Authorization: Bearer ${result.key.slice(0, 10)}…`,
          `Example: curl -H "Authorization: Bearer YOUR_KEY" "${site.url}/api/v1/bonds/egypt?from=2026-01-01"`,
          `Endpoints and terms: ${docs}`,
          ``,
          `Keep the key private; we only store a fingerprint of it. If it leaks, reply and we replace it.`,
        ]
      : result.status === "pending" || result.status === "webmail"
        ? [`We have your pilot request for ${p.organisation}. Your 30-day key arrives at this address within one working day.`, ``, `While you wait, the open API needs no key: ${site.url}/developers`]
        : [];
  if (lines.length) {
    const text = [`Hello ${p.name},`, ``, ...lines, ``, `Markets: ${p.marketText}`, ``, `Questions: reply to this email or write to ${site.contactEmail}.`, `Information, not advice.`, `Afronomics · ${site.url}`].join("\n");
    const key = result.status === "issued" ? result.key : null;
    const html = `<div style="font-family:Archivo,Helvetica,Arial,sans-serif;color:#121826;max-width:560px;line-height:1.55">${text
      .split("\n")
      .filter(Boolean)
      .map((l) => (l === key ? `<p style="font-family:monospace;font-size:14px;background:#f3f1ea;padding:10px 12px;word-break:break-all">${esc(l)}</p>` : `<p style="margin:0 0 8px">${esc(l)}</p>`))
      .join("")}</div>`;
    const subject = key ? "Your Afronomics Data pilot key (30 days)" : "Your Afronomics Data pilot request";
    const r = await sendEmail(result.email, subject, html, text);
    if (!r.ok) console.log(`[pilot] confirmation not sent: ${r.reason}`);
  }
  const owner = process.env.PAYMENTS_NOTIFY_EMAIL ?? site.contactEmail;
  const summary = `Pilot ${result.status}: ${p.organisation} · ${p.name} <${result.email}> · ${p.marketText} · next: ${p.nextText}`;
  await sendEmail(owner, summary.slice(0, 180), `<pre style="font-family:monospace;white-space:pre-wrap">${esc(summary)}</pre><p>Deals and keys: <a href="${site.url}/desk">/desk</a></p>`, `${summary}\n\n${site.url}/desk`);
}
