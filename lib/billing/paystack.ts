import { createHmac, timingSafeEqual } from "node:crypto";
import { getCheckoutPlan, type CheckoutPlanId } from "./plans";

const PAYSTACK_INITIALIZE = "https://api.paystack.co/transaction/initialize";

export function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

function secret() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) return null;
  return key;
}

export async function startCheckout(input: { plan: CheckoutPlanId; email: string; callbackUrl: string }) {
  const key = secret();
  const plan = getCheckoutPlan(input.plan);
  if (!key || !plan) {
    return { ok: false as const, reason: "Paystack is not connected." };
  }

  const response = await fetch(PAYSTACK_INITIALIZE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: plan.amount,
      currency: plan.currency,
      callback_url: input.callbackUrl,
      metadata: { plan: plan.id, product: "afronomics-feed" },
    }),
  });

  const body = (await response.json()) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string };
  };

  const url = body.data?.authorization_url;
  if (!response.ok || !body.status || !url || !url.startsWith("https://checkout.paystack.com/")) {
    return { ok: false as const, reason: "Paystack did not open a hosted checkout." };
  }

  return { ok: true as const, authorizationUrl: url };
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
