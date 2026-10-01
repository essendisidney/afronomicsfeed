import { unsubscribeToken } from "@/lib/mail";
import { rpc } from "@/lib/store";
import { site } from "@/lib/site";

export const runtime = "nodejs";

async function unsubscribe(request: Request) {
  const q = new URL(request.url).searchParams;
  const email = (q.get("e") ?? "").toLowerCase();
  const token = q.get("t") ?? "";
  if (!email || token !== (await unsubscribeToken(email))) return new Response("Invalid link", { status: 400 });
  await rpc("af_unsubscribe", { p_email: email, p_secret: process.env.AF_CRON_SECRET ?? "" });
  return Response.redirect(`${site.url}/subscribe?unsubscribed=1`, 303);
}

export const GET = unsubscribe;
export const POST = unsubscribe;
