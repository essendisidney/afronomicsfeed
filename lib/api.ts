import { after } from "next/server";
import { isCrawlerOrOwnJob } from "@/lib/bots";
import { rpc } from "@/lib/store";
import { site } from "@/lib/site";

/** A licensed customer's key, from "Authorization: Bearer afk_…" or "X-API-Key: afk_…". */
function keyOf(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const key = (auth.toLowerCase().startsWith("bearer ") ? auth.slice(7) : request.headers.get("x-api-key") ?? "").trim();
  return /^afk_[0-9a-f]{48}$/.test(key) ? key : key ? "invalid" : "";
}

/**
 * Public JSON API helpers. Responses are cached at the edge for five minutes; each served request is counted
 * (path, calling site, country; no IPs or keys) so we can see which datasets people build on. Automated callers
 * are served but not counted (lib/bots.ts).
 */
export async function apiJson(request: Request, path: string, data: unknown, status = 200): Promise<Response> {
  // Keyed calls (licensed customers; keys are issued on the desk, migration 0028): checked and counted per key, and served fresh,
  // never from the shared cache. The open API needs no key and is unchanged.
  const key = keyOf(request);
  let plan: string | null = null;
  if (key) {
    const checked = key === "invalid" ? null : await rpc("af_api_key_use", { p_secret: process.env.AF_CRON_SECRET ?? "", p_key: key, p_path: path });
    plan = checked?.ok ? (checked.value as string | null) : null;
    if (!plan) {
      return new Response(JSON.stringify({ error: "Unknown or revoked API key. The open API needs no key: drop the header, or write to the desk for a new key." }), {
        status: 401,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "no-store" },
      });
    }
  }
  const origin = request.headers.get("origin") ?? request.headers.get("referer") ?? "";
  let caller = "";
  try {
    caller = origin ? new URL(origin).hostname.replace(/^www\./, "") : "";
  } catch {}
  const country = request.headers.get("x-vercel-ip-country") ?? "";
  // Count people and the sites building on the data, not crawlers or Afronomics' own alert checker.
  if (!isCrawlerOrOwnJob(request.headers.get("user-agent")))
    after(() => rpc("af_hit", { p_path: `/api${path}`.slice(0, 200), p_referrer: caller || "api", p_country: country }).catch(() => undefined));
  return new Response(
    JSON.stringify(
      {
        ...(data as object),
        attribution: `Source: Afronomics (${site.url.replace("https://", "")}), compiled from central-bank publications. Free to use with this credit and a link.`,
        licence: `${site.url}/developers#terms`,
      },
      null,
      0,
    ),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": plan ? "private, no-store" : "public, s-maxage=300, stale-while-revalidate=3600",
        Vary: "Authorization, X-API-Key",
        ...(plan ? { "X-Afronomics-Plan": plan } : {}),
      },
    },
  );
}
