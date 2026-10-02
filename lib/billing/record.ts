import { rpc } from "@/lib/store";
import { sendEmail } from "@/lib/mail";
import { site } from "@/lib/site";
import { getCheckoutPlan, moneyLabel } from "./plans";

/**
 * Where a confirmed Paystack charge goes: the `payments` table through a secret-gated database function
 * (no service-role key on the server), then a receipt to the customer and a note to the desk. Called from
 * the webhook and, as a safety net, from the return page, so a payment is recorded even if the webhook
 * is not yet registered in Paystack.
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
  return result.value === true ? { ok: true as const } : { ok: false as const, reason: "secret rejected" };
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

/** What happens next, by product, for the receipt. */
function nextStep(plan: string | null) {
  switch (plan) {
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
    case "job_listing":
      return "Reply with the role, the institution, location, closing date and how to apply; the listing is up within one working day for 30 days.";
    default:
      return "Your access is set up from this address within one business day. The Morning note starts tomorrow; auction alerts follow as each market reports.";
  }
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Receipt to the customer and a heads-up to the desk. Best effort: a missing mail key is logged, not thrown. */
export async function notifyPayment(p: PaymentRecord) {
  const product = productName(p.plan);
  const money = moneyLabel(p.amount, p.currency);
  const when = p.paidAt ? new Date(p.paidAt).toUTCString() : new Date().toUTCString();
  const results: string[] = [];

  if (p.email) {
    const text = [
      `Thank you — your payment of ${money} for ${product} is confirmed.`,
      ``,
      `Reference: ${p.reference}`,
      `Paid: ${when}`,
      ``,
      nextStep(p.plan),
      ``,
      `Questions: ${site.contactEmail}`,
      `Afronomics · ${site.url}`,
    ].join("\n");
    const html = `<div style="font-family:Archivo,Helvetica,Arial,sans-serif;color:#121826;max-width:560px;line-height:1.55">
      <p style="font-size:18px;font-weight:600">Payment confirmed</p>
      <p>Thank you — your payment of <strong>${esc(money)}</strong> for <strong>${esc(product)}</strong> is confirmed.</p>
      <p style="color:#636b7d;font-size:13px">Reference ${esc(p.reference)} · ${esc(when)}</p>
      <p>${esc(nextStep(p.plan))}</p>
      <p style="color:#636b7d;font-size:13px">Questions: <a href="mailto:${esc(site.contactEmail)}" style="color:#5b3fd6">${esc(site.contactEmail)}</a> · <a href="${site.url}" style="color:#5b3fd6">afronomicsfeed.com</a></p>
    </div>`;
    const r = await sendEmail(p.email, `Afronomics: ${product} confirmed (${money})`, html, text);
    results.push(`customer:${r.ok ? "sent" : r.reason}`);
  }

  const owner = process.env.PAYMENTS_NOTIFY_EMAIL ?? site.contactEmail;
  const summary = `${money} · ${product} · ${p.email ?? "no email"} · ${p.channel ?? ""} · ref ${p.reference}`;
  const r = await sendEmail(owner, `New payment: ${summary}`, `<pre style="font-family:monospace">${esc(summary)}</pre><p>Grant access and mark it done on <a href="${site.url}/desk">/desk</a>.</p>`, `${summary}\n\nGrant access and mark it done on ${site.url}/desk`);
  results.push(`desk:${r.ok ? "sent" : r.reason}`);
  return results;
}
