import { bearerOk, redactEmails } from "@/lib/security";
import { moneyLabel } from "@/lib/billing/plans";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { sendEmail } from "@/lib/mail";
import { site } from "@/lib/site";
import { rpc } from "@/lib/store";
import { foundTotals, type FoundTotals } from "@/lib/found-server";
import { money, toolLabel, type FoundTool } from "@/lib/found";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Desk = { views_7d: number; views_prev_7d: number; subscribers: number; subscribers_7d: number; alert_subs: number; api_7d: { calls: number }[]; downloads_7d: { views: number }[]; leads_total: number; leads: { when: string; email: string; interest: string; organisation: string | null }[]; top_pages: { path: string; views: number }[] };
type Pay = { totals: { currency: string | null; amount: number; month_amount: number; count: number }[]; recent: { email: string | null; plan: string | null; amount: number; currency: string | null; paid_at: string; access_sent_at: string | null }[] };

/** Shillings found (migration 0046), one line: this week by tool, and the total; currencies are never added together. */
function foundLine(week: FoundTotals | null, all: FoundTotals | null) {
  if (!all) return "Shillings found: none counted yet";
  const byTool = (t: FoundTotals) =>
    t.byCurrency
      .map((c) => {
        const sums = new Map<FoundTool, { minor: number; results: number }>();
        for (const r of t.rows.filter((x) => x.currency === c.currency)) {
          const s = sums.get(r.tool) ?? { minor: 0, results: 0 };
          sums.set(r.tool, { minor: s.minor + Number(r.total_minor), results: s.results + Number(r.results) });
        }
        const tools = [...sums].map(([tool, s]) => `${toolLabel[tool].en} ${money(c.currency, s.minor / 100)} (${s.results})`).join(", ");
        return `${money(c.currency, c.total)} [${tools}]`;
      })
      .join("; ");
  return `Shillings found: this week ${week ? byTool(week) : "none"} · in total since ${all.since} ${all.byCurrency.map((c) => money(c.currency, c.total)).join(", ")}`;
}

/** Monday owner email: the week in numbers, what needs a hand, and anything stale. Called by the index-release workflow. */
export async function POST(request: Request) {
  const secret = process.env.AF_CRON_SECRET;
  if (!secret || !bearerOk(request, secret)) return new Response("forbidden", { status: 403 });
  const weekStart = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const [d, p, foundAll, foundWeek] = await Promise.all([
    rpc("af_desk", { p_secret: secret }),
    rpc("af_payments", { p_secret: secret }),
    foundTotals(null, 0),
    foundTotals(weekStart, 0),
  ]);
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
    foundLine(foundWeek, foundAll),
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
  const html = `<pre style="font-family:Archivo,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;white-space:pre-wrap;color:#1d1512">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</pre>`;
  const to = process.env.PAYMENTS_NOTIFY_EMAIL ?? site.contactEmail;
  const r = await sendEmail(to, `Afronomics week: ${desk.views_7d} views, ${desk.subscribers} subscribers${pending.length ? `, ${pending.length} to grant` : ""}`, html, text);
  return Response.json({ to: redactEmails(to), sent: r.ok ? 1 : 0, reason: r.ok ? undefined : redactEmails(r.reason) });
}
