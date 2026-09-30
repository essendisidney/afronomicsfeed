import { after } from "next/server";
import { rpc } from "@/lib/store";
import { site } from "@/lib/site";

/**
 * Public JSON API helpers. Responses are cached at the edge for five minutes; each served request is counted
 * (path, calling site, country; no IPs or keys) so we can see which datasets people build on.
 */
export function apiJson(request: Request, path: string, data: unknown, status = 200) {
  const origin = request.headers.get("origin") ?? request.headers.get("referer") ?? "";
  let caller = "";
  try {
    caller = origin ? new URL(origin).hostname.replace(/^www\./, "") : "";
  } catch {}
  const country = request.headers.get("x-vercel-ip-country") ?? "";
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
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
