import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { confirmReturn } from "@/lib/billing/confirm";
import { getCheckoutPlan, moneyLabel } from "@/lib/billing/plans";
import { institutionalTier, rateCard } from "@/lib/billing/ratecard";
import { nextStep } from "@/lib/billing/record";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

/** What the buyer gets, by checkout plan: the institutional ladder's own list, otherwise the rate card line. */
function whatYouGet(plan: string | null): string[] {
  if (plan === "analyst") return [...institutionalTier("analyst").includes];
  if (plan === "data_team") return [...institutionalTier("team").includes];
  for (const g of rateCard) for (const i of g.items) if (i.checkout === plan) return [i.what];
  return [];
}

/**
 * Where Paystack sends every buyer back (except tender alerts and job listings, which have their own pages). The
 * reference is verified with Paystack server-side and the payment recorded; the page says what was bought, what
 * happens next and when, and how to get help.
 */
export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ checkout?: string; reference?: string; trxref?: string }> }) {
  const query = await searchParams;
  const reference = query.reference ?? query.trxref;
  const payment = reference ? await confirmReturn(reference) : null;
  const help = `mailto:${site.contactEmail}?subject=${encodeURIComponent(`Payment ${reference ?? ""}`.trim())}`;

  if (!payment || payment.status !== "success") {
    return (
      <PageShell crumbs={[{ href: "/", label: "Home" }, { href: "/pricing", label: "Pricing" }, { label: "Payment" }]} kicker="Payment" title={reference ? "We couldn’t confirm this payment yet" : "No payment was taken"}>
        <div className="max-w-2xl space-y-4 text-[15px] leading-7 text-ink-soft">
          {reference ? (
            <p>
              Paystack has not confirmed a completed payment for reference <span className="font-mono text-ink">{reference}</span>. If M-Pesa is still
              asking you to approve it, approve it and reload this page. If you were charged, email{" "}
              <a className="font-semibold text-forest underline underline-offset-2" href={help}>
                {site.contactEmail}
              </a>{" "}
              with the reference and the desk sorts it out the same working day.
            </p>
          ) : (
            <p>The checkout was closed before paying, so nothing was charged.</p>
          )}
          <p>
            <Link href="/pricing" className="font-semibold text-forest underline underline-offset-2">
              Back to pricing
            </Link>{" "}
            ·{" "}
            <Link href="/pricing?plan=enterprise#invoice" className="underline underline-offset-2">
              Pay by invoice instead
            </Link>
          </p>
        </div>
      </PageShell>
    );
  }

  const plan = getCheckoutPlan(payment.plan ?? "");
  const product = plan?.product ?? payment.plan ?? "Afronomics";
  const recurring = Boolean(plan?.planCode);
  const gets = whatYouGet(payment.plan);
  const rows: Array<[string, React.ReactNode]> = [
    ["Product", product],
    ["Paid", `${moneyLabel(payment.amount, payment.currency)}${payment.channel ? ` by ${payment.channel.replace(/_/g, " ")}` : ""}`],
    ["Reference", <span key="ref" className="font-mono">{payment.reference}</span>],
    ["Receipt sent to", payment.email || "the email you paid with"],
    ["Renewal", recurring ? "Monthly, through Paystack; cancel any time from the Paystack email." : "None: this was a one-off payment. Nothing renews automatically."],
  ];

  return (
    <PageShell crumbs={[{ href: "/", label: "Home" }, { href: "/pricing", label: "Pricing" }, { label: "Thank you" }]} kicker="Payment confirmed" title="Thank you. You’re in.">
      <div className="grid max-w-4xl gap-8 lg:grid-cols-[1fr_18rem]">
        <div>
          <table className="data-table">
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k}>
                  <th scope="row" className="w-40 text-left font-medium text-muted">
                    {k}
                  </th>
                  <td className="text-ink">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="mt-8 font-serif text-2xl text-ink">What happens next</h2>
          <p className="mt-2 text-[15px] leading-7 text-ink-soft">{nextStep(payment.plan)}</p>

          {gets.length ? (
            <>
              <h2 className="mt-8 font-serif text-2xl text-ink">What you get</h2>
              <ul className="mt-2 space-y-1.5 text-[15px] leading-7 text-ink-soft">
                {gets.map((g) => (
                  <li key={g} className="flex gap-2">
                    <span aria-hidden className="text-up">
                      ✓
                    </span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        <aside className="h-fit rounded-2xl border border-rule bg-surface px-5 py-5 text-[14px] leading-6 text-ink-soft">
          <p className="text-[15px] font-semibold text-ink">Need help?</p>
          <p className="mt-1">
            Reply to the receipt, or email{" "}
            <a className="font-semibold text-forest underline underline-offset-2" href={help}>
              {site.contactEmail}
            </a>{" "}
            with your reference. The desk answers within one working day (Nairobi time).
          </p>
          <p className="mt-3">Need an invoice or a receipt in your firm’s name? Reply with the billing name and address and we send one.</p>
        </aside>
      </div>
      <p className="mt-10 text-sm text-ink-soft">
        <em>Information, not advice.</em>
      </p>
    </PageShell>
  );
}
