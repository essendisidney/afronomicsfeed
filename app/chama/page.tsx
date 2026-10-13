import type { Metadata } from "next";
import Link from "next/link";
import { ChamaPlanner, type ChamaOption } from "@/components/data/ChamaPlanner";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { FollowUp } from "@/components/ui/FollowUp";
import { loadHealth } from "@/lib/data/health";
import { fundLeague, loadKenyaRates } from "@/lib/data/kenya-rates";
import { loadTbills, type Tenor } from "@/lib/data/kenya-tbills";
import { site } from "@/lib/site";
import { fitDescription, fitTitle } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: fitTitle("Chama Money Hub — where should our chama put its money?"),
  description: fitDescription("For chamas and investment groups in Kenya: what your group's money earns after tax in a money market fund, Treasury bills, a bank deposit or a savings account, for when you need it. Today's rates, from the CBK and the fund managers; share it to the group on WhatsApp."),
  alternates: { canonical: `${site.url}/chama` },
};

export default function ChamaPage() {
  const bills = loadTbills().rows;
  const latest = (t: Tenor) => bills.find((r) => r.tenor === t);
  const doubted = new Set((loadHealth()?.items ?? []).filter((x) => x.area === "Money market funds" && (x.status === "late" || x.status === "failed")).map((x) => x.name));
  const fund = fundLeague().find((f) => !doubted.has(f.name));
  const bank = loadKenyaRates().bank_rates?.rows?.[0];

  const options: ChamaOption[] = [
    ...(fund
      ? [{ id: "mmf", label: `Money market fund (${fund.name})`, rate: fund.gross, source: `highest yield we can confirm, read ${fund.readOn}`, access: "withdraw in a few days, yield changes daily", href: "/rates/kenya/money-market-funds" }]
      : []),
    ...([91, 182, 364] as Tenor[]).flatMap((t) => {
      const r = latest(t);
      return r
        ? [{ id: `bill${t}`, label: `${t}-day Treasury bill`, rate: r.weighted_avg_rate, source: `CBK auction of ${r.value_date}`, access: `locked ${t} days`, href: "/markets/kenya-tbills/auction", tenorDays: t, minAmount: 50000 }]
        : [];
    }),
    ...(bank
      ? [
          { id: "deposit", label: "Bank deposit, industry average", rate: bank.deposit, source: `CBK, ${bank.month}`, access: "fixed term, ask the bank", href: "/rates/kenya" },
          { id: "savings", label: "Bank savings account, industry average", rate: bank.savings, source: `CBK, ${bank.month}`, access: "any time", href: "/rates/kenya" },
        ]
      : []),
  ];
  const asOf = latest(364)?.value_date ?? "";

  const items = [
    {
      q: "Where should a chama invest its money in Kenya?",
      a: "It depends on when the group needs the money. Money needed soon is usually kept where it can be withdrawn in days, such as a money market fund; money not needed for a year can go into a Treasury bill of that length. This page compares what each earns after tax for your amount and timing, at today's rates. Information, not advice.",
    },
    {
      q: "Can a chama buy Treasury bills?",
      a: "Bills are bought through the CBK's DhowCSD platform, which needs a CSD account in the group's name and a bank account to pay from; the CBK's DhowCSD portal sets out what a group needs to open one. The minimum non-competitive bid is KES 50,000.",
    },
  ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "Chama Money Hub" }]}
      kicker="Chama Money Hub · Kenya"
      title="Where should our chama put its money?"
      lede={
        <p>
          Put in what the group has and when you will need it. See what every option earns after tax, at today’s rates from the Central Bank of Kenya and the fund
          managers, then send it to the group on WhatsApp or print it for the meeting.
        </p>
      }
    >
      <ChamaPlanner options={options} asOf={asOf} />

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="For the treasurer" title="Before the group decides" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>Keep money the group may need soon where it can be withdrawn quickly; lock away only what can wait.</li>
            <li>Hold the account in the group’s registered name, with at least two signatories, never in one member’s name.</li>
            <li>A fund’s yield changes daily and is not promised; a Treasury bill’s rate is fixed once bought.</li>
            <li>Get statements sent to more than one official so every member can see the balance.</li>
          </ul>
        </div>
        <div>
          <SectionTitle kicker="Also compare" title="Other places groups save" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>
              <Link href="/rates/kenya/saccos" className="font-semibold text-forest underline underline-offset-2">
                SACCO dividends and interest on deposits
              </Link>
              , as each SACCO declares them.
            </li>
            <li>
              <Link href="/markets/kenya-tbills/auction" className="font-semibold text-forest underline underline-offset-2">
                Next Treasury bill auction
              </Link>
              : likely rates, and did your bid win.
            </li>
            <li>
              <Link href="/rates/kenya/money-market-funds" className="font-semibold text-forest underline underline-offset-2">
                Every money market fund we can read
              </Link>
              , after tax.
            </li>
          </ul>
        </div>
      </section>

      <FollowUp heading="Get the rates for your next chama meeting" />
      <p className="mt-6 text-sm text-ink-soft">
        Rates before tax as published; earnings after Kenya’s 15% withholding tax on interest. <em>Information, not advice.</em>
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
