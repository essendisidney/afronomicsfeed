import { moneyLabel } from "@/lib/billing/plans";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { sendEmail } from "@/lib/mail";
import { site } from "@/lib/site";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Desk = { views_7d: number; views_prev_7d: number; subscribers: number; subscribers_7d: number; alert_subs: number; api_7d: { calls: number }[]; downloads_7d: { views: number }[]; leads_total: number; leads: { when: string; email: string; interest: string; organisation: string | null }[]; top_pages: { path: string; views: number }[] };
type Pay = { totals: { currency: string | null; amount: number; month_amount: number; count: number }[]; recent: { email: string | null; plan: string | null; amount: number; currency: string | null; paid_at: string; access_sent_at: string | null }[] };

/** Monday owner email: the week in numbers, what needs a hand, and anything stale. Called by the index-release workflow. */
export async function POST(request: Request) {
  const secret = process.env.AF_CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) return new Response("forbidden", { status: 403 });
  const [d, p] = await Promise.all([rpc("af_desk", { p_secret: secret }), rpc("af_payments", { p_secret: secret })]);
  const desk = d.ok ? (d.value as Desk) : null;
  const pay = p.ok ? (p.value as Pay) : null;
  if (!desk) return Response.json({ sent: 0, reason: "desk unavailable" }, { status: 502 });
  const now = Date.now();
  const stale = billMarkets
    .map((m) => ({ m, last: loadBillMarket(m.slug).rows[0]?.date ?? null }))
    .filter((x) => !x.last || (now - Date.parse(x.last)) / 86400000 > (["nigeria", "tanzania", "zambia", "uganda"].includes(x.m.slug) ? 21 : 10));
  const weekLeads = desk.leads.filter((l) => now - Date.parse(l.when) < 7 * 86400000);
  const pending = (pay?.recent ?? []).filter((r) => !r.access_sent_at);
  const change = desk.views_prev_7d ? Math.round(((desk.views_7d - desk.views_prev_7d) / desk.views_prev_7d) * 100) : null;
  const lines = [
    `Afronomics, the week`,
    ``,
    `Page views: ${desk.views_7d}${change == null ? "" : ` (${change >= 0 ? "+" : ""}${change}% vs prior week)`}`,
    `Subscribers: ${desk.subscribers} (+${desk.subscribers_7d}) · Alert sign-ups: ${desk.alert_subs}`,
    `API calls: ${desk.api_7d.reduce((n, r) => n + r.calls, 0)} · Downloads: ${desk.downloads_7d.reduce((n, r) => n + r.views, 0)}`,
    `Revenue: ${(pay?.totals ?? []).map((t) => `${moneyLabel(t.month_amount, t.currency)} this month, ${moneyLabel(t.amount, t.currency)} all time (${t.count})`).join("; ") || "none yet"}`,
    ``,
    `Needs you:`,
    ...(pending.length ? pending.map((r) => `• Grant access: ${r.email} · ${r.plan} · ${moneyLabel(r.amount, r.currency)}`) : ["• No payments waiting for access"]),
    ...(weekLeads.length ? weekLeads.map((l) => `• Lead: ${l.email}${l.organisation ? ` (${l.organisation})` : ""} · ${l.interest}`) : ["• No new leads this week"]),
    ...(stale.length ? stale.map((x) => `• Stale pipeline: ${x.m.country}, last result ${x.last ?? "none"}`) : ["• Every pipeline fresh"]),
    ``,
    `Top pages: ${desk.top_pages.slice(0, 5).map((t) => `${t.path} (${t.views})`).join(", ")}`,
    ``,
    `${site.url}/desk`,
  ];
  const text = lines.join("\n");
  const html = `<pre style="font-family:Archivo,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;white-space:pre-wrap;color:#121826">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
  const to = process.env.PAYMENTS_NOTIFY_EMAIL ?? site.contactEmail;
  const r = await sendEmail(to, `Afronomics week: ${desk.views_7d} views, ${desk.subscribers} subscribers${pending.length ? `, ${pending.length} to grant` : ""}`, html, text);
  return Response.json({ to, sent: r.ok ? 1 : 0, reason: r.ok ? undefined : r.reason });
}
