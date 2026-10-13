import { cookies } from "next/headers";
import { FLAG_COOKIE, safeNext, SESSION_COOKIE, SESSION_HOURS } from "@/lib/downloads-core";
import { attemptLimited, downloadsEnabled, mintSession } from "@/lib/downloads";
import { sameOrigin } from "@/lib/security";
import { rpc } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Sign in for full-history CSV downloads in a browser (lib/downloads.ts). A plain HTML form POSTs the key here (never
 * in a URL); the key is checked once with af_api_key_use, which counts the sign-in against it like any keyed call,
 * and a signed 12-hour session that does not contain the key is set as an HttpOnly, Secure, SameSite=Lax cookie on
 * path /. The answer is a 303 back to /downloads with a status word, so a reload never resubmits the key.
 *
 * Refused: cross-site POSTs (Origin / Sec-Fetch-Site, on top of SameSite), more than 8 attempts from one address in
 * 15 minutes, and anything that is not the shape of a key (before any database call). The key is never logged.
 */
const KEY = /^afk_[0-9a-f]{48}$/;
const MAX_BODY = 4096;

function back(request: Request, status: string, next: string | null) {
  const url = new URL("/downloads", request.url);
  url.searchParams.set("status", status);
  if (next) url.searchParams.set("next", next);
  return new Response(null, { status: 303, headers: { Location: url.pathname + url.search, "Cache-Control": "no-store" } });
}

const cookieBase = { secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

export async function POST(request: Request) {
  if (!sameOrigin(request)) return new Response("Cross-site request refused.", { status: 403, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY) return new Response("Request too large.", { status: 413 });
  const form = await request.formData().catch(() => null);
  const field = (name: string) => {
    const v = form?.get(name);
    return typeof v === "string" ? v : "";
  };
  const next = safeNext(field("next"));
  const store = await cookies();

  if (field("action") === "signout") {
    store.set(SESSION_COOKIE, "", { ...cookieBase, httpOnly: true, maxAge: 0 });
    store.set(FLAG_COOKIE, "", { ...cookieBase, httpOnly: false, maxAge: 0 });
    return back(request, "signed_out", next);
  }

  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (attemptLimited(ip)) return back(request, "limited", next);

  const key = field("key").trim();
  if (!KEY.test(key)) return back(request, "invalid", next);
  if (!downloadsEnabled() || !process.env.AF_CRON_SECRET) return back(request, "unavailable", next);

  const check = await rpc("af_api_key_use", { p_secret: process.env.AF_CRON_SECRET, p_key: key, p_path: "/downloads/session" });
  if (!check.ok) return back(request, "unavailable", next);
  const plan = typeof check.value === "string" ? check.value : null;
  if (!plan) return back(request, "invalid", next);

  const minted = mintSession(key, plan);
  if (!minted) return back(request, "unavailable", next);
  const maxAge = SESSION_HOURS * 3600;
  store.set(SESSION_COOKIE, minted.token, { ...cookieBase, httpOnly: true, maxAge });
  // Script-readable flag only, so cached pages can switch their links; it grants nothing.
  store.set(FLAG_COOKIE, "1", { ...cookieBase, httpOnly: false, maxAge });
  return back(request, "signed_in", next);
}
