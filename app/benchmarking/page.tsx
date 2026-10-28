import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { AdviceDisclaimer } from "@/components/legal/AdviceDisclaimer";
import { CheckoutNotice } from "@/components/billing/CheckoutNotice";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";
import { EnquiryForm } from "@/components/ui/EnquiryForm";
import { paystackConfigured } from "@/lib/billing/paystack";
import { priceText, rateItem } from "@/lib/billing/ratecard";
import { rateOptions } from "@/lib/data/kenya-rates";
import { site } from "@/lib/site";
import { fitDescription } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Treasury benchmarking: your quarter against the market",
  description: fitDescription("For SACCO boards and pension trustees: send your holdings and get one sourced page showing, in shillings, what the same money earned against Kenya's Treasury auctions and the funds' published yields over the quarter. Facts, not advice."),
  alternates: { canonical: `${site.url}/benchmarking` },
};

const steps = [
  { n: "1", t: "You send the quarter's holdings", d: "A spreadsheet in any layout: each holding, the amount, the rate or yield earned and the dates. No member or personal data is needed, and none should be sent." },
  { n: "2", t: "We place each holding beside the market", d: "The Treasury bill or bond auctions of the same tenor in the same weeks, and the published yields of the funds open to an institution of your kind, each with its source and date." },
  { n: "3", t: "One page comes back for the board", d: "In shillings: what the money earned, what the same amounts earned at the auctions and across the published funds, and the difference. No recommendation, no rating of anyone." },
];

const pct = (v: number) => `${v.toFixed(2)}%`;

export default async function BenchmarkingPage({ searchParams }: { searchParams: Promise<{ checkout?: string; reference?: string; trxref?: string }> }) {
  const query = await searchParams;
  const item = rateItem("benchmarking");
  const live = paystackConfigured();
  const term = (lockIn: string) => parseFloat(lockIn) * (/year/.test(lockIn) ? 365 : 1);
  const government = rateOptions().options.filter((o) => o.group === "Government").sort((a, b) => term(a.lockIn) - term(b.lockIn));

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/for-institutions", label: "For institutions" }, { label: "Treasury benchmarking" }]}
      kicker="For boards and trustees"
      title="Your quarter, beside the market, on one page"
      lede={
        <p>
          Trustees and SACCO boards are asked whether the institution&rsquo;s money earned what the market paid. The usual answer comes from the party
          managing the money. This is the same question answered from the published results, in shillings, with the source for every figure.
        </p>
      }
      aside={
        item ? (
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[14px] font-semibold text-ink">
              {priceText(item)} {item.unit}
            </p>
            <p className="mt-1 text-[13px] leading-5 text-ink-soft">Included for one entity in the Treasury Desk. The page comes back within five working days of your file.</p>
            {live ? (
              <div className="mt-4">
                <PaystackCheckout plan="benchmarking" label="Order this quarter" variant="primary" />
              </div>
            ) : null}
            <a href="#enquiry" className="mt-3 inline-flex min-h-11 items-center text-[14px] font-semibold text-forest underline underline-offset-2">
              Or ask for an invoice
            </a>
          </div>
        ) : null
      }
    >
      <CheckoutNotice query={query} />
      <SectionTitle kicker="How it works" title="Three steps, one page" />
      <ol className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-3">
        {steps.map((s) => (
          <li key={s.n} className="bg-surface px-5 py-5">
            <p className="text-[13px] font-semibold text-gold">Step {s.n}</p>
            <p className="mt-1 font-serif text-xl text-ink">{s.t}</p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">{s.d}</p>
          </li>
        ))}
      </ol>

      <section className="mt-14">
        <SectionTitle kicker="The yardstick" title="What the government paid at the latest auctions" />
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">
          The benchmark page compares each holding with figures like these for the same weeks. After withholding tax for residents: 15% on bills and
          shorter bonds, 10% on bonds of ten years or more, none on infrastructure bonds.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Security</th>
                <th className="text-right">Published</th>
                <th className="text-right">After tax</th>
                <th className="text-right">Auction</th>
              </tr>
            </thead>
            <tbody>
              {government.map((o) => (
                <tr key={o.name}>
                  <td className="text-sm">
                    {o.source ? (
                      <a href={o.source} className="underline underline-offset-2" rel="noopener">
                        {o.name}
                      </a>
                    ) : (
                      o.name
                    )}
                  </td>
                  <td className="text-right text-sm">{pct(o.gross)}</td>
                  <td className="text-right text-sm">{pct(o.net)}</td>
                  <td className="text-right text-sm">{o.asOf}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-muted">Source: Central Bank of Kenya auction results, linked on each line.</p>
      </section>

      <section className="mt-14 max-w-3xl">
        <SectionTitle kicker="What it is not" title="Facts for the board, not a verdict on anyone" />
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-ink-soft">
          <li>It does not say what to buy or sell, and it does not rate your fund manager, bank or adviser. Decisions stay with the board and its licensed adviser.</li>
          <li>Fund yields are shown as each manager published them, in alphabetical order, never ranked.</li>
          <li>
            Your file is used only to make your page, kept privately and deleted after a year unless you ask us to keep it. See the{" "}
            <Link href="/legal/privacy" className="underline underline-offset-2">
              privacy notice
            </Link>
            .
          </li>
        </ul>
      </section>

      <AdviceDisclaimer />

      <section className="mt-14 max-w-2xl" id="enquiry">
        <SectionTitle kicker="Invoice instead" title="Ask for an invoice or a sample page" />
        <div className="mt-4">
          <EnquiryForm interest="pack" cta="Send" />
        </div>
      </section>
    </PageShell>
  );
}
