import { rpc } from "@/lib/store";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One-click stop for tender alerts: GET from the email's link, POST from mail clients that honour List-Unsubscribe-Post. */
async function stop(request: Request) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  if (!/^[a-f0-9]{32,80}$/.test(token)) return new Response("Invalid link", { status: 400 });
  const result = await rpc("af_tender_alert_unsubscribe", { p_token: token });
  if (!result.ok) return new Response("That didn’t go through. Please try the link again.", { status: 502 });
  if (request.method === "POST") return new Response(null, { status: 204 });
  return Response.redirect(`${site.url}/tenders?alerts=stopped#alerts`, 303);
}

export const GET = stop;
export const POST = stop;
