import { rpc } from "@/lib/store";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The link in the confirmation email: switches the alerts on (the first list goes out with the next data run). */
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  if (!/^[a-f0-9]{32,80}$/.test(token)) return Response.redirect(`${site.url}/tenders?alerts=invalid#alerts`, 303);
  const result = await rpc("af_tender_alert_confirm", { p_token: token });
  const ok = result.ok && result.value != null;
  return Response.redirect(`${site.url}/tenders?alerts=${ok ? "confirmed" : "invalid"}#alerts`, 303);
}
