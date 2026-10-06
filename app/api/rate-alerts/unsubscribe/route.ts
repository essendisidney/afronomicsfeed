import { rpc } from "@/lib/store";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * One-click stop for an email rate alert. GET from the link in the email; POST from mail clients that honour
 * List-Unsubscribe-Post. all=1 stops every alert on the same address.
 */
async function stop(request: Request) {
  const q = new URL(request.url).searchParams;
  const token = q.get("t") ?? "";
  if (!/^[a-f0-9]{32,80}$/.test(token)) return new Response("Invalid link", { status: 400 });
  const result = await rpc("af_rate_alert_unsubscribe", { p_token: token, p_all: q.get("all") === "1" });
  if (!result.ok) return new Response("That didn’t go through. Please try the link again.", { status: 502 });
  if (request.method === "POST") return new Response(null, { status: 204 });
  return Response.redirect(`${site.url}/alerts?email=stopped#email-alerts`, 303);
}

export const GET = stop;
export const POST = stop;
