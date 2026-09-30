import { rpc } from "@/lib/store";

export const runtime = "nodejs";

const BOT = /bot|crawl|spider|slurp|preview|monitor|headless|lighthouse|curl|wget|python|axios|node-fetch|go-http|java\//i;

/**
 * Privacy-first page counter: one row per day, path, referring site and country, incremented.
 * No cookies, no IP addresses, no user identifiers are stored.
 */
export async function POST(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });
  const body = (await request.json().catch(() => null)) as { path?: string; referrer?: string } | null;
  const path = (body?.path ?? "").split("?")[0].slice(0, 200);
  let referrer = "";
  try {
    const host = body?.referrer ? new URL(body.referrer).hostname.replace(/^www\./, "") : "";
    referrer = host && !host.endsWith("afronomicsfeed.com") ? host : "";
  } catch {}
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  await rpc("af_hit", { p_path: path, p_referrer: referrer, p_country: country });
  return new Response(null, { status: 204 });
}
