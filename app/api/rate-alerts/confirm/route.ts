import { rpc } from "@/lib/store";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The link in the confirmation email: switches the alert on, then shows the alerts page with a note. */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  if (!/^[a-f0-9]{32,80}$/.test(token)) return Response.redirect(`${site.url}/alerts?email=invalid#email-alerts`, 303);
  const result = await rpc("af_rate_alert_confirm", { p_token: token });
  const ok = result.ok && result.value != null;
  return Response.redirect(`${site.url}/alerts?email=${ok ? "confirmed" : "invalid"}#email-alerts`, 303);
}
