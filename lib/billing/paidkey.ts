import { createHash, createHmac } from "node:crypto";
import { rpc } from "@/lib/store";
import { paystackLive } from "./paystack";
import { checkoutPlans, getCheckoutPlan, isCheckoutPlan } from "./plans";
import { institutionalTier, KES_PER_USD, localInstitutionPrices } from "./ratecard";

/**
 * Paid keys without the desk (master plan v2, item 3; migrations 0036 and 0039). A confirmed charge for Team and API
 * (data_team, data_team_ke) or Analyst (analyst, analyst_ke) issues one key per payment reference, valid to the end of
 * the paid period plus three days; a later payment by the same email for the same tier extends that key.
 *
 * Team and API keys are data_keys plan data_api (the JSON API and every CSV). Analyst keys are plan analyst: they
 * unlock full-history CSV downloads (in a browser through /downloads, or with the header), not the JSON API
 * (lib/api.ts). Analyst keys need migration 0039; until it is applied the database answers wrong_plan and the desk
 * issues the key by hand, as before.
 *
 * The key is derived from the reference with a server-only secret, so the database stores only its hash and yet
 * /thank-you can still show a key the webhook issued first (once, within three days, checked against the hash).
 * Never log the key or the buyer's email.
 */

export const keyPlans = ["data_team", "data_team_ke", "analyst", "analyst_ke"] as const;
export type KeyPlan = (typeof keyPlans)[number];

export function isKeyPlan(plan: string | null | undefined): plan is KeyPlan {
  return (keyPlans as readonly string[]).includes(plan ?? "");
}

/** Analyst checkout plans: the key is for full-history downloads, not the API. */
export function isAnalystPlan(plan: string | null | undefined) {
  return plan === "analyst" || plan === "analyst_ke";
}

const kenyaLocal = localInstitutionPrices.find((p) => p.id === "kenya")!;

/** One paid month of a key plan, in subunits, for each currency it may be collected in. */
function monthPrice(plan: KeyPlan, currency: string | null): number | null {
  const c = (currency ?? "").toUpperCase();
  const tier = isAnalystPlan(plan) ? "analyst" : "team";
  if (plan === "data_team" || plan === "analyst") {
    const usd = institutionalTier(tier).monthlyUsd;
    return c === "USD" ? usd * 100 : c === "KES" ? usd * KES_PER_USD * 100 : null;
  }
  return c === "KES" ? kenyaLocal[tier] * 100 : c === "USD" ? kenyaLocal.usd[tier] * 100 : null;
}

/**
 * Whole months paid for, 0 to 12, from the amount actually charged (5% tolerance for rounding). Metadata can be set by
 * anyone who opens a Paystack popup with the public key, so the plan alone is never enough: a small charge tagged
 * data_team gets no key and goes to the desk instead.
 */
export function paidMonths(plan: KeyPlan, amount: number, currency: string | null) {
  const price = monthPrice(plan, currency);
  if (!price || !Number.isFinite(amount) || amount <= 0) return 0;
  return Math.max(0, Math.min(12, Math.floor((amount + price * 0.05) / price)));
}

/** A Paystack test-mode charge (data.domain is "test"). Such payments are stored with status "test". */
export function isTestCharge(raw: unknown) {
  const r = raw as { domain?: unknown; data?: { domain?: unknown } } | null;
  return r?.domain === "test" || r?.data?.domain === "test";
}

/**
 * Keys for test payments only with an explicit flag, never in production: AF_ALLOW_TEST_KEYS=1, not the Vercel
 * production environment, and not a live Paystack key. Test keys last one day (see 0036).
 */
export function testKeysAllowed() {
  return process.env.AF_ALLOW_TEST_KEYS === "1" && process.env.VERCEL_ENV !== "production" && !paystackLive();
}

/** The checkout plan a Paystack plan code (PLN_…) belongs to, for subscription renewals that carry no metadata. */
export function planFromCode(code: string | null | undefined) {
  if (!code) return null;
  for (const id of Object.keys(checkoutPlans)) {
    if (isCheckoutPlan(id) && getCheckoutPlan(id)?.planCode === code) return id;
  }
  return null;
}

function keySecret() {
  // PAID_KEY_SECRET is the intended secret; the Paystack secret key is a server-only fallback so keys issue before it
  // is set. Neither is stored in the database, so a database copy alone cannot rebuild a key.
  return process.env.PAID_KEY_SECRET || process.env.PAYSTACK_SECRET_KEY || "";
}

/** The key for a reference: "afk_" and 48 hex characters, the same shape as desk and trial keys. */
export function deriveKey(reference: string, secret = keySecret()) {
  if (!secret) return null;
  const key = `afk_${createHmac("sha256", secret).update(`afronomics-paid-key:v1:${reference}`).digest("hex").slice(0, 48)}`;
  return { key, hash: createHash("sha256").update(key).digest("hex"), prefix: key.slice(0, 10) };
}

