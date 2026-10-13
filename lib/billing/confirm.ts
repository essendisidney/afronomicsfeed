import { after } from "next/server";
import { verifyTransaction, type VerifiedPayment } from "./paystack";
import { notifyPayment, recordPayment } from "./record";

/**
 * When Paystack sends the buyer back: verify the reference with Paystack server-side (never trust the URL) and,
 * after the response, record the payment and send the receipt if this page stored it first (the webhook does
 * the same; recording is idempotent on the reference). Returns the verified payment, or null.
 */
export async function confirmReturn(reference: string | undefined): Promise<VerifiedPayment | null> {
  const payment = reference ? await verifyTransaction(reference) : null;
  if (payment?.status !== "success") return payment;
  const record = {
    reference: payment.reference,
    email: payment.email || null,
    plan: payment.plan,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    channel: payment.channel,
    paidAt: payment.paidAt,
    raw: payment.raw,
  };
  after(async () => {
    const stored = await recordPayment(record);
    if (stored.ok) await notifyPayment(record).catch(() => null);
  });
  return payment;
}
