import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Small server-only security helpers (security review, 13 Oct 2026).
 *
 * - safeEqual: constant-time string comparison for shared secrets and tokens. Both sides are hashed first, so the
 *   comparison takes the same time whatever the lengths, and a length mismatch is not leaked either.
 * - bearerOk: "Authorization: Bearer <secret>" check for the secret-gated send and cron routes.
 * - redactEmails: strips email addresses from text that goes to logs or into responses a workflow prints.
 * - sameOrigin: refuses cross-site POSTs to cookie-authorised routes (defence in depth on top of SameSite).
 */

const digest = (value: string) => createHash("sha256").update(value, "utf8").digest();

export function safeEqual(a: string | null | undefined, b: string | null | undefined) {
  if (typeof a !== "string" || typeof b !== "string" || !a || !b) return false;
  return timingSafeEqual(digest(a), digest(b));
}

export function bearerOk(request: Request, secret: string | null | undefined) {
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  return safeEqual(header.slice(7), secret);
}

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

export function redactEmails(text: string) {
  return text.replace(EMAIL, "[address]");
}

/** The email's domain only, for logs. */
export function emailDomain(email: string | null | undefined) {
  return email ? email.slice(email.lastIndexOf("@") + 1).toLowerCase() : "none";
}

/**
 * True when a state-changing request comes from this site. Browsers send Origin on every cross-site POST (and
 * Sec-Fetch-Site on all modern ones); a request with neither (curl, server-to-server) is allowed, because the
 * cookie that authorises it is never sent cross-site anyway.
 */
export function sameOrigin(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch {
    return false;
  }
}
