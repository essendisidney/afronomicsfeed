import type { Holding } from "@/lib/benchmark";
import { benchmarkHtml } from "@/lib/editions/benchmark-html";
import { verifyOrgLink } from "@/lib/org-links";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const headers = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" };

/** A released quarterly benchmark, through the institution's private link (?q=2026-Q3). */
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = verifyOrgLink(token, "benchmark");
  const quarter = new URL(request.url).searchParams.get("q") ?? "";
  if (!link || !/^\d{4}-Q[1-4]$/.test(quarter)) return new Response("Not found.", { status: 404, headers });
  const r = await rpc("af_benchmark_released", { p_secret: process.env.AF_CRON_SECRET ?? "", p_org: link.org, p_quarter: quarter });
  if (!r.ok) return new Response("The page could not be opened just now. Please try again in a few minutes.", { status: 503, headers });
  const v = r.value as { name: string; holdings: Holding[] } | null;
  if (!v) return new Response("This quarter's page has not been released yet.", { status: 404, headers });
  const html = benchmarkHtml({ name: v.name, quarter, holdings: v.holdings });
  return html ? new Response(html, { headers }) : new Response("Not found.", { status: 404, headers });
}
