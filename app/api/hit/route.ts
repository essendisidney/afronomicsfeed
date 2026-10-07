import { isAutomated } from "@/lib/bots";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";

/**
 * Privacy-first page counter: one row per day, path, referring site and country, incremented; and one daily
 * count per reader action. No cookies, no IP addresses, no user identifiers are stored.
 */
export async function POST(request: Request) {
  if (isAutomated(request.headers.get("user-agent"))) return new Response(null, { status: 204 });
  const body = (await request.json().catch(() => null)) as { path?: string; referrer?: string; returning?: boolean; visitor?: boolean; campaign?: string; event?: string } | null;
  const path = (body?.path ?? "").split("?")[0].slice(0, 200);
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  // An action (sign-up, rate check, report, share): one daily count per action and page. The database checks the name.
  if (body?.event) {
    await rpc("af_event", { p_name: body.event.slice(0, 40), p_path: path, p_country: country });
    return new Response(null, { status: 204 });
  }
  let referrer = "";
  try {
    const host = body?.referrer ? new URL(body.referrer).hostname.replace(/^www\./, "") : "";
    referrer = host && !host.endsWith("afronomicsfeed.com") ? host : "";
  } catch {}
  // A tagged link from our own posts ("linkedin/story") is recorded as "utm:linkedin/story" in place of the host.
  const campaign = (body?.campaign ?? "").toLowerCase();
  if (/^[a-z0-9_.-]{1,30}\/[a-z0-9_.-]{0,40}$/.test(campaign)) referrer = `utm:${campaign}`;
  await rpc("af_hit_v3", { p_path: path, p_referrer: referrer, p_country: country, p_returning: body?.returning === true, p_visitor: body?.visitor === true });
  return new Response(null, { status: 204 });
}
