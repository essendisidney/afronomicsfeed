import { cookies } from "next/headers";
import { sameOrigin } from "@/lib/security";
import { rpc } from "@/lib/store";
import targets from "@/data/sales/treasury-desk-targets.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEAL_STAGES = new Set(["prospect", "contacted", "qualified", "pilot", "proposal", "won", "lost"]);

/** Append a line to deal notes, dropping the oldest lines so the total stays within the column's 4,000 characters. */
function appendNote(existing: string | null, line: string) {
  const lines = [...(existing ?? "").split("\n").filter((x) => x.trim()), line];
  while (lines.join("\n").length > 4000 && lines.length > 1) lines.shift();
  return lines.join("\n").slice(-4000);
}

/** Desk actions, authorised by the af_desk cookie (the shared secret), which the database re-checks on every call. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, reason: "Cross-site request refused." }, { status: 403 });
  const key = (await cookies()).get("af_desk")?.value ?? "";
  if (!key) return Response.json({ ok: false, reason: "No desk key." }, { status: 401 });
  const b = (await request.json().catch(() => null)) as Record<string, string> | null;
  if (!b?.action) return Response.json({ ok: false, reason: "No action." }, { status: 400 });
  const s = (k: string, max = 500) => (b[k] ?? "").toString().trim().slice(0, max) || null;
  let result;
  if (b.action === "access") result = await rpc("af_payment_access", { p_secret: key, p_reference: s("reference", 120) });
  else if (b.action === "correction") result = await rpc("af_correction_add", { p_secret: key, p_market: s("market", 40), p_page: s("page", 200), p_wrong: s("wrong", 1000), p_changed: s("changed", 1000), p_reason: s("reason", 1000), p_reported_by: s("reported_by", 120) });
  else if (b.action === "press") result = await rpc("af_press_add", { p_secret: key, p_email: s("email", 200), p_name: s("name", 120), p_outlet: s("outlet", 120) });
  else if (b.action === "hide_report") result = await rpc("af_reader_report_hide", { p_secret: key, p_id: Number(s("id", 20)) || 0 });
  else if (b.action === "idea") {
    // The founder's story ideas join the editor's queue (reader stories, kind "story"), marked as from the desk. A
    // fresh voter per idea, so the readers' three-a-day limit does not apply to the desk.
    const note = s("note", 1000);
    if (!note || note.length < 20) return Response.json({ ok: false, reason: "Give the idea at least a line (20 characters)." }, { status: 400 });
    result = await rpc("af_reader_report_add", {
      p_secret: key,
      p_kind: "story",
      p_country: (s("country", 2) ?? "KE").toUpperCase(),
      p_item: null,
      p_amount: null,
      p_place: null,
      p_note: note,
      p_contact: "Founder (desk idea)",
      p_voter: `desk-${crypto.randomUUID()}`,
    });
  } else if (b.action === "api_key_create") result = await rpc("af_api_key_create", { p_secret: key, p_label: s("label", 120), p_plan: s("plan", 20) });
  else if (b.action === "deal_save") {
    const num = (k: string) => {
      const v = Number(s(k, 20));
      return Number.isFinite(v) && v > 0 ? v : null;
    };
    const date = (k: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s(k, 10) ?? "") ? s(k, 10) : null);
    const id = num("id");
    if (!id && !s("organisation", 160)) return Response.json({ ok: false, reason: "A new deal needs the organisation." }, { status: 400 });
    if (s("stage", 20) === "won" && !date("signed_at")) return Response.json({ ok: false, reason: "“Won” needs the date the agreement was signed." }, { status: 400 });
    result = await rpc("af_deal_save", {
      p_secret: key, p_id: id, p_organisation: s("organisation", 160), p_segment: s("segment", 20), p_product: s("product", 20), p_stage: s("stage", 20),
      p_value_usd_month: num("value"), p_source: s("source", 200), p_next_step: s("next_step", 500), p_next_date: date("next_date"), p_notes: s("notes", 4000), p_signed_at: date("signed_at"),
    });
  } else if (b.action === "deal_quick") {
    // One-click stage change, next step and date, and a dated note appended to the deal's notes (af_deal_save keeps
    // every field passed as null). Nothing from the request is logged.
    const id = Number(s("id", 20));
    if (!Number.isInteger(id) || id <= 0) return Response.json({ ok: false, reason: "No deal number." }, { status: 400 });
    const stage = s("stage", 20);
    if (stage && !DEAL_STAGES.has(stage)) return Response.json({ ok: false, reason: "Unknown stage." }, { status: 400 });
    const date = (k: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s(k, 10) ?? "") ? s(k, 10) : null);
    if (stage === "won" && !date("signed_at")) return Response.json({ ok: false, reason: "“Won” needs the date the agreement was signed." }, { status: 400 });
    const note = s("note", 300);
    let notes: string | null = null;
    if (note) {
      const list = await rpc("af_deals_list", { p_secret: key });
      if (!list.ok || !Array.isArray(list.value)) return Response.json({ ok: false, reason: "Could not read the deal." }, { status: 502 });
      const deal = (list.value as { id: number; notes: string | null }[]).find((d) => d.id === id);
      if (!deal) return Response.json({ ok: false, reason: "No such deal." }, { status: 404 });
      notes = appendNote(deal.notes, `${new Date().toISOString().slice(0, 10)} desk: ${note.replace(/\s+/g, " ")}`);
    }
    result = await rpc("af_deal_save", {
      p_secret: key, p_id: id, p_organisation: null, p_segment: null, p_product: null, p_stage: stage, p_value_usd_month: null, p_source: null,
      p_next_step: s("next_step", 500), p_next_date: date("next_date"), p_notes: notes, p_signed_at: date("signed_at"),
    });
  } else if (b.action === "inbox_handle") {
    const kind = s("kind", 20);
    const id = Number(s("id", 20));
    if (!kind || !["lead", "survey", "feedback"].includes(kind) || !Number.isInteger(id) || id <= 0) return Response.json({ ok: false, reason: "Bad item." }, { status: 400 });
    result = await rpc("af_desk_handle", { p_secret: key, p_kind: kind, p_id: id, p_undo: b.undo === "1" });
    if (!result.ok && /PGRST202|404/.test(result.reason)) return Response.json({ ok: false, reason: "Needs migration 0040." }, { status: 501 });
  } else if (b.action === "api_key_revoke") result = await rpc("af_api_key_revoke", { p_secret: key, p_id: Number(s("id", 20)) || 0 });
  else if (b.action.startsWith("treasury_")) {
    // The Treasury Desk (migration 0048, D-035, D-036). The database refuses target updates outside the D-036 list.
    const num = (k: string) => {
      const v = Number(s(k, 20));
      return Number.isFinite(v) && v > 0 ? v : null;
    };
    const date = (k: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s(k, 10) ?? "") ? s(k, 10) : null);
    if (b.action === "treasury_load") result = await rpc("af_desk_targets_load", { p_secret: key, p_rows: targets.rows.map((r) => ({ name: r.name, group: r.group, kind: r.kind, offer: r.offer })) });
    else if (b.action === "treasury_update") {
      const stage = s("stage", 20);
      if (stage && !DEAL_STAGES.has(stage)) return Response.json({ ok: false, reason: "Unknown stage." }, { status: 400 });
      result = await rpc("af_desk_target_update", {
        p_secret: key, p_id: num("id") ?? 0, p_stage: stage, p_objection: s("objection", 500), p_price_quoted_kes: num("price"),
        p_board_date: date("board_date"), p_decision_maker: b.decision_maker === "yes" ? true : b.decision_maker === "no" ? false : null,
        p_sample_sent_on: date("sample_sent_on"), p_next_step: s("next_step", 500), p_next_date: date("next_date"), p_note: s("note", 300),
      });
    } else if (b.action === "treasury_grant") {
      const product = s("product", 20);
      if (!product || !["pack", "pack_plus", "treasury_desk", "benchmarking"].includes(product)) return Response.json({ ok: false, reason: "Unknown product." }, { status: 400 });
      result = await rpc("af_desk_entitlement_grant", {
        p_secret: key, p_org_name: s("organisation", 160), p_kind: s("kind", 20), p_product: product, p_months: num("months") ?? 0,
        p_amount_kes_month: num("amount") ?? 0, p_source: s("source", 10), p_reference: s("reference", 120), p_schemes: num("schemes") ?? 1,
      });
    } else if (b.action === "treasury_benchmark_review") {
      result = await rpc("af_desk_benchmark_review", { p_secret: key, p_id: num("id") ?? 0, p_reviewed_by: s("reviewed_by", 80), p_release: b.release === "1" });
    } else if (b.action === "treasury_invoice_create") {
      const currency = s("currency", 3) ?? "KES";
      if (!["KES", "USD"].includes(currency)) return Response.json({ ok: false, reason: "KES or USD." }, { status: 400 });
      result = await rpc("af_desk_invoice_create", { p_secret: key, p_org: num("org") ?? 0, p_amount: num("amount") ?? 0, p_currency: currency, p_issued_on: date("issued_on") });
    } else if (b.action === "treasury_invoice_paid") {
      result = await rpc("af_desk_invoice_paid", { p_secret: key, p_id: num("id") ?? 0, p_paid_on: date("paid_on"), p_method: s("method", 10) });
    } else if (b.action === "treasury_webhook_add") {
      const markets = (s("markets", 200) ?? "").split(/[\s,]+/).map((m) => m.toLowerCase()).filter((m) => /^[a-z]{2,20}$/.test(m));
      result = await rpc("af_desk_webhook_add", { p_secret: key, p_key_id: num("key_id") ?? 0, p_url: s("url", 500), p_markets: markets });
    } else if (b.action === "treasury_webhook_off") result = await rpc("af_desk_webhook_off", { p_secret: key, p_id: num("id") ?? 0 });
    else if (b.action === "treasury_kra") result = await rpc("af_desk_org_kra", { p_secret: key, p_org: num("org") ?? 0, p_kra_pin: s("kra_pin", 11) });
    else if (b.action === "treasury_rename") result = await rpc("af_desk_org_rename", { p_secret: key, p_org: num("org") ?? 0, p_name: s("name", 160), p_kind: s("kind", 20) });
    else if (b.action === "treasury_pack_mark") {
      result = await rpc("af_desk_pack_issue_mark", { p_secret: key, p_org: num("org") ?? 0, p_period: s("period", 7), p_checked_by: s("checked_by", 80), p_sent: b.sent === "1" });
    } else return Response.json({ ok: false, reason: "Unknown action." }, { status: 400 });
    if (!result.ok && /PGRST202|404/.test(result.reason)) return Response.json({ ok: false, reason: "Needs migrations 0048 to 0050." }, { status: 501 });
    const v = result.ok ? (result.value as { ok?: boolean; reason?: string } | null) : null;
    if (v && v.ok === false) return Response.json({ ok: false, reason: v.reason ?? "Refused." }, { status: 400 });
  } else return Response.json({ ok: false, reason: "Unknown action." }, { status: 400 });
  if (!result.ok) return Response.json({ ok: false, reason: result.reason }, { status: 502 });
  if (result.value === false || result.value == null) return Response.json({ ok: false, reason: "Rejected (key or input)." }, { status: 403 });
  return Response.json({ ok: true, value: result.value });
}
