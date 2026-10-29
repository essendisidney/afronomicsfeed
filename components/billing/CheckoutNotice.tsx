import { confirmReturn } from "@/lib/billing/confirm";
import { moneyLabel } from "@/lib/billing/plans";
import { site } from "@/lib/site";

/**
 * Shown at the top of /pricing and /pack when Paystack sends the buyer back. The reference is verified with
 * Paystack server-side (never trusted from the URL) and the payment recorded, so the record exists even
 * before the webhook is registered. Recording is idempotent on the reference.
 */
export async function CheckoutNotice({ query }: { query: { checkout?: string; reference?: string; trxref?: string } }) {
  if (query.checkout !== "returned") return null;
  const reference = query.reference ?? query.trxref;
  const payment = await confirmReturn(reference);

  if (payment?.status === "success") {
    return (
      <p className="mb-8 rounded-2xl border border-up/40 bg-surface px-5 py-4 text-sm text-ink">
        <strong>Payment confirmed — thank you.</strong> {moneyLabel(payment.amount, payment.currency)}, reference{" "}
        <span className="font-mono">{payment.reference}</span>. A receipt is on its way to {payment.email}
        {payment.plan === "pro" || payment.plan === "professional" || payment.plan === "trial"
          ? ", and your access is set up from that address within one working day."
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
