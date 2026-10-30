import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Private links for a paying institution (Treasury Desk, D-035): this month's pack, and the benchmark upload and
 * report. The founder shares them personally (WhatsApp, LinkedIn, in person); nothing is emailed (D-030, D-033).
 *
 * A link is a signed, expiring token naming the organisation and what it opens. It is checked against the live
 * entitlement on every visit, so a lapsed subscription closes the link even before it expires.
 */

export type LinkPurpose = "pack" | "benchmark";
export type OrgLink = { org: number; purpose: LinkPurpose; exp: number };

const VERSION = "o1";
export const LINK_DAYS: Record<LinkPurpose, number> = { pack: 45, benchmark: 120 };

function key() {
  const base = process.env.AF_CRON_SECRET ?? "";
  if (base.length < 16) return null;
  return createHmac("sha256", base).update("afronomics-org-link:v1").digest();
}

const sign = (k: Buffer, body: string) => createHmac("sha256", k).update(`${VERSION}.${body}`).digest("base64url");

export function orgLinkToken(org: number, purpose: LinkPurpose, now = Date.now()): string | null {
  const k = key();
  if (!k || !Number.isInteger(org) || org <= 0) return null;
  const exp = Math.floor(now / 1000) + LINK_DAYS[purpose] * 86400;
  const body = Buffer.from(JSON.stringify({ o: org, p: purpose, e: exp })).toString("base64url");
  return `${VERSION}.${body}.${sign(k, body)}`;
}

export function verifyOrgLink(token: string | null | undefined, purpose: LinkPurpose, now = Date.now()): OrgLink | null {
  if (typeof token !== "string" || token.length > 300) return null;
  const k = key();
  if (!k) return null;
  const [v, body, sig] = token.split(".");
  if (v !== VERSION || !body || !sig) return null;
  const want = Buffer.from(sign(k, body));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString()) as { o: number; p: string; e: number };
    if (p.p !== purpose || !Number.isInteger(p.o) || p.o <= 0 || !(p.e > now / 1000)) return null;
    return { org: p.o, purpose, exp: p.e };
  } catch {
    return null;
  }
}

export const orgLinkPath = (purpose: LinkPurpose, token: string) => (purpose === "pack" ? `/pack/issue/${token}` : `/benchmarking/client/${token}`);
