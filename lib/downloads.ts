import { createHash, createHmac } from "node:crypto";
import { safeEqual } from "@/lib/security";
import { rpc } from "@/lib/store";
import { SESSION_COOKIE, SESSION_HOURS } from "./downloads-core";

/**
 * Full-history CSV downloads in a browser (decision D-016). A browser link cannot send "Authorization: Bearer", so a
 * key holder signs in once on /downloads: the key is checked with af_api_key_use (counted like any keyed call), and
 * the server sets an HttpOnly, Secure, SameSite=Lax cookie holding a short-lived signed session. The CSV routes
 * accept that cookie as a valid key (lib/api.ts).
 *
 * The session never contains the key. It holds the key's SHA-256 fingerprint (what data_keys already stores, so each
 * download is checked against revocation and expiry and counted per key, migration 0039), the display prefix, the
 * plan and an expiry, signed with HMAC-SHA256. The signing key is derived from DOWNLOAD_SECRET, or, when that is not
 * set, from PAID_KEY_SECRET, then AF_CRON_SECRET, always through a domain-separated HMAC so the cookie is never
 * signed with a secret that does another job. Rotating whichever is in use signs everyone out; nothing else breaks.
 *
 * Why a cookie and not per-file signed URLs: a signed URL is a bearer credential in the address bar, browser history,
 * server and CDN logs and any Referer, and it can be forwarded. The cookie is not readable by scripts, not sent
 * cross-site on POSTs or sub-requests, never appears in a URL or a log, and one sign-in covers every file.
 */

export type DownloadSession = { hash: string; prefix: string; plan: string; issuedAt: number; expiresAt: number };

const VERSION = "v1";
const MAX_SECONDS = SESSION_HOURS * 3600;

function signingKey() {
  const base = process.env.DOWNLOAD_SECRET || process.env.PAID_KEY_SECRET || process.env.AF_CRON_SECRET || "";
  if (base.length < 16) return null;
  return createHmac("sha256", base).update("afronomics-download-session:v1").digest();
}

export function downloadsEnabled() {
  return signingKey() !== null;
}

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString("base64url");
const sign = (key: Buffer, body: string) => createHmac("sha256", key).update(`${VERSION}.${body}`).digest("base64url");

/** The key's fingerprint, as data_keys stores it (0028). */
export function keyHash(key: string) {
  return createHash("sha256").update(key).digest("hex");
}

/** A signed session for a key that af_api_key_use has just accepted. Null when no signing secret is set. */
export function mintSession(key: string, plan: string, now = Date.now()): { token: string; session: DownloadSession } | null {
  const secret = signingKey();
  if (!secret) return null;
  const issuedAt = Math.floor(now / 1000);
  const session: DownloadSession = { hash: keyHash(key), prefix: key.slice(0, 10), plan: plan.slice(0, 20), issuedAt, expiresAt: issuedAt + MAX_SECONDS };
  const body = b64(JSON.stringify({ h: session.hash, p: session.prefix, pl: session.plan, iat: session.issuedAt, exp: session.expiresAt }));
  return { token: `${VERSION}.${body}.${sign(secret, body)}`, session };
}

/** The session in a token, or null when it is malformed, wrongly signed or expired. Constant-time signature check. */
export function verifySession(token: string | null | undefined, now = Date.now()): DownloadSession | null {
  if (typeof token !== "string" || token.length > 600) return null;
  const secret = signingKey();
  if (!secret) return null;
  const [version, body, sig, ...rest] = token.split(".");
  if (version !== VERSION || !body || !sig || rest.length) return null;
  if (!safeEqual(sig, sign(secret, body))) return null;
  let raw: { h?: unknown; p?: unknown; pl?: unknown; iat?: unknown; exp?: unknown };
  try {
    raw = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const t = Math.floor(now / 1000);
  const { h, p, pl, iat, exp } = raw;
  if (typeof h !== "string" || !/^[0-9a-f]{64}$/.test(h)) return null;
  if (typeof p !== "string" || !/^afk_[0-9a-f]{6}$/.test(p)) return null;
  if (typeof pl !== "string" || !/^[a-z_]{2,20}$/.test(pl)) return null;
  if (typeof iat !== "number" || typeof exp !== "number" || iat > t + 60 || exp <= t || exp - iat > MAX_SECONDS) return null;
  return { hash: h, prefix: p, plan: pl, issuedAt: iat, expiresAt: exp };
}

/** The download session cookie's value from a request, if any. */
export function sessionToken(request: Request): string | null {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === SESSION_COOKIE) return part.slice(i + 1).trim() || null;
  }
  return null;
}

let warnedMissing = false;

/**
 * Check a verified session against the database and count the download for its key (af_api_key_use_hash, migration
 * 0039): the plan, or null when the key has since been revoked or has expired, or the database cannot be reached.
 * Until 0039 is applied the signed session is honoured for the rest of its life (at most 12 hours after a successful
 * key check) and downloads are not counted per key; the sign-in itself was.
 */
export async function checkSession(session: DownloadSession, path: string): Promise<string | null> {
  const r = await rpc("af_api_key_use_hash", { p_secret: process.env.AF_CRON_SECRET ?? "", p_key_hash: session.hash, p_path: path });
  if (r.ok) return typeof r.value === "string" && r.value ? r.value : null;
  if (/PGRST202|Could not find the function|^404/.test(r.reason)) {
    if (!warnedMissing) {
      warnedMissing = true;
      console.log("[downloads] af_api_key_use_hash missing (migration 0039 not applied): honouring signed sessions without per-download checks");
    }
    return session.plan;
  }
  return null;
}

// Best-effort, per-instance limit on key attempts from one address (in memory only, like the other public forms;
// security review L-10). Keys are 192-bit random values, so this is about noise and cost, not guessing.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const attempts = new Map<string, number[]>();

export function attemptLimited(ip: string, now = Date.now()) {
  const hits = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  attempts.set(ip, hits);
  if (attempts.size > 5000) for (const [k, v] of attempts) if (now - (v.at(-1) ?? 0) > WINDOW_MS) attempts.delete(k);
  return hits.length > MAX_ATTEMPTS;
}
