/**
 * Browser full-history downloads (decision D-016): the parts the client components need too. No secrets and no
 * crypto here; the signed session itself is in lib/downloads.ts (server only).
 */

/** HttpOnly cookie holding the signed download session (never the key). */
export const SESSION_COOKIE = "af_dl";
/** Script-readable flag with the same lifetime, so static pages can show the right link. It carries no authority. */
export const FLAG_COOKIE = "af_dl_on";
/** How long a download session lasts. */
export const SESSION_HOURS = 12;

/** The CSV routes behind the free tier (the others, indicators and money market funds, are free in full). */
const GATED = /^\/api\/data\/(bonds\/[a-z0-9-]+|tbills\/[a-z0-9-]+|kenya-bonds|kenya-tbills)$/;

export function isGatedCsv(path: string) {
  return GATED.test(path);
}

/** The full-history URL of a gated CSV: its own cache key, never stored by the CDN (lib/api.ts). */
export function fullHistoryHref(csv: string) {
  return `${csv}${csv.includes("?") ? "&" : "?"}full=1`;
}

/**
 * A same-site path to return to after sign-in, or null. Only plain absolute paths: no scheme, no host, no "//" or
 * "/\" (which browsers treat as another host), no control characters.
 */
export function safeNext(value: string | null | undefined): string | null {
  if (typeof value !== "string" || value.length < 1 || value.length > 300) return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  if (/[\u0000-\u001f\u007f\\]/.test(value)) return null;
  try {
    const url = new URL(value, "https://example.invalid");
    if (url.host !== "example.invalid") return null;
    return url.pathname + url.search;
  } catch {
    return null;
  }
}
