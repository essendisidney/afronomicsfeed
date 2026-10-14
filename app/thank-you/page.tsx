import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { PageShell } from "@/components/data/PageShell";
import { confirmReturnWithKey } from "@/lib/billing/confirm";
import { isAnalystPlan, type KeyOutcome } from "@/lib/billing/paidkey";
import { getCheckoutPlan, moneyLabel } from "@/lib/billing/plans";
import { institutionalTier, rateCard } from "@/lib/billing/ratecard";
import { nextStep } from "@/lib/billing/record";
import { site } from "@/lib/site";
import { CopyKey } from "./CopyKey";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

/** What the buyer gets, by checkout plan: the institutional ladder's own list, otherwise the rate card line. */
function whatYouGet(plan: string | null): string[] {
  if (plan === "analyst" || plan === "analyst_ke") return [...institutionalTier("analyst").includes];
  if (plan === "data_team" || plan === "data_team_ke") return [...institutionalTier("team").includes];
  for (const g of rateCard) for (const i of g.items) if (i.checkout === plan) return [i.what];
  return [];
}

const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/**
 * The Team and API key, or the Analyst download key, shown once: on the visit that issued it, or on the first visit
 * after the webhook issued it (within three days). Later visits say where the key went instead. Nothing for other plans.
 */
function KeyPanel({ keyOutcome, email, plan }: { keyOutcome: KeyOutcome; email: string; plan: string | null }) {
  const box = "mb-8 border border-forest/40 bg-paper-2 px-4 py-4 text-sm leading-6 text-ink";
  const to = email || "the email you paid with";
  const analyst = isAnalystPlan(plan);
  const noun = analyst ? "download key" : "API key";
  if (keyOutcome.kind === "issued" && keyOutcome.key && analyst) {
    return (
      <div className={box} role="status">
        <p className="text-[15px] font-semibold">
          Your download key is ready{keyOutcome.test ? " (test payment: this key lasts one day)" : ""}. It works until {longDate(keyOutcome.expiresAt)}.
        </p>
        <CopyKey value={keyOutcome.key} />
        <p className="mt-2 text-[13px] text-ink-soft">
          Shown once on this page and emailed to {to} with the receipt. We keep only a fingerprint of it, so store it somewhere safe now. If it leaks,
          email the desk and we replace it.
        </p>
        <p className="mt-3 text-[13px] text-ink-soft">
          To download: open{" "}
          <Link href="/downloads" className="font-semibold text-forest underline underline-offset-2">
            Full-history downloads
          </Link>
          , paste the key once, and every CSV link on the site gives the full history in that browser for 12 hours. Each renewal payment extends this key;
          if the plan is not renewed it stops three days after the paid period ends.
        </p>
      </div>
    );
  }
  if (keyOutcome.kind === "issued" && keyOutcome.key) {
    return (
      <div className={box} role="status">
        <p className="text-[15px] font-semibold">
          Your API key is ready{keyOutcome.test ? " (test payment: this key lasts one day)" : ""}. It works until {longDate(keyOutcome.expiresAt)}.
        </p>
        <CopyKey value={keyOutcome.key} />
        <p className="mt-2 text-[13px] text-ink-soft">
          Shown once on this page and emailed to {to} with the receipt. We keep only a fingerprint of it, so store it somewhere safe now. If it leaks,
          email the desk and we replace it.
        </p>
        <p className="mt-3 text-[13px] text-ink-soft">
          Send it as a header:
          <code className="mt-1 block overflow-x-auto whitespace-pre bg-surface px-3 py-2 font-mono text-[12px] text-ink">{`curl -H "Authorization: Bearer ${keyOutcome.prefix}…" \\\n  "${site.url}/api/v1/bonds/egypt?from=2026-01-01"`}</code>
          Endpoints and terms are on the{" "}
          <Link href="/data-api" className="underline underline-offset-2">
            data API page
          </Link>
          . Each renewal payment extends this key; if the plan is not renewed it stops three days after the paid period ends.
        </p>
      </div>
    );
  }
  if (keyOutcome.kind === "issued") {
    return (
      <div className={box} role="status">
        <p className="text-[15px] font-semibold">
          Your {noun} ({keyOutcome.prefix}…) is issued and works until {longDate(keyOutcome.expiresAt)}.
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">
          For safety it is shown only once, and it was sent to {to} with the receipt. If it has not arrived, email{" "}
          <a className="underline underline-offset-2" href={`mailto:${site.contactEmail}`}>
            {site.contactEmail}
          </a>{" "}
          with the payment reference and the desk replaces it.
        </p>
      </div>
    );
  }
  if (keyOutcome.kind === "renewed") {
    return (
      <div className={box} role="status">
        <p className="text-[15px] font-semibold">
          Renewed: your {noun} ({keyOutcome.prefix}…) now works until {longDate(keyOutcome.expiresAt)}.
        </p>
        <p className="mt-1 text-[13px] text-ink-soft">Same key, nothing to change in your systems. The receipt is on its way to {to}.</p>
      </div>
    );
  }
  return null;
}

/**
 * Where Paystack sends every buyer back. The
 * reference is verified with Paystack server-side and the payment recorded; for Team and API the key is issued (or
 * picked up from the webhook) and shown once. The page says what was bought, what happens next and when, and how to
 * get help.
 */
export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ checkout?: string; reference?: string; trxref?: string }> }) {
  const query = await searchParams;
  const reference = query.reference ?? query.trxref;
  // Show a key on screen only in the browser that started this checkout (cookie set by /api/checkout). Anyone else
  // holding the reference still gets the confirmation, but not the key: it is in the buyer's receipt email.
  const bound = Boolean(reference) && (await cookies()).get("af_checkout")?.value === reference;
  const confirmed = reference ? await confirmReturnWithKey(reference, { reveal: bound }) : { payment: null, key: { kind: "none" } as KeyOutcome };
  const payment = confirmed.payment;
  // The buyer's address in full only to the browser that paid; elsewhere masked (a reference alone is not identity).
  const shownEmail = !payment?.email ? "" : bound ? payment.email : payment.email.replace(/^(.).*(@.*)$/, "$1…$2");
  const key: KeyOutcome = !bound && confirmed.key.kind === "issued" ? { ...confirmed.key, key: null } : confirmed.key;
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
    ["Receipt sent to", shownEmail || "the email you paid with"],
    ["Renewal", recurring ? "Monthly, through Paystack; cancel any time from the Paystack email." : "None: this was a one-off payment. Nothing renews automatically."],
  ];

  return (
    <PageShell crumbs={[{ href: "/", label: "Home" }, { href: "/pricing", label: "Pricing" }, { label: "Thank you" }]} kicker="Payment confirmed" title="Thank you. You’re in.">
      <div className="grid max-w-4xl gap-8 lg:grid-cols-[1fr_18rem]">
        <div>
          <KeyPanel keyOutcome={key} email={shownEmail} plan={payment.plan} />
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
          <p className="mt-2 text-[15px] leading-7 text-ink-soft">{nextStep(payment.plan, key)}</p>

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
