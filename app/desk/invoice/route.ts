import { cookies } from "next/headers";
import { esc } from "@/lib/documents/design";
import { rpc } from "@/lib/store";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Invoice = { id: number; number: string; name: string; kra_pin: string | null; amount: number; currency: string; issued_on: string; paid_on: string | null; method: string | null };

/**
 * A printable invoice (migration 0049), for the founder to print to PDF and hand over or send personally; nothing is
 * emailed. Afronomics' own legal name, KRA PIN, payment details and any VAT line come from the environment
 * (INVOICE_LEGAL_NAME, INVOICE_KRA_PIN, INVOICE_PAY_TO, INVOICE_VAT_NOTE); a missing one is shown as a gap to fill,
 * never guessed. Desk key only.
 */
export async function GET(request: Request) {
  const key = (await cookies()).get("af_desk")?.value ?? "";
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!key) return new Response("No desk key.", { status: 401 });
  const r = await rpc("af_desk_invoices", { p_secret: key });
  if (!r.ok) return new Response(/PGRST202|^404/.test(r.reason) ? "Needs migration 0049." : "Could not read invoices.", { status: 502 });
  const inv = ((r.value as Invoice[] | null) ?? []).find((i) => i.id === id);
  if (!inv) return new Response("No such invoice (or a wrong desk key).", { status: 404 });
  const gap = (v: string | undefined, name: string) => (v && v.trim() ? esc(v) : `<span class="gap">[set ${name}]</span>`);
  const money = `${inv.currency} ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(inv.amount))}`;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>${esc(inv.number)}</title>
<style>body{font:11pt/1.5 Arial,sans-serif;color:#1d1512;max-width:180mm;margin:16mm auto;padding:0 8mm}h1{font:600 22pt Georgia,serif;margin:0}
table{width:100%;border-collapse:collapse;margin-top:8mm}td,th{padding:2mm;border-bottom:.5pt solid #ddd;text-align:left}td.num,th.num{text-align:right}
.muted{color:#6c5e55;font-size:9pt}.gap{background:#fbe3d6;padding:0 2px}.paid{color:#0f7f57;font-weight:700}@page{size:A4;margin:16mm}</style></head><body>
<p class="muted">${esc(site.name)}</p><h1>Invoice ${esc(inv.number)}</h1>
<p>Issued ${esc(inv.issued_on)}${inv.paid_on ? ` · <span class="paid">Paid ${esc(inv.paid_on)}${inv.method ? ` by ${esc(inv.method)}` : ""}</span>` : ""}</p>
<table><tr><th>From</th><th>To</th></tr><tr><td>${gap(process.env.INVOICE_LEGAL_NAME, "INVOICE_LEGAL_NAME")}<br>KRA PIN ${gap(process.env.INVOICE_KRA_PIN, "INVOICE_KRA_PIN")}<br>${esc(site.contactEmail)}</td>
<td>${esc(inv.name)}<br>KRA PIN ${inv.kra_pin ? esc(inv.kra_pin) : '<span class="gap">[add on the desk]</span>'}</td></tr></table>
<table><tr><th>Description</th><th class="num">Amount</th></tr><tr><td>Afronomics Treasury Desk subscription, as agreed</td><td class="num">${money}</td></tr>
<tr><th>Total</th><th class="num">${money}</th></tr></table>
${process.env.INVOICE_VAT_NOTE ? `<p class="muted">${esc(process.env.INVOICE_VAT_NOTE)}</p>` : ""}
<p><strong>Pay to:</strong> ${gap(process.env.INVOICE_PAY_TO, "INVOICE_PAY_TO")}. Quote ${esc(inv.number)} as the reference.</p>
<p class="muted">Afronomics Feed publishes general financial information. It is not investment advice and is not licensed by the Capital Markets Authority as an investment adviser.</p>
</body></html>`;
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
}
