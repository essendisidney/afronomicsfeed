import type { Metadata } from "next";
import Link from "next/link";
import { CheckoutStub } from "@/components/ui/CheckoutStub";
import { LayerPage } from "@/components/intelligence/LayerPage";
import { pricing } from "@/lib/site";

export const metadata: Metadata = {
  title: "Afronomics Pro",
  description: "Pro, Professional and Enterprise seats for African economic intelligence. Checkout is not live.",
};

export default function ProPage() {
  return (
    <LayerPage
      crumbs={[{ href: "/", label: "Home" }, { label: "Pro" }]}
      kicker="Pro"
      title="The habit is free. The file is a seat."
      lede="Headlines and country shells stay open. Capital explorer depth, alerts, exports and Ask allowance sit on paid tiers. No live billing in this build."
    >
      <div className="grid gap-5 lg:grid-cols-3">
        {[pricing.pro, pricing.professional, pricing.enterprise].map((tier) => (
          <article key={tier.name} className="flex flex-col border border-rule p-6">
            <h2 className="font-serif text-2xl">{tier.name}</h2>
            <p className="mt-3 font-serif text-3xl">
              {tier.price}
              {"period" in tier ? <span className="text-lg text-muted">{tier.period}</span> : null}
            </p>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">{tier.cadence}</p>
            <p className="mt-4 flex-1 text-sm leading-6 text-ink-soft">{tier.detail}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 max-w-sm">
        <CheckoutStub label="Checkout is not live" />
      </div>
      <p className="mt-6 text-sm">
        Full matrix on{" "}
        <Link href="/pricing" className="text-forest underline underline-offset-2">
          pricing
        </Link>
        . Kenya desk trial remains {pricing.trial.price}.
      </p>
    </LayerPage>
  );
}
