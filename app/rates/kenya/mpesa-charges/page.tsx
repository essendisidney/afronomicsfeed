import type { Metadata } from "next";
import Link from "next/link";
import { MpesaCalculator } from "@/components/data/MpesaCalculator";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { FollowUp } from "@/components/ui/FollowUp";
import { loadMpesaTariffs } from "@/lib/data/mpesa-tariffs";
import { charge, fulizaCost } from "@/lib/mpesa-calc";
import { site } from "@/lib/site";
import { fitDescription, fitTitle } from "@/lib/seo";

const kes = (n: number) => `KES ${n.toLocaleString("en-US")}`;
const longDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

export const metadata: Metadata = {
  title: fitTitle("M-PESA charges and Fuliza fees calculator: what you really pay"),
  description: fitDescription(
    "Safaricom's M-PESA charges for sending and withdrawing, and Fuliza's access and daily fees, in one calculator: one transaction, a Fuliza balance, or a whole month of your habits. Free, no sign-up.",
  ),
  alternates: { canonical: `${site.url}/rates/kenya/mpesa-charges` },
};

export default function MpesaChargesPage() {
  const t = loadMpesaTariffs();
  const f1000 = fulizaCost(t, 1000, 7);
  const items = [
    {
      q: "How much does M-PESA charge to send money?",
      a: `Sending up to KES 100 to another M-PESA number is free. From KES 101 the charge rises by band, to ${kes(charge(t, "send", 1000)!)} for KES 1,000 and ${kes(charge(t, "send", 10000)!)} for KES 10,000, up to ${kes(charge(t, "send", 250000)!)} for the largest amounts. These are Safaricom's published charges, checked on ${longDate(t.checked)}.`,
    },
    {
      q: "How much does it cost to withdraw from an M-PESA agent?",
      a: `${kes(charge(t, "withdraw", 1000)!)} for KES 1,000, ${kes(charge(t, "withdraw", 5000)!)} for KES 5,000 and ${kes(charge(t, "withdraw", 10000)!)} for KES 10,000. Agents do not pay out less than KES 50.`,
    },
    {
      q: "How much does Fuliza cost?",
      a: `A one-off access fee of ${t.fuliza.access_fee_pct}% of the amount, then a daily fee that depends on the balance, charged from the next day until you repay. Using KES 1,000 for a week costs about ${kes(Math.round(f1000.total))} in total.`,
    },
  ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "M-PESA and Fuliza charges" }]}
      kicker="M-PESA and Fuliza · Kenya"
      title="What do M-PESA and Fuliza really cost you?"
      lede={
        <p>
          Safaricom’s own charges, in one place. Check one transaction, see what a Fuliza balance costs by the day, or put in your usual month and see what
          you pay in a year.
        </p>
      }
    >
      <MpesaCalculator tariffs={t} />

      <section aria-labelledby="table" className="mt-12">
        <SectionTitle kicker="Safaricom’s published charges" title="Every band" />
        <div className="table-box mt-4 overflow-x-auto" tabIndex={0} role="region" aria-label="M-PESA charges (scrolls sideways)">
          <table className="data-table">
            <thead>
              <tr>
                <th>Amount (KES)</th>
                <th className="text-right">Send to M-PESA</th>
                <th className="text-right">Send to other networks</th>
                <th className="text-right">Withdraw at agent</th>
              </tr>
            </thead>
            <tbody>
              {t.mpesa.map((b) => (
                <tr key={b.min}>
                  <th scope="row" className="tabular">
                    {b.min.toLocaleString("en-US")} – {b.max.toLocaleString("en-US")}
                  </th>
                  <td data-num className="text-right">{b.send ? b.send : "Free"}</td>
                  <td data-num className="text-right">{b.other ? b.other : "Free"}</td>
                  <td data-num className="text-right">{b.withdraw == null ? "Not allowed" : b.withdraw}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-box mt-6 overflow-x-auto" tabIndex={0} role="region" aria-label="Fuliza daily fees (scrolls sideways)">
          <table className="data-table">
            <thead>
              <tr>
                <th>Fuliza balance (KES)</th>
                <th className="text-right">Daily fee, with 20% excise</th>
              </tr>
            </thead>
            <tbody>
              {t.fuliza.daily.map((b) => (
                <tr key={b.min}>
                  <th scope="row" className="tabular">
                    {b.min.toLocaleString("en-US")} – {b.max.toLocaleString("en-US")}
                  </th>
                  <td data-num className="text-right">{b.fee ? b.fee.toFixed(2).replace(/\.00$/, "") : "Free"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[13px] leading-5 text-muted">
          Charges in KES, as published by Safaricom and checked by us on {longDate(t.checked)}:{" "}
          <a href={t.sources.mpesa} className="underline underline-offset-2">
            M-PESA charges
          </a>
          ,{" "}
          <a href={t.sources.fuliza} className="underline underline-offset-2">
            Fuliza
          </a>
          . Plus a one-off Fuliza access fee of {t.fuliza.access_fee_pct}%. Safaricom’s older Fuliza questions page mentions the first three days free on
          smaller balances; its current Fuliza page does not, so the calculator charges from the first day. Your M-PESA statement shows what you were
          actually charged. Paying a till or a paybill is not covered here.
        </p>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="Ways to pay less" title="Small habits, real money" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>Withdraw once, not twice: KES 3,000 in one go costs {kes(charge(t, "withdraw", 3000)!)}; two withdrawals of KES 1,500 cost {kes(2 * charge(t, "withdraw", 1500)!)}.</li>
            <li>Every send of KES 100 or less is free.</li>
            <li>Fuliza is charged every day the balance is unpaid: clearing it a day sooner saves that day’s fee.</li>
          </ul>
        </div>
        <div>
          <SectionTitle kicker="Also see" title="More on what money costs" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>
              <Link href="/rates/kenya/mobile-loans" className="font-semibold text-forest underline underline-offset-2">
                What mobile loans really cost
              </Link>
            </li>
            <li>
              <Link href="/rates/kenya/loan-apps" className="font-semibold text-forest underline underline-offset-2">
                Is this loan app licensed?
              </Link>
            </li>
            <li>
              <Link href="/markets/kenya-tbills/calculator" className="font-semibold text-forest underline underline-offset-2">
                Treasury bill calculator
              </Link>
            </li>
          </ul>
        </div>
      </section>

      <FollowUp heading="Get the Morning: what money costs, every weekday" />
      <p className="mt-6 text-sm text-ink-soft">
        <em>Information, not advice.</em> Afronomics is not linked to Safaricom.
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
