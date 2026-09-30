import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "The Afronomics Weekly — free newsletter",
  description: "Africa’s markets, economies and capital flows in one Monday email: the prints that moved, new DFI approvals, and what to watch.",
  alternates: { canonical: `${site.url}/subscribe` },
};

export default function SubscribePage() {
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Newsletter" }]}
      kicker="Free · every Monday"
      title="The Afronomics Weekly"
      lede={<p>Five minutes on 54 economies, sent Monday morning East Africa time.</p>}
    >
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="border border-rule bg-paper-2 p-6">
          <SubscribeForm />
          <p className="mt-4 text-xs leading-5 text-muted">
            One email a week. Unsubscribe from any issue. We never sell or share your address — see the{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2">
              privacy notice
            </Link>
            .
          </p>
        </div>
        <div className="article-body">
          <h2>In every issue</h2>
          <ul>
            <li>
              <strong>Currencies</strong> — the week’s moves against the dollar, and which central bank acted.
            </li>
            <li>
              <strong>The prints</strong> — inflation, growth and reserve figures that changed, with the source link.
            </li>
            <li>
              <strong>Capital</strong> — development-finance approvals and pipeline, and the largest private deals on the Wire.
            </li>
            <li>
              <strong>What to watch</strong> — rate decisions, auctions, budgets and elections in the week ahead.
            </li>
          </ul>
          <p>
            Want more than the weekly? <Link href="/pricing">Pro</Link> adds full analysis and alerts.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
