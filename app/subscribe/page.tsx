import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "The Afronomics Morning and Weekly — free newsletters",
  description: "Africa’s markets before 7am every weekday, and the week in 54 economies every Monday. Free, every figure linked to its source.",
  alternates: { canonical: `${site.url}/subscribe` },
};

export default async function SubscribePage({ searchParams }: { searchParams: Promise<{ unsubscribed?: string }> }) {
  const { unsubscribed } = await searchParams;
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Newsletter" }]}
      kicker="Free · every weekday at 7:00 and every Monday"
      title="The Afronomics Morning and Weekly"
      lede={
        <p>
          The Morning: Africa’s markets before 7am, every weekday, East Africa time. The Weekly: five minutes on 54 economies, every Monday. One sign-up, both
          notes.
        </p>
      }
    >
      {unsubscribed ? (
        <p className="mb-6 rounded-2xl border border-rule bg-surface px-5 py-4 text-sm text-ink">You’re unsubscribed. No more email from us unless you sign up again.</p>
      ) : null}
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-rule bg-paper-2 p-6">
          <SubscribeForm />
          <p className="mt-4 text-xs leading-5 text-muted">
            One email each weekday morning and one on Monday. Unsubscribe from any issue. We never sell or share your address — see the{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2">
              privacy notice
            </Link>
            .
          </p>
        </div>
        <div className="article-body">
          <h2>The Morning, every weekday</h2>
          <ul>
            <li>
              <strong>Overnight</strong> — every African currency against the dollar, and which moved.
            </li>
            <li>
              <strong>Auctions</strong> — Treasury bill results that landed since yesterday, across ten markets, and what is due today.
            </li>
            <li>
              <strong>Headlines</strong> — the handful that matter, from the publishers that broke them.
            </li>
          </ul>
          <h2>The Weekly, every Monday</h2>
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
