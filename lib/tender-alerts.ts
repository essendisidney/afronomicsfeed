import { esc, para, shell } from "@/lib/rate-alerts";
import { site } from "@/lib/site";
import { CATEGORY_LABEL, PORTAL, TENDER_PRICE_KES, closesLabel, type Tender } from "@/lib/tenders-core";

/** Tender alert emails: confirmation, the morning list of matching tenders, and the end-of-trial payment note. */

export type LiveTenderAlert = {
  id: string;
  email: string;
  keywords: string[];
  token: string;
  trial_until: string | null;
  paid_until: string | null;
  last_sent_at: string | null;
  reminded_at: string | null;
  sends: number;
};

export const tenderConfirmUrl = (token: string) => `${site.url}/api/tender-alerts/confirm?t=${token}`;
export const tenderStopUrl = (token: string) => `${site.url}/api/tender-alerts/unsubscribe?t=${token}`;
const PAGE = `${site.url}/tenders`;
const longDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const kw = (k: string[]) => k.map((x) => `“${x}”`).join(", ");

const payLines = (pay: string, email: string) => [
  `To keep your alerts: pay KES ${TENDER_PRICE_KES} for a month by ${pay}, then reply to this email with the M-Pesa confirmation code and the address the alerts go to (${email}). We switch the next month on the same day.`,
];

export function tenderConfirmationEmail(keywords: string[], token: string) {
  const url = tenderConfirmUrl(token);
  const subject = "Confirm your Afronomics tender alerts";
  const lines = [
    `You (or someone using this address) asked Afronomics to email Kenyan government tenders matching ${kw(keywords)}.`,
    "",
    "Once you confirm, you get every open tender that matches straight away, then each new one every morning. The first 14 days are free.",
  ];
  const text = [...lines, "", `Confirm: ${url}`, "", "If you didn’t ask for this, ignore this email: nothing will be sent.", "", `Afronomics · ${site.url}`].join("\n");
  const html = shell(
    "TENDERS",
    `${para(lines)}<p style="margin:16px 0 18px;"><a href="${esc(url)}" style="display:inline-block;background:#121826;color:#ffffff;text-decoration:none;font-weight:600;padding:11px 20px;border-radius:999px;">Confirm my tender alerts</a></p>`,
    `If you didn’t ask for this, ignore this email: nothing will be sent.<br>Afronomics · <a href="${site.url}" style="color:#636b7d;">afronomicsfeed.com</a>`,
  );
  return { subject, text, html };
}

function tenderLines(t: Tender) {
  const c = closesLabel(t.closes);
  return {
    text: `• ${t.title}\n  ${t.buyer} · ${CATEGORY_LABEL[t.category] ?? t.category} · closes ${c.date} ${c.time} (${c.when})${t.ref ? ` · ref ${t.ref}` : ""}`,
    html: `<tr><td style="padding:10px 0;border-top:1px solid #e0e3df;font-family:Archivo,Helvetica,Arial,sans-serif;">
<div style="font-size:15px;font-weight:600;color:#121826;line-height:21px;">${esc(t.title)}</div>
<div style="font-size:13px;color:#3b4252;line-height:19px;">${esc(t.buyer)} · ${esc(CATEGORY_LABEL[t.category] ?? t.category)}</div>
<div style="font-size:12px;color:#636b7d;line-height:18px;">Closes <strong style="color:${c.days <= 3 ? "#b4441d" : "#121826"};">${esc(c.date)} ${esc(c.time)}</strong> (${esc(c.when)})${t.ref ? ` · ref ${esc(t.ref)}` : ""}</div>
</td></tr>`,
  };
}

/** The morning email. first: the reader's first list (every open match); trialNote: shown in the last days of the trial. */
export function tenderDigestEmail(o: { tenders: Tender[]; total: number; keywords: string[]; token: string; first: boolean; trialNote: string | null; pay: string | null; email: string }) {
  const stop = tenderStopUrl(o.token);
  const page = `${PAGE}?utm_source=email&utm_medium=alert&utm_campaign=tender-alert`;
  const n = o.total;
  const subject = o.first
    ? n
      ? `${n} open government tender${n === 1 ? "" : "s"} match your keywords`
      : "Your tender alerts are on"
    : `${n} new tender${n === 1 ? "" : "s"}: ${o.tenders[0]?.title.slice(0, 60) ?? ""}`;
  const intro = o.first
    ? n
      ? [`These open Kenyan government tenders match ${kw(o.keywords)}, closing soonest first. From tomorrow you get only new ones, each morning.`]
      : [`No open tender matches ${kw(o.keywords)} today. We check every new tender the government publishes and email you each morning one matches.`]
    : [`New since your last email, matching ${kw(o.keywords)}:`];
  const more = n > o.tenders.length ? [`…and ${n - o.tenders.length} more on ${PAGE}`] : [];
  const how = [`Get the tender documents and bid on the government portal, ${PORTAL}, by searching the tender’s title or reference.`];
  const trial = o.trialNote ? [o.trialNote, ...(o.pay ? payLines(o.pay, o.email) : [])] : [];
  const items = o.tenders.map(tenderLines);
  const text = [...intro, "", ...items.map((i) => i.text), ...more, "", ...how, ...(trial.length ? ["", ...trial] : []), "", `All open tenders: ${page}`, "", `Stop these alerts: ${stop}`].join("\n");
  const html = shell(
    "TENDERS",
    `${para(intro)}${items.length ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%">${items.map((i) => i.html).join("")}</table>` : ""}${more.length ? para(more) : ""}
${para(how)}${trial.length ? `<div style="margin:14px 0;padding:12px 14px;background:#f5f6f4;border-left:3px solid #a08cff;">${para(trial)}</div>` : ""}
<p style="margin:14px 0 6px;"><a href="${esc(page)}" style="color:#121826;font-weight:600;">See every open tender on Afronomics</a></p>`,
    `From the Public Procurement Regulatory Authority’s open data (tenders.go.ke). Always read the full notice on the portal before bidding.<br>
Keywords: ${esc(o.keywords.join(", "))}. <a href="${esc(stop)}" style="color:#636b7d;">Stop these alerts</a>`,
  );
  return { subject, text, html, unsubscribe: stop };
}

/** After the trial, while unpaid: one short note (sent at most weekly, three times). */
export function tenderPaymentEmail(o: { keywords: string[]; token: string; pay: string; email: string; trialUntil: string; missed: number }) {
  const stop = tenderStopUrl(o.token);
  const lines = [
    `Your free fortnight of tender alerts for ${kw(o.keywords)} ended on ${longDate(o.trialUntil)}.`,
    ...(o.missed ? [`Since then, ${o.missed} new tender${o.missed === 1 ? "" : "s"} matched your keywords.`] : []),
    "",
    ...payLines(o.pay, o.email),
  ];
  const text = [...lines, "", `Stop these emails: ${stop}`].join("\n");
  const html = shell("TENDERS", para(lines), `<a href="${esc(stop)}" style="color:#636b7d;">Stop these emails</a>`);
  return { subject: o.missed ? `${o.missed} new tenders matched your keywords` : "Keep your tender alerts", text, html, unsubscribe: stop };
}
