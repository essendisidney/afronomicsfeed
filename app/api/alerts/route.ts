import { rpc } from "@/lib/store";
import { billMarkets } from "@/lib/data/sovereign-bills";

export const runtime = "nodejs";

const slugs = new Set<string>(billMarkets.map((m) => m.slug));

type Body = { endpoint?: string; keys?: { p256dh?: string; auth?: string }; markets?: string[] | null };

/** Save or update a browser's push subscription for auction alerts. markets: null for every market. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  const endpoint = body?.endpoint ?? "";
  if (!/^https:\/\/[^\s]{10,}$/.test(endpoint) || !body?.keys?.p256dh || !body.keys.auth) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 });
  }
  const markets = Array.isArray(body.markets) ? body.markets.filter((m) => slugs.has(m)) : null;
  const result = await rpc("af_push_subscribe", {
    p_endpoint: endpoint,
    p_p256dh: body.keys.p256dh,
    p_auth: body.keys.auth,
    p_markets: markets && markets.length ? markets : null,
  });
  return result.ok ? Response.json({ ok: true }) : Response.json({ error: "Could not save" }, { status: 502 });
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body?.endpoint) return Response.json({ error: "Missing endpoint" }, { status: 400 });
  await rpc("af_push_unsubscribe", { p_endpoint: body.endpoint });
  return Response.json({ ok: true });
}
