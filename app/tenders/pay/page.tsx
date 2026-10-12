import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutNotice } from "@/components/billing/CheckoutNotice";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";
import { PageShell } from "@/components/data/PageShell";
import { site } from "@/lib/site";
import { TENDER_PRICE_KES } from "@/lib/tenders-core";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Keep your tender alerts — pay by M-Pesa or card",
  description: `Tender alerts for Kenyan government tenders: KES ${TENDER_PRICE_KES} a month or KES 5,000 a year, by M-Pesa, card or bank through Paystack.`,
  alternates: { canonical: `${site.url}/tenders/pay` },
  robots: { index: false },
};

type Query = { e?: string; checkout?: string; reference?: string; trxref?: string };

/** Pay for tender alerts through Paystack. The payment extends the alert on that email by itself (lib/billing/record.ts). */
export default async function TenderPayPage({ searchParams }: { searchParams: Promise<Query> }) {
  const q = await searchParams;
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(q.e ?? "") ? q.e!.toLowerCase().slice(0, 200) : "";
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/tenders", label: "Kenya tenders" }, { label: "Keep your alerts" }]}
      kicker="Tender alerts"
      title="Keep your tender alerts coming"
      lede={
        <p>
          Every new Kenyan government tender that matches what you supply, by email as the procurement regulator publishes it. Pay with M-Pesa, card or bank through Paystack; use
          the email your alerts go to and they continue on their own.
        </p>
      }
    >
      <CheckoutNotice query={q} />
      <section className="grid max-w-3xl gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">Monthly</p>
          <p className="mt-1 font-serif text-3xl text-ink">KES {TENDER_PRICE_KES}</p>
          <p className="mb-4 text-[13px] text-ink-soft">a month</p>
          <PaystackCheckout plan="tender_alerts" label={`Pay KES ${TENDER_PRICE_KES}`} defaultEmail={email} />
        </div>
        <div className="rounded-2xl border-2 border-forest/40 bg-surface px-5 py-5">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-forest">A year · two months free</p>
          <p className="mt-1 font-serif text-3xl text-ink">KES 5,000</p>
          <p className="mb-4 text-[13px] text-ink-soft">twelve months</p>
          <PaystackCheckout plan="tender_alerts_year" label="Pay KES 5,000" defaultEmail={email} />
        </div>
      </section>
      <p className="mt-6 max-w-3xl text-sm text-ink-soft">
        No alerts yet?{" "}
        <Link href="/tenders#alerts" className="font-semibold text-forest underline underline-offset-2">
          Start with {14} days free
        </Link>
        . Questions or a different email: <a href={`mailto:${site.contactEmail}`} className="underline underline-offset-2">{site.contactEmail}</a>.
      </p>
    </PageShell>
  );
}
