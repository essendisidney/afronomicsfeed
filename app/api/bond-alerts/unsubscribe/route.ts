import { rpc } from "@/lib/store";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const page = (title: string, body: string, status = 200) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:48px 16px;background:#f5f6f4;color:#121826;font-family:Archivo,Helvetica,Arial,sans-serif;">
<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e0e3df;padding:24px;"><h1 style="font-size:20px;margin:0 0 12px;">${title}</h1>
<p style="font-size:15px;line-height:23px;margin:0 0 16px;">${body}</p><p style="font-size:13px;margin:0;"><a href="${site.url}/data/frontier-local-debt" style="color:#121826;">Afronomics frontier local debt</a></p></div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );

/** One-click stop for bond-result emails to API key holders: GET from the email's link, POST from mail clients that honour List-Unsubscribe-Post. */
async function stop(request: Request) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  if (!/^[a-f0-9]{32,80}$/.test(token)) return page("Invalid link", "This unsubscribe link is not valid.", 400);
  const result = await rpc("af_bond_alert_unsubscribe", { p_token: token });
  if (!result.ok) return page("That didn’t go through", "Please try the link again.", 502);
  if (request.method === "POST") return new Response(null, { status: 204 });
  return page(
    "Bond-result emails stopped",
    `This address will get no more bond auction emails. Your API key keeps working. To turn the emails back on, write to ${site.contactEmail}.`,
  );
}

export const GET = stop;
export const POST = stop;
