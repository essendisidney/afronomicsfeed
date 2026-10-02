import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { AlertButton } from "@/components/ui/AlertButton";
import { auctionCalendar } from "@/lib/data/bill-measures";
import { renderTime } from "@/lib/data/fetcher";
import { billMarkets, latestBills, loadBillMarket } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Alerts — follow the markets you care about",
  description:
    "Get the Treasury bill result on your phone the moment each central bank publishes it: Kenya, Nigeria, Ghana, Uganda, Tanzania, Egypt, South Africa, Zambia, Malawi and Mozambique. Free, no app store, and WhatsApp for Kenya.",
  alternates: { canonical: `${site.url}/alerts` },
};

export default function AlertsPage() {
  const now = renderTime();
  const next = new Map(auctionCalendar(new Date(now)).map((n) => [n.market.slug, n.expected]));
  const regions = ["East", "West", "North", "Southern"] as const;
  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Alerts" }]}
      kicker="Follow your markets"
      title="The result on your phone, the minute it lands"
      lede={
        <p>
          Pick the markets you watch. When the central bank publishes an auction result, Afronomics reads it, checks it and sends one notification
          with the rates and the change — usually within minutes, always with the source. Free; no app store; works on Android, desktop, and on
          iPhone once the site is added to the home screen.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5 text-sm text-ink-soft">
          <p className="text-[14px] font-semibold text-ink">All ten at once</p>
          <p className="mt-1 leading-6">One switch for every market on the monitor.</p>
          <div className="mt-3">
            <AlertButton label="Alert me on every market" />
          </div>
          <p className="mt-5 text-[14px] font-semibold text-ink">Prefer WhatsApp or email?</p>
          <p className="mt-1 leading-6">
            The Kenya result on WhatsApp within minutes is KES 300 a month on the{" "}
            <Link href="/prices#readers" className="underline underline-offset-2">
              price guide
            </Link>
            ; every result by email is part of{" "}
            <Link href="/pricing" className="underline underline-offset-2">
              Pro
            </Link>
            . The free{" "}
            <Link href="/subscribe?list=morning" className="underline underline-offset-2">
              Morning
            </Link>{" "}
            carries every result the next day.
          </p>
        </div>
      }
    >
      {regions.map((region) => {
        const markets = billMarkets.filter((m) => m.region === region);
        if (!markets.length) return null;
        return (
          <section key={region} className="mt-10 first:mt-0">
            <SectionTitle kicker={`${region} Africa`} title={markets.map((m) => m.country).join(", ")} />
            <ul className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2">
              {markets.map((m) => {
                const latest = latestBills(loadBillMarket(m.slug).rows);
                const y = (latest.get(364) ?? latest.get(91) ?? latest.get(182))?.latest;
                return (
                  <li key={m.slug} className="bg-surface px-5 py-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <Link href={m.href} className="text-[15px] font-semibold text-ink hover:text-accent">
                        {m.country}
                      </Link>
                      <span className="text-[12px] text-muted">{next.get(m.slug) ? `next expected ${next.get(m.slug)}` : ""}</span>
                    </div>
                    <p className="mt-1 text-sm text-ink-soft">
                      {y ? (
                        <>
                          Latest {y.tenor}-day <strong className="text-ink">{y.rate.toFixed(2)}%</strong> on {y.date} · {m.publisher}
                        </>
                      ) : (
                        m.publisher
                      )}
                    </p>
                    <div className="mt-3">
                      <AlertButton market={m.slug} label={`Alert me on ${m.country}`} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="mt-8 text-xs text-muted">
        Notifications carry the rates and the change only; tapping opens the auction page with the source document. Switch off from the same button at
        any time; nothing is stored beyond the push subscription and the markets chosen.
      </p>
    </PageShell>
  );
}
