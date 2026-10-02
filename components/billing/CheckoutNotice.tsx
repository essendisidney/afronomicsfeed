import { after } from "next/server";
import { verifyTransaction } from "@/lib/billing/paystack";
import { moneyLabel } from "@/lib/billing/plans";
import { notifyPayment, recordPayment } from "@/lib/billing/record";
import { site } from "@/lib/site";

/**
 * Shown at the top of /pricing and /pack when Paystack sends the buyer back. The reference is verified with
 * Paystack server-side (never trusted from the URL) and the payment recorded, so the record exists even
 * before the webhook is registered. Recording is idempotent on the reference.
 */
export async function CheckoutNotice({ query }: { query: { checkout?: string; reference?: string; trxref?: string } }) {
  if (query.checkout !== "returned") return null;
  const reference = query.reference ?? query.trxref;
  const payment = reference ? await verifyTransaction(reference) : null;

  if (payment?.status === "success") {
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
      // The webhook sends the receipt when it is registered; send it here only if this page stored the record first.
      if (stored.ok) await notifyPayment(record).catch(() => null);
    });
    return (
      <p className="mb-8 rounded-2xl border border-up/40 bg-surface px-5 py-4 text-sm text-ink">
        <strong>Payment confirmed — thank you.</strong> {moneyLabel(payment.amount, payment.currency)}, reference{" "}
        <span className="font-mono">{payment.reference}</span>. A receipt is on its way to {payment.email}
        {payment.plan === "pro" || payment.plan === "professional" || payment.plan === "trial"
          ? ", and your access is set up from that address within one business day."
          : "; it says what to reply with so the desk can set this up for you."}
      </p>
    );
  }
  return (
    <p className="mb-8 rounded-2xl border border-down/40 bg-surface px-5 py-4 text-sm text-ink">
      We couldn’t confirm a completed payment{reference ? ` for reference ${reference}` : ""}. If you were charged, email{" "}
      <a className="underline" href={`mailto:${site.contactEmail}?subject=Payment%20${reference ?? ""}`}>
        {site.contactEmail}
      </a>{" "}
      with the reference and we’ll sort it out the same day.
    </p>
  );
}
