import { createHmac, timingSafeEqual } from "node:crypto";
import { getCheckoutPlan, type CheckoutPlanId } from "./plans";

const API = "https://api.paystack.co";

export function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

function secret() {
  return process.env.PAYSTACK_SECRET_KEY || null;
}

async function paystack<T>(path: string, init: RequestInit = {}) {
  const key = secret();
  if (!key) return null;
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as ({ status?: boolean; message?: string; data?: T } | null);
  return { ok: response.ok && Boolean(body?.status), body };
}

export async function startCheckout(input: { plan: CheckoutPlanId; email: string; callbackUrl: string }) {
  const plan = getCheckoutPlan(input.plan);
  if (!secret() || !plan) return { ok: false as const, reason: "Paystack is not connected." };

  const payload: Record<string, unknown> = {
    email: input.email,
    amount: plan.amount,
    currency: plan.currency,
    callback_url: input.callbackUrl,
    metadata: { plan: plan.id, product: "afronomics", cancel_action: input.callbackUrl.replace(/\?.*$/, "") },
  };
  // A plan code turns the charge into a recurring subscription; Paystack then uses the plan's price.
  if (plan.planCode) payload.plan = plan.planCode;

  const result = await paystack<{ authorization_url?: string; reference?: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const url = result?.body?.data?.authorization_url;
  if (!result?.ok || !url || !url.startsWith("https://checkout.paystack.com/")) {
    return { ok: false as const, reason: result?.body?.message ?? "Paystack did not open a checkout page." };
  }
  return { ok: true as const, authorizationUrl: url, reference: result.body?.data?.reference ?? null };
}

export type VerifiedPayment = {
  reference: string;
  status: string;
  amount: number;
  currency: string;
  email: string;
  plan: string | null;
  paidAt: string | null;
};

/** Server-side check of a transaction reference. Never trust the browser redirect alone. */
export async function verifyTransaction(reference: string): Promise<VerifiedPayment | null> {
  if (!/^[A-Za-z0-9_.=-]{6,100}$/.test(reference)) return null;
  const result = await paystack<{
    reference: string;
    status: string;
    amount: number;
    currency: string;
    paid_at?: string;
    customer?: { email?: string };
    metadata?: { plan?: string } | string;
  }>(`/transaction/verify/${encodeURIComponent(reference)}`);
  const data = result?.body?.data;
  if (!result?.ok || !data) return null;
  const metadata = typeof data.metadata === "object" && data.metadata ? data.metadata : {};
  return {
    reference: data.reference,
    status: data.status,
    amount: data.amount,
    currency: data.currency,
    email: data.customer?.email ?? "",
    plan: metadata.plan ?? null,
    paidAt: data.paid_at ?? null,
  };
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const key = secret();
  if (!key || !signature) return false;
  const digest = createHmac("sha512", key).update(rawBody).digest("hex");
  const left = Buffer.from(digest);
  const right = Buffer.from(signature);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
