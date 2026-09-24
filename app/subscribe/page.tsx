import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { SubscribeForm } from "@/components/ui/SubscribeForm";

export const metadata: Metadata = {
  title: "Subscribe",
  description: "Request a KES 500 14-day Individual trial. Checkout is not live.",
};

export default function SubscribePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-14 sm:px-6">
      <PageHeader
        kicker="Subscribe"
        title="Fourteen days of the file"
        lede="KES 500 unlocks Individual access for 14 days when billing ships. This form does not take money."
      />
      <div className="mt-10 border border-rule bg-paper-2 p-6">
        <SubscribeForm />
      </div>
      <p className="mt-6 text-sm text-muted">
        See{" "}
        <Link href="/pricing" className="text-forest underline underline-offset-4">
          full pricing
        </Link>{" "}
        and your{" "}
        <Link href="/account" className="text-forest underline underline-offset-4">
          account
        </Link>{" "}
        seat. Digest catalogue:{" "}
        <Link href="/newsletters" className="text-forest underline underline-offset-4">
          newsletters
        </Link>
        . Checkout is not live.
      </p>
    </div>
  );
}
