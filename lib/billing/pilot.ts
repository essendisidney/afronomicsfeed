/**
 * The self-serve 30-day pilot of the frontier local-debt data (form on /data/frontier-local-debt, /pricing and
 * /data-api; handler at /api/pilot). Safe to import from client components: constants only.
 */

export const pilotMarkets = [
  { id: "egypt", label: "Egypt" },
  { id: "nigeria", label: "Nigeria" },
  { id: "kenya", label: "Kenya" },
  { id: "uganda", label: "Uganda" },
  { id: "zambia", label: "Zambia" },
  { id: "morocco", label: "Morocco" },
  { id: "waemu", label: "WAEMU (Côte d’Ivoire, Senegal and six more)" },
  { id: "ghana", label: "Ghana" },
  { id: "tanzania", label: "Tanzania" },
  { id: "southafrica", label: "South Africa" },
  { id: "malawi", label: "Malawi" },
  { id: "mozambique", label: "Mozambique" },
] as const;

/** "Which would you pay for next?" Required: it decides what the desk builds after the auction data. */
export const pilotNextOptions = [
  { id: "fx", label: "FX" },
  { id: "eurobonds", label: "Eurobonds" },
  { id: "inflation", label: "Inflation" },
] as const;

/** Free mailbox providers. Instant institutional trial keys go to work addresses only; requests from these are still recorded. */
const webmail = new Set([
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.uk", "yahoo.fr", "ymail.com", "rocketmail.com",
  "hotmail.com", "hotmail.co.uk", "hotmail.fr", "outlook.com", "outlook.fr", "live.com", "live.co.uk", "msn.com",
  "icloud.com", "me.com", "mac.com", "aol.com", "proton.me", "protonmail.com", "pm.me", "gmx.com", "gmx.net", "gmx.de",
  "web.de", "mail.com", "zoho.com", "zohomail.com", "yandex.com", "yandex.ru", "mail.ru", "qq.com", "163.com", "126.com",
  "tutanota.com", "tuta.io", "fastmail.com", "hey.com", "libero.it",
]);

export function emailDomain(email: string) {
  return email.slice(email.lastIndexOf("@") + 1).toLowerCase();
}

export function isWebmail(email: string) {
  return webmail.has(emailDomain(email));
}

/** What /api/pilot answers. */
export type PilotResult =
  /** The key itself is only ever emailed; `emailed: false` when that email failed. */
  | { ok: true; status: "issued"; prefix: string; expiresAt: string; email: string; emailed?: boolean }
  | { ok: true; status: "pending" | "webmail" | "exists" | "limited" | "duplicate"; email: string; expiresAt?: string }
  | { ok: false; reason: string };
