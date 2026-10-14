import fs from "node:fs";
import path from "node:path";
import { createHmac, timingSafeEqual } from "node:crypto";
import { site } from "@/lib/site";

/**
 * Private Watch pack links (docs/rebuild/phase-5-plan.md): /watch/<slug>/<issued>.<expires>.<signature>, signed for one
 * SACCO with HMAC-SHA256. The signing key is derived, through its own label, from the same secret the download
 * sessions use (lib/downloads.ts), so it never doubles as another secret. A link expires (a quarter plus a month by
 * default) and can be withdrawn for a SACCO in data/watch/revoked.json. Like any emailed link it is a bearer link: it
 * goes only to the SACCO's named contacts.
 */

const LABEL = "afronomics-watch-pack:v1";
export const LINK_DAYS = 120;

function key(): Buffer | null {
  const base = process.env.DOWNLOAD_SECRET || process.env.PAID_KEY_SECRET || process.env.AF_CRON_SECRET || "";
  if (base.length < 16) return null;
  return createHmac("sha256", base).update(LABEL).digest();
}

export const watchLinksEnabled = () => key() !== null;

const sign = (k: Buffer, slug: string, iat: number, exp: number) => createHmac("sha256", k).update(`${slug}.${iat}.${exp}`).digest("base64url");

export function watchToken(slug: string, now = Date.now(), days = LINK_DAYS): string | null {
  const k = key();
  if (!k) return null;
  const iat = Math.floor(now / 1000);
  const exp = iat + days * 86400;
  return `${iat}.${exp}.${sign(k, slug, iat, exp)}`;
}

export function watchUrl(slug: string, now = Date.now()): string | null {
  const t = watchToken(slug, now);
  return t ? `${site.url}/watch/${slug}/${t}` : null;
}

type Revoked = { slug: string; issued_before: string };

function revoked(): Revoked[] {
  const file = path.join(process.cwd(), "data", "watch", "revoked.json");
  if (!fs.existsSync(file)) return [];
  return (JSON.parse(fs.readFileSync(file, "utf8")) as { revoked: Revoked[] }).revoked;
}

/** True only for an unexpired, unrevoked link signed for exactly this SACCO. */
export function checkWatchToken(slug: string, token: string, now = Date.now()): boolean {
  const k = key();
  if (!k) return false;
  const m = /^(\d{9,11})\.(\d{9,11})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!m) return false;
  const iat = Number(m[1]);
  const exp = Number(m[2]);
  if (exp * 1000 <= now || iat * 1000 > now + 60_000 || exp <= iat) return false;
  const want = Buffer.from(sign(k, slug, iat, exp));
  const got = Buffer.from(m[3]);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return false;
  return !revoked().some((r) => r.slug === slug && iat * 1000 < Date.parse(`${r.issued_before}T00:00:00Z`));
}
