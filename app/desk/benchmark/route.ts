import { cookies } from "next/headers";
import type { Holding } from "@/lib/benchmark";
import { benchmarkHtml } from "@/lib/editions/benchmark-html";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** A client's uploaded quarter as a draft benchmark page, for the desk to check before release. Desk key only. */
export async function GET(request: Request) {
  const key = (await cookies()).get("af_desk")?.value ?? "";
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!key) return new Response("No desk key.", { status: 401 });
  if (!Number.isInteger(id) || id <= 0) return new Response("No upload.", { status: 400 });
  const r = await rpc("af_desk_benchmark_get", { p_secret: key, p_id: id });
  if (!r.ok) return new Response(/PGRST202|^404/.test(r.reason) ? "Needs migration 0049." : "Could not read the upload.", { status: 502 });
  const v = r.value as { name: string; quarter: string; holdings: Holding[]; released_at: string | null } | null;
  if (!v) return new Response("No such upload (or a wrong desk key).", { status: 404 });
  const html = benchmarkHtml({ name: v.name, quarter: v.quarter, holdings: v.holdings, draft: !v.released_at });
  return new Response(html ?? "Bad quarter.", {
    status: html ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
