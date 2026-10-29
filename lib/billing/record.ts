import { rpc } from "@/lib/store";
import { sendEmail } from "@/lib/mail";
import { site } from "@/lib/site";
import { claimReceipt, isAnalystPlan, isKeyPlan, issuePaidKey, markKeyEmail, type KeyOutcome } from "./paidkey";
import { getCheckoutPlan, moneyLabel, paidInFull, planPriceLabel } from "./plans";

/**
 * Where a confirmed Paystack charge goes: the `payments` table through a secret-gated database function
 * (no service-role key on the server), then, for Team and API, the API key (lib/billing/paidkey.ts), then a receipt
 * to the customer and a note to the desk, once per reference. Called from the webhook and from the return page, so a
 * payment is recorded even if the webhook is not yet registered in Paystack; whichever arrives first does the work.
 * Logs carry the reference and the email's domain, never the address or a key.
 */

const secret = () => process.env.AF_CRON_SECRET ?? "";

export type PaymentRecord = {
  reference: string;
  email: string | null;
  plan: string | null;
  amount: number;
  currency: string | null;
  status: string;
  channel: string | null;
  paidAt: string | null;
  raw: unknown;
};

export async function recordPayment(p: PaymentRecord) {
  if (!secret()) return { ok: false as const, reason: "AF_CRON_SECRET not set" };
  const result = await rpc("af_record_payment", {
    p_secret: secret(),
    p_reference: p.reference,
    p_email: p.email,
    p_plan: p.plan,
    p_amount: p.amount,
    p_currency: p.currency,
    p_status: p.status,
    p_channel: p.channel,
    p_paid_at: p.paidAt,
    p_raw: p.raw,
  });
  if (!result.ok) return { ok: false as const, reason: result.reason };
  if (result.value !== true) return { ok: false as const, reason: "secret rejected" };
  return { ok: true as const };
}

export async function recordSubscription(s: { code: string; email: string | null; planCode: string | null; status: string; next: string | null }) {
  if (!secret()) return { ok: false as const, reason: "AF_CRON_SECRET not set" };
  const result = await rpc("af_record_subscription", {
    p_secret: secret(),
    p_code: s.code,
    p_email: s.email,
    p_plan_code: s.planCode,
    p_status: s.status,
    p_next: s.next,
  });
  if (!result.ok) return { ok: false as const, reason: result.reason };
  return result.value === true ? { ok: true as const } : { ok: false as const, reason: "secret rejected" };
}

function productName(plan: string | null) {
  const p = plan ? getCheckoutPlan(plan) : null;
  return p?.product ?? plan ?? "Afronomics";
}

const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** The Team and API line, by what happened to the key. */
function teamStep(key: KeyOutcome | undefined) {
  const contact = "Your named contact writes within one working day; reply with the markets and fields you need first.";
  if (key?.kind === "issued" && key.expiresAt) {
    return `Your Team and API month starts today. Your API key is issued: it is shown once on the confirmation page and sent with this receipt, and it works until ${longDate(key.expiresAt)} (the end of the paid period plus three days’ grace). Each renewal payment extends the same key, which also signs you in for full-history CSV downloads in a browser at ${site.url}/downloads. ${contact}`;
  }
  if (key?.kind === "renewed" && key.expiresAt) {
    return `Your Team and API access is renewed: your existing API key (${key.prefix}…) now works until ${longDate(key.expiresAt)} (the end of the paid period plus three days’ grace). Nothing to change in your systems.`;
  }
  if (key?.kind === "manual") {
    return "Your Team and API month starts today. Your API key could not be issued automatically this time, so the desk sends it to this address within one working day (it is shown once; keep it safe) with your named contact. Reply with the markets and fields you need first.";
  }
  return `Your Team and API month starts today. Your API key is issued as soon as the payment is confirmed: shown once on the confirmation page and emailed to this address with the receipt. It works to the end of the paid period plus three days’ grace, and each renewal payment extends it. ${contact}`;
}

/** The Analyst line, by what happened to the download key. */
function analystStep(key: KeyOutcome | undefined) {
  const how = `To download, open ${site.url}/downloads, paste the key once, and every CSV link on the site gives the full history in that browser for 12 hours (sign in again after that).`;
  if (key?.kind === "issued" && key.expiresAt) {
    return `Your Analyst month starts today. Your download key is issued: it is shown once on the confirmation page and sent with this receipt, and it works until ${longDate(key.expiresAt)} (the end of the paid period plus three days’ grace). ${how} Each renewal payment extends the same key.`;
  }
  if (key?.kind === "renewed" && key.expiresAt) {
    return `Your Analyst access is renewed: your download key (${key.prefix}…) now works until ${longDate(key.expiresAt)}. Nothing to change. ${how}`;
  }
  if (key?.kind === "manual") {
    return `Your Analyst month starts today. Your download key could not be issued automatically this time, so the desk sends it to this address within one working day. ${how}`;
  }
  return `Your Analyst month starts today, and this receipt confirms your seat for this address. Your download key is issued as soon as the payment is confirmed. ${how}`;
}

