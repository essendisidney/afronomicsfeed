import { parseHoldings } from "@/lib/benchmark";
import { verifyOrgLink } from "@/lib/org-links";
import { sameOrigin } from "@/lib/security";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * A client's holdings for a quarter, sent from its private benchmarking page. The file is read here and only the
 * parsed holdings are stored (migration 0049); every problem is returned with its line number and nothing is stored
 * until the file is clean. Nothing from the file is logged.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ ok: false, reason: "Cross-site request refused." }, { status: 403 });
  const b = (await request.json().catch(() => null)) as { token?: string; quarter?: string; csv?: string; file_name?: string } | null;
  const link = verifyOrgLink(b?.token, "benchmark");
  if (!link) return Response.json({ ok: false, reason: "This link has expired. Ask the Afronomics desk for a new one." }, { status: 403 });
  const quarter = (b?.quarter ?? "").trim();
  if (!/^\d{4}-Q[1-4]$/.test(quarter)) return Response.json({ ok: false, reason: "Choose the quarter." }, { status: 400 });
  const csv = typeof b?.csv === "string" ? b.csv : "";
  if (!csv.trim() || csv.length > 200_000) return Response.json({ ok: false, reason: "Paste or choose a CSV file of up to 200 KB." }, { status: 400 });
  const { holdings, errors } = parseHoldings(csv);
  if (errors.length) return Response.json({ ok: false, reason: "The file needs fixing before it can be sent.", errors: errors.slice(0, 30) }, { status: 400 });
  const r = await rpc("af_benchmark_upload", {
    p_secret: process.env.AF_CRON_SECRET ?? "",
    p_org: link.org,
    p_quarter: quarter,
    p_holdings: holdings,
    p_file_name: (b?.file_name ?? "").slice(0, 160) || null,
  });
  if (!r.ok) return Response.json({ ok: false, reason: "Could not save just now. Please try again." }, { status: 502 });
  const v = r.value as { ok?: boolean; reason?: string } | null;
  if (!v?.ok) return Response.json({ ok: false, reason: v?.reason ?? "Refused." }, { status: 400 });
  return Response.json({ ok: true, holdings: holdings.length });
}
