import { after } from "next/server";
import { isTestCharge, type KeyOutcome } from "./paidkey";
import { verifyTransaction, type VerifiedPayment } from "./paystack";
import { fulfilPayment } from "./record";

/**
 * When Paystack sends the buyer back: verify the reference with Paystack server-side (never trust the URL), record the
 * payment and, for Team and API, issue the key (or, with `reveal`, pick up the one the webhook issued) so /thank-you
 * can show it once. The receipt and desk note go out after the response, once per reference (the webhook does the
 * same; whichever arrives first does the work). Returns the verified payment, or null, and the key outcome.
 */
export async function confirmReturnWithKey(reference: string | undefined, opts: { reveal: boolean }): Promise<{ payment: VerifiedPayment | null; key: KeyOutcome }> {
  const payment = reference ? await verifyTransaction(reference) : null;
  if (payment?.status !== "success") return { payment, key: { kind: "none" } };
  const record = {
    reference: payment.reference,
    email: payment.email ? payment.email.toLowerCase() : null,
    plan: payment.plan,
    amount: payment.amount,
    currency: payment.currency,
    // Paystack test-mode charges are stored as 'test' (left out of the desk's money; never a key in production).
    status: isTestCharge(payment.raw) ? "test" : payment.status,
    channel: payment.channel,
    paidAt: payment.paidAt,
    raw: payment.raw,
  };
  const { outcome, deliver } = await fulfilPayment(record, { reveal: opts.reveal, source: "return" });
  after(deliver);
  return { payment, key: outcome };
}

/** The same, for return notices that only confirm the payment (no key is shown, so none is revealed). */
export async function confirmReturn(reference: string | undefined): Promise<VerifiedPayment | null> {
  return (await confirmReturnWithKey(reference, { reveal: false })).payment;
}
