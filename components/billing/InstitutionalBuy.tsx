import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";
import { paystackConfigured } from "@/lib/billing/paystack";
import { getCheckoutPlan, institutionalCharge } from "@/lib/billing/plans";
import type { InstitutionalTierId } from "@/lib/billing/ratecard";

/**
 * The buy button for an institutional tier, priced from the rate card. Analyst and Team and API go to Paystack
 * checkout (or to the invoice form when Paystack is not connected); Enterprise is always "request an invoice".
 */
export function InstitutionalBuy({ tier, name, variant = "primary" }: { tier: InstitutionalTierId; name: string; variant?: "primary" | "ghost" }) {
  if (tier === "enterprise" || !paystackConfigured()) {
    return (
      <Link
        href={`/pricing?plan=${tier}#invoice`}
        className={buttonClass({ variant: variant === "primary" ? "primary" : "secondary", block: true })}
      >
        Request an invoice
      </Link>
    );
  }
  const id = tier === "analyst" ? "analyst" : "data_team";
  const charge = institutionalCharge(id);
  const recurring = Boolean(getCheckoutPlan(id)?.planCode);
  return (
    <PaystackCheckout
      plan={id}
      label={`Buy ${name} · ${charge.dollars}/mo`}
      variant={variant}
      note={`${charge.note} ${recurring ? "Renews monthly; cancel any time." : "One month; nothing renews automatically."}`}
    />
  );
}