/** What happens next, by product, for the receipt and the thank-you page. For Team and API and Analyst, pass the key outcome. */
export function nextStep(plan: string | null, key?: KeyOutcome) {
  switch (plan) {
    case "analyst":
    case "analyst_ke":
      return analystStep(key);
    case "data_team":
    case "data_team_ke":
      return teamStep(key);
    case "pack":
    case "pack_plus":
      return "Reply to this email with the name of the institution to put on the cover and up to five email addresses to receive it. The first pack arrives within two working days.";
    case "pack_single":
      return "This month’s pack arrives at this address as a PDF within one working day.";
    case "alerts_whatsapp":
      return "Reply to this email with the WhatsApp number to receive the alerts; they start from the next auction.";
    case "benchmarking":
      return "Reply with your portfolio’s holdings and yields for the quarter (a spreadsheet is fine, any layout) and the page comes back within five working days.";
    case "licence_startup":
      return "Your licence starts now. Reply with the product it is used in and the address for result notifications, and the desk sends the licence letter and sets up the webhook.";
    case "widget":
      return "Reply with the site it goes on, the widget wanted (bills, bonds or FX) and a logo; the branded embed code comes back within two working days.";
    case "fund_listing":
      return "Reply with the fund’s name, latest published yield with its source, a logo and the link to invest; the listing goes live once the yield is verified.";
    case "sacco_listing":
      return "Reply with the SACCO's name, its SASRA licence category, the declared dividend and deposit rates with a link to the SACCO's own notice, a logo and a link for joining; the listing goes live once the rates are verified against the notice.";
    default:
      return "Your access is set up from this address within one business day. The Morning note starts tomorrow; auction alerts follow as each market reports.";
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const domainOf = (email: string | null) => (email ? email.slice(email.lastIndexOf("@") + 1).toLowerCase() : "none");

/** The desk's view of the key in one phrase, e.g. "key issued afk_1a2b3c… to 16 November 2026, email failed (…)". */
function keyStatus(key: KeyOutcome, emailed: string | null) {
  const mail = emailed === null ? "" : emailed === "sent" ? ", emailed" : `, email failed (${emailed})`;
  const test = (k: { test: boolean }) => (k.test ? " (TEST)" : "");
  switch (key.kind) {
    case "issued":
      return `key issued ${key.prefix}… to ${longDate(key.expiresAt)}${test(key)}${mail}`;
    case "renewed":
      return `key renewed ${key.prefix}… to ${longDate(key.expiresAt)}${test(key)}${mail}`;
    case "manual":
      return `KEY NOT ISSUED (${key.reason})`;
    default:
      return "";
  }
}

/** What the desk should do, by key outcome. */
function deskAction(key: KeyOutcome, emailed: string | null, plan: string | null) {
  if (key.kind === "issued" || key.kind === "renewed") {
    if (emailed === "sent") return "Access is delivered and marked sent on /desk. The named contact still writes within one working day.";
    return key.kind === "issued"
      ? "Key issued, email failed. The buyer sees the key once on /thank-you if they are there. Check with them; if they never got it, revoke it on /desk and send a new one by hand."
      : "Key renewed, email failed. The key keeps working; tell the buyer the new end date.";
  }
  if (key.kind === "manual")
    return isAnalystPlan(plan)
      ? "Issue the Analyst download key by hand (plan analyst once migration 0039 is applied; until then plan institution, which also opens the API) and mark access sent on /desk. The buyer signs in with it at /downloads."
      : "Issue the Team and API key by hand (plan data_api) and mark access sent on /desk.";
  return "Grant access and mark it done on /desk.";
}

/**
 * Receipt to the customer and a heads-up to the desk. Best effort: a missing mail key is logged, not thrown. For Team
 * and API the receipt carries the new key (or the renewed end date), and the desk note says whether that email went
 * out ("key issued, email failed"). The desk note never contains the key.
 */
export async function notifyPayment(p: PaymentRecord, key: KeyOutcome = { kind: "none" }) {
  const product = productName(p.plan);
  const money = moneyLabel(p.amount, p.currency);
  const when = p.paidAt ? new Date(p.paidAt).toUTCString() : new Date().toUTCString();
  const results: string[] = [];
  const secretKey = key.kind === "issued" ? key.key : null;
  const keyed = key.kind === "issued" || key.kind === "renewed";
  let emailed: string | null = null;

  if (p.email) {
    const analyst = isAnalystPlan(p.plan);
    const keyLines = secretKey && analyst
      ? [
          ``,
          `Your download key (we keep only a fingerprint of it, so this email is your copy):`,
          ``,
          secretKey,
          ``,
          `Full-history downloads in a browser: open ${site.url}/downloads and paste the key once; every CSV link on the site then gives the full history in that browser for 12 hours.`,
          `In code, send it as a header to the CSV files: curl -H "Authorization: Bearer YOUR_KEY" "${site.url}/api/data/bonds/egypt"`,
          `Keep it private. If it leaks, reply and we replace it.`,
        ]
      : secretKey
      ? [
          ``,
          `Your API key (we keep only a fingerprint of it, so this email is your copy):`,
          ``,
          secretKey,
          ``,
          `Send it as a header: Authorization: Bearer YOUR_KEY`,
          `Example: curl -H "Authorization: Bearer YOUR_KEY" "${site.url}/api/v1/bonds/egypt?from=2026-01-01"`,
          `Endpoints and terms: ${site.url}/data-api`,
          `Keep it private. If it leaks, reply and we replace it.`,
        ]
      : [];
    const text = [
      `Thank you — your payment of ${money} for ${product} is confirmed.`,
      ``,
      `Reference: ${p.reference}`,
      `Paid: ${when}`,
      ``,
      nextStep(p.plan, key),
      ...keyLines,
      ``,
      `Questions: ${site.contactEmail}`,
      `Afronomics · ${site.url}`,
    ].join("\n");
    const keyHtml = secretKey && analyst
      ? `<p style="margin-top:18px;font-weight:600">Your download key</p>
      <p style="font-family:monospace;font-size:14px;background:#f3f1ea;padding:10px 12px;word-break:break-all">${esc(secretKey)}</p>
      <p style="color:#6c5e55;font-size:13px">We keep only a fingerprint of it, so this email is your copy. Open <a href="${site.url}/downloads" style="color:#a33a1c">afronomicsfeed.com/downloads</a>, paste the key once, and every CSV link on the site gives the full history in that browser for 12 hours. In code, send it as a header: <code>Authorization: Bearer YOUR_KEY</code>. Keep it private; if it leaks, reply and we replace it.</p>`
      : secretKey
      ? `<p style="margin-top:18px;font-weight:600">Your API key</p>
      <p style="font-family:monospace;font-size:14px;background:#f3f1ea;padding:10px 12px;word-break:break-all">${esc(secretKey)}</p>
      <p style="color:#6c5e55;font-size:13px">We keep only a fingerprint of it, so this email is your copy. Send it as a header: <code>Authorization: Bearer YOUR_KEY</code>. Endpoints and terms: <a href="${site.url}/data-api" style="color:#a33a1c">afronomicsfeed.com/data-api</a>. Keep it private; if it leaks, reply and we replace it.</p>`
      : "";
    const html = `<div style="font-family:Archivo,Helvetica,Arial,sans-serif;color:#1d1512;max-width:560px;line-height:1.55">
      <p style="font-size:18px;font-weight:600">Payment confirmed</p>
      <p>Thank you — your payment of <strong>${esc(money)}</strong> for <strong>${esc(product)}</strong> is confirmed.</p>
      <p style="color:#6c5e55;font-size:13px">Reference ${esc(p.reference)} · ${esc(when)}</p>
      <p>${esc(nextStep(p.plan, key))}</p>${keyHtml}
      <p style="color:#6c5e55;font-size:13px">Questions: <a href="mailto:${esc(site.contactEmail)}" style="color:#a33a1c">${esc(site.contactEmail)}</a> · <a href="${site.url}" style="color:#a33a1c">afronomicsfeed.com</a></p>
    </div>`;
    const subject = secretKey ? `Afronomics: your ${analyst ? "download" : "API"} key and receipt (${money})` : `Afronomics: ${product} confirmed (${money})`;
    const r = await sendEmail(p.email, subject, html, text);
    emailed = r.ok ? "sent" : r.reason.slice(0, 120);
    results.push(`customer:${r.ok ? "sent" : r.reason}`);
  } else if (keyed) {
    emailed = "no email on the payment";
  }
  if (keyed && emailed !== null) await markKeyEmail(p.reference, emailed === "sent", emailed === "sent" ? null : emailed);

  const owner = process.env.PAYMENTS_NOTIFY_EMAIL ?? site.contactEmail;
  const status = keyStatus(key, emailed);
  // Metadata (the plan) is set by the payer: flag any charge below the plan's price before anyone grants access by hand.
  const short = p.plan && getCheckoutPlan(p.plan) && !paidInFull(p.plan, p.amount, p.currency) ? ` · CHECK AMOUNT: plan price is ${planPriceLabel(p.plan)}` : "";
  const summary = `${money} · ${product} · ${p.email ?? "no email"} · ${p.channel ?? ""} · ref ${p.reference}${status ? ` · ${status}` : ""}${short}`;
  const action = short
    ? `Do not grant access until the amount is checked: ${money} was paid against a plan price of ${planPriceLabel(p.plan)}. ${deskAction(key, emailed, p.plan)}`
    : deskAction(key, emailed, p.plan);
  const r = await sendEmail(
    owner,
    `New payment: ${summary}`.slice(0, 250),
    `<pre style="font-family:monospace;white-space:pre-wrap">${esc(summary)}</pre><p>${esc(action)} <a href="${site.url}/desk">${site.url}/desk</a></p>`,
    `${summary}\n\n${action} ${site.url}/desk`,
  );
  results.push(`desk:${r.ok ? "sent" : r.reason}`);
  return results;
}

/**
 * Everything after a confirmed charge, safe to call from both the webhook and /thank-you in any order: record the
 * payment, issue or extend the Team and API key, and return the outcome plus `deliver`, which sends the receipt and
 * the desk note once per reference (callers run it in after()). With `reveal` (the /thank-you path) the outcome
 * carries the key for showing on screen once, even when the webhook issued it first.
 */
/** Treasury Desk products whose payment opens an entitlement (migration 0048; D-035). */
const TREASURY_PLANS = new Set(["pack", "pack_plus", "benchmarking"]);

/** Open the entitlement for a confirmed Treasury Desk payment, once per reference. Returns a log phrase, never the address. */
async function recordEntitlement(p: PaymentRecord) {
  const result = await rpc("af_entitlement_from_payment", {
    p_secret: secret(), p_reference: p.reference, p_email: p.email, p_plan: p.plan, p_amount: p.amount, p_currency: p.currency, p_paid_at: p.paidAt,
  });
  if (!result.ok) return /PGRST202|^404/.test(result.reason) ? "entitlement waits for migration 0048" : `entitlement not opened: ${result.reason.slice(0, 80)}`;
  const v = result.value as { ok?: boolean; created?: boolean; months?: number; reason?: string } | null;
  if (!v?.ok) return `entitlement not opened: ${v?.reason ?? "secret rejected"}`;
  return v.created ? `entitlement opened for ${v.months} month(s)` : "entitlement already open";
}

export async function fulfilPayment(p: PaymentRecord, opts: { reveal: boolean; source: "webhook" | "return" }) {
  const stored = await recordPayment(p);
  // Logs: reference and email domain only, never the address or a key.
  const log = (msg: string) => console.log(`[billing] ${opts.source} ${p.reference} @${domainOf(p.email)}: ${msg}`);
  if (!stored.ok) log(`payment not stored: ${stored.reason}`);

  let outcome: KeyOutcome = { kind: "none" };
  let fresh = false;
  if (stored.ok) ({ outcome, fresh } = await issuePaidKey(p, { reveal: opts.reveal }));
  else if (isKeyPlan(p.plan)) outcome = { kind: "manual", reason: "payment not stored" };
  if (stored.ok && p.status === "success" && TREASURY_PLANS.has(p.plan ?? "")) log(await recordEntitlement(p));
  if (outcome.kind === "manual") log(`key not issued: ${outcome.reason}`);
  else if (outcome.kind !== "none") log(`key ${outcome.kind}${fresh ? "" : " earlier"}${opts.reveal && outcome.kind === "issued" && outcome.key ? ", shown on the page" : ""}`);

  const deliver = async () => {
    const keyed = outcome.kind === "issued" || outcome.kind === "renewed";
    // A key or renewal is emailed only by the call that made it, and always by that call (so a receipt sent without
    // a key after a failed earlier attempt cannot swallow it); it still claims the receipt so nobody sends another.
    if (keyed && !fresh) return;
    const first = stored.ok ? await claimReceipt(p.reference) : true;
    if (!first && !keyed) return;
    const sent = await notifyPayment(p, outcome).catch((e) => [`error:${String(e).slice(0, 80)}`]);
    log(sent.map((s) => s.replace(/\S+@\S+/g, "[address]").slice(0, 80)).join(" "));
  };
  return { stored: stored.ok, outcome, deliver };
}
