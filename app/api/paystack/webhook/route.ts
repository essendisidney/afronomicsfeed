import { after } from "next/server";
import { verifyPaystackSignature } from "@/lib/billing/paystack";
import { notifyPayment, recordPayment, recordSubscription } from "@/lib/billing/record";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PaystackEvent = {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
    paid_at?: string;
    channel?: string;
    customer?: { email?: string; customer_code?: string };
    metadata?: { plan?: string } | string;
    plan?: { plan_code?: string; name?: string } | string | null;
    subscription_code?: string;
    next_payment_date?: string;
  };
};

/**
 * Paystack webhook. Registered in Paystack (Settings → API Keys & Webhooks) as
 * https://www.afronomicsfeed.com/api/paystack/webhook. Every event with a valid signature is recorded through
 * af_record_payment / af_record_subscription; a charge also sends the receipt and a note to the desk.
 */
export async function POST(request: Request) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return Response.json({ ok: false, reason: "Paystack is not connected." }, { status: 503 });
  }
  const rawBody = await request.text();
  if (!verifyPaystackSignature(rawBody, request.headers.get("x-paystack-signature"))) {
    return Response.json({ ok: false, reason: "Signature did not match." }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as PaystackEvent;
  const data = event.data ?? {};
  const email = data.customer?.email?.toLowerCase() ?? null;
  const metadata = typeof data.metadata === "object" && data.metadata ? data.metadata : {};
  const planCode = typeof data.plan === "object" && data.plan ? data.plan.plan_code ?? null : null;

  if (event.event === "charge.success" && data.reference) {
    const payment = {
      reference: data.reference,
      email,
      plan: metadata.plan ?? planCode,
      amount: data.amount ?? 0,
      currency: data.currency ?? null,
      status: data.status ?? "success",
      channel: data.channel ?? null,
      paidAt: data.paid_at ?? new Date().toISOString(),
      raw: event,
    };
    const result = await recordPayment(payment);
    if (!result.ok) console.log(`[paystack] payment not stored: ${result.reason} ${JSON.stringify({ reference: data.reference, email })}`);
    after(async () => {
      const sent = await notifyPayment(payment).catch((e) => [`error:${String(e)}`]);
      console.log(`[paystack] ${data.reference} ${sent.join(" ")}`);
    });
  }

  if ((event.event === "subscription.create" || event.event === "subscription.disable" || event.event === "subscription.not_renew") && data.subscription_code) {
    const result = await recordSubscription({
      code: data.subscription_code,
      email,
      planCode,
      status: event.event === "subscription.create" ? "active" : event.event === "subscription.disable" ? "disabled" : "non-renewing",
      next: data.next_payment_date ?? null,
    });
    if (!result.ok) console.log(`[paystack] subscription not stored: ${result.reason} ${JSON.stringify({ code: data.subscription_code, email })}`);
  }

  // Always 200 once the signature is valid, so Paystack does not retry a stored event.
  return Response.json({ ok: true });
}