export type KeyOutcome =
  /** Not a key plan: nothing to do. */
  | { kind: "none" }
  /** A key plan, but no key was issued automatically: the desk issues it (reason is for the desk, never the buyer). */
  | { kind: "manual"; reason: string }
  /** A new key; `key` is present for the call that issued it (and for a successful reveal on /thank-you). */
  | { kind: "issued"; key: string | null; prefix: string; expiresAt: string; paidUntil: string; test: boolean }
  /** The buyer's existing key was extended. */
  | { kind: "renewed"; prefix: string; expiresAt: string; paidUntil: string; test: boolean };

type IssueRow = {
  status?: string;
  outcome?: string;
  prefix?: string | null;
  paid_until?: string;
  expires_at?: string;
  revealed?: boolean;
};

const missingFunction = (reason: string) => /PGRST202|Could not find the function|^404/.test(reason);

/**
 * Issue or extend the key for a recorded payment (call after recordPayment). `fresh` is true only for the call that
 * did the work, so only that call sends the email. With `reveal` (the /thank-you path) the key is also returned when
 * the webhook issued it first, once.
 */
export async function issuePaidKey(
  p: { reference: string; plan: string | null; amount: number; currency: string | null; status: string; email: string | null },
  opts: { reveal: boolean },
): Promise<{ outcome: KeyOutcome; fresh: boolean }> {
  if (!isKeyPlan(p.plan)) return { outcome: { kind: "none" }, fresh: false };
  const manual = (reason: string) => ({ outcome: { kind: "manual" as const, reason }, fresh: false });
  const cron = process.env.AF_CRON_SECRET ?? "";
  if (!cron) return manual("AF_CRON_SECRET not set");
  if (!p.email) return manual("no email on the payment");
  const test = p.status === "test";
  if (test && !testKeysAllowed()) return manual("test payment: keys for test payments are off here");
  if (!test && p.status !== "success") return manual(`payment status ${p.status}`);
  const months = paidMonths(p.plan, p.amount, p.currency);
  if (!months) return manual("amount is below one month of the plan");
  const derived = deriveKey(p.reference);
  if (!derived) return manual("no key secret set (PAID_KEY_SECRET)");

  const r = await rpc("af_paid_key_issue", {
    p_secret: cron,
    p_reference: p.reference,
    p_months: months,
    p_key_hash: derived.hash,
    p_prefix: derived.prefix,
    p_label: `${test ? "TEST " : ""}${isAnalystPlan(p.plan) ? "Analyst" : "Team and API"}: ${p.email.slice(p.email.lastIndexOf("@") + 1)} (${p.reference})`.slice(0, 120),
    p_allow_test: test,
    p_reveal: opts.reveal,
  });
  if (!r.ok) return manual(missingFunction(r.reason) ? "migration 0036 not applied" : `rpc failed: ${r.reason.slice(0, 80)}`);
  const v = (r.value ?? null) as IssueRow | null;
  if (!v?.status) return manual("secret rejected");
  if (v.status === "wrong_plan" && isAnalystPlan(p.plan)) return manual("Analyst keys need migration 0039");

  const base = { prefix: v.prefix ?? derived.prefix, expiresAt: v.expires_at ?? "", paidUntil: v.paid_until ?? v.expires_at ?? "", test };
  if (v.status === "issued") return { outcome: { kind: "issued", key: derived.key, ...base }, fresh: true };
  if (v.status === "renewed") return { outcome: { kind: "renewed", ...base }, fresh: true };
  if (v.status === "duplicate") {
    if (v.outcome === "renewed") return { outcome: { kind: "renewed", ...base }, fresh: false };
    let key: string | null = null;
    if (opts.reveal && !v.revealed) {
      const shown = await rpc("af_paid_key_reveal", { p_secret: cron, p_reference: p.reference, p_key_hash: derived.hash });
      const s = shown.ok ? (shown.value as { status?: string } | null) : null;
      if (s?.status === "revealed") key = derived.key;
    }
    return { outcome: { kind: "issued", key, ...base }, fresh: false };
  }
  return manual(`not issued: ${v.status}`);
}

/** Record whether the key email went out, so the desk sees "key issued, email failed". */
export async function markKeyEmail(reference: string, sent: boolean, error: string | null) {
  const cron = process.env.AF_CRON_SECRET ?? "";
  if (!cron) return;
  await rpc("af_paid_key_mark", { p_secret: cron, p_reference: reference, p_emailed: sent, p_error: error }).catch(() => null);
}

/**
 * True for the first caller per reference (the receipt and desk note go out once). Before migration 0036 the claim
 * function does not exist and every caller sends, as before; an unrecorded payment claims nothing (false).
 */
export async function claimReceipt(reference: string) {
  const cron = process.env.AF_CRON_SECRET ?? "";
  if (!cron) return true;
  const r = await rpc("af_payment_receipt_claim", { p_secret: cron, p_reference: reference });
  // Unreachable database: better a second receipt than none.
  if (!r.ok) return true;
  return r.value === true;
}
