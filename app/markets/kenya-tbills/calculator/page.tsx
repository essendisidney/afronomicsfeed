import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { TbillCalculator, type CalcBill, type CalcCompare } from "@/components/data/TbillCalculator";
import { Questions } from "@/components/seo/Questions";
import { FollowUp } from "@/components/ui/FollowUp";
import { nextAuction } from "@/lib/data/auction-intel";
import { loadHealth } from "@/lib/data/health";
import { fundLeague, loadKenyaRates } from "@/lib/data/kenya-rates";
import { latestByTenor, loadTbills, tenors } from "@/lib/data/kenya-tbills";
import { site } from "@/lib/site";
import { fitDescription, fitTitle } from "@/lib/seo";
import { quoteBill } from "@/lib/tbill-calc";

export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const latest = latestByTenor(loadTbills().rows).get(364)?.latest;
  const q = latest ? quoteBill(latest.weighted_avg_rate, 364, 100_000, "pay", latest.price_per_100) : null;
  const description = `What a Kenya Treasury bill costs, what you get back and what you keep after 15% tax, at the latest CBK auction${
    q ? `: KES 100,000 in the 364-day bill keeps about KES ${Math.round(q.net).toLocaleString("en-US")}` : ""
  }. Compare with a money market fund and a bank savings account. Free, no sign-up.`;
  return {
    title: fitTitle("Treasury bill calculator Kenya: what you pay, get back and keep after tax"),
    description: fitDescription(description),
    alternates: { canonical: `${site.url}/markets/kenya-tbills/calculator` },
  };
}

export default function TbillCalculatorPage() {
  const file = loadTbills();
  const latest = latestByTenor(file.rows);
  const bills: CalcBill[] = tenors.flatMap((t) => {
    const r = latest.get(t)?.latest;
    return r ? [{ tenor: t, rate: r.weighted_avg_rate, price: r.price_per_100, auctionDate: r.value_date, source: r.source }] : [];
  });
  const next = nextAuction(file.rows);
  const doubted = new Set((loadHealth()?.items ?? []).filter((x) => x.area === "Money market funds" && (x.status === "late" || x.status === "failed")).map((x) => x.name));
  const fund = fundLeague().find((f) => !doubted.has(f.name));
  const bank = loadKenyaRates().bank_rates?.rows?.[0];
  const compare: CalcCompare[] = [
    ...(fund ? [{ label: `Money market fund (${fund.name})`, rate: fund.gross, source: `read ${fund.readOn}`, href: "/rates/kenya/money-market-funds" }] : []),
    ...(bank ? [{ label: "Bank savings account, average", rate: bank.savings, source: `CBK, ${bank.month}`, href: "/rates/kenya" }] : []),
  ];
  const b364 = bills.find((b) => b.tenor === 364);
  const example = b364 ? quoteBill(b364.rate, 364, 100_000, "pay", b364.price) : null;

  const items = [
    {
      q: "How much will I earn from a Treasury bill in Kenya?",
      a: example
        ? `At the CBK auction of ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${b364!.auctionDate}T00:00:00Z`))}, KES 100,000 put into the 364-day bill buys about KES ${Math.round(example.face).toLocaleString("en-US")} of face value. After a year you get that back: KES ${Math.round(example.interest).toLocaleString("en-US")} of interest, of which you keep about KES ${Math.round(example.net).toLocaleString("en-US")} after 15% withholding tax. Rates change at every weekly auction.`
        : "Enter an amount above to see what each bill pays at the latest auction.",
    },
    {
      q: "How is a Treasury bill taxed in Kenya?",
      a: "The interest, the gap between what you pay and the face value you get back, is subject to 15% withholding tax, deducted by the CBK. The calculator shows the tax and what you keep.",
    },
    {
      q: "What is the minimum for a Treasury bill?",
      a: "KES 50,000 of face value per bill, bought through the CBK's DhowCSD platform or app with a bank account. Bids close at 2 p.m. on Thursday for bills issued the following Monday.",
    },
    {
      q: "Which is better, a Treasury bill or a money market fund?",
      a: "A bill's rate is fixed once you buy it but the money is locked until it matures; a money market fund can be withdrawn in days but its yield changes daily. The calculator puts both side by side for your amount. Information, not advice.",
    },
  ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { href: "/markets/kenya-tbills", label: "Kenya T-bills" }, { label: "Calculator" }]}
      kicker="Treasury bill calculator · Kenya"
      title="What will my Treasury bill pay?"
      lede={
        <p>
          Put in the money you have. See what each bill costs, what you get back and when, the 15% tax, and what you keep, at the rates from the Central Bank of
          Kenya’s latest auction. Then compare it with a money market fund and a savings account.
        </p>
      }
    >
      {bills.length ? (
        <TbillCalculator bills={bills} nextValueDate={next?.valueDate ?? null} bidsClose={next?.bidsClose ?? null} compare={compare} />
      ) : (
        <p className="text-ink-soft">The latest auction results are not available right now.</p>
      )}

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="Before you buy" title="Good to know" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>Your money is locked until the bill matures. Keep money you may need soon somewhere you can withdraw it.</li>
            <li>A non-competitive bid gets the auction’s average rate; a competitive bid names your own rate and may be refused.</li>
            <li>Bills are bought through the CBK’s DhowCSD, on the web or the app, with a bank account in your name.</li>
          </ul>
        </div>
        <div>
          <SectionTitle kicker="Also see" title="More on Kenya’s bills" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>
              <Link href="/markets/kenya-tbills/auction" className="font-semibold text-forest underline underline-offset-2">
                Next auction: likely rates, and did my bid win?
              </Link>
            </li>
            <li>
              <Link href="/markets/kenya-tbills" className="font-semibold text-forest underline underline-offset-2">
                Every auction since 2011
              </Link>
              , with the CBK’s own notices.
            </li>
            <li>
              <Link href="/chama" className="font-semibold text-forest underline underline-offset-2">
                Chama Money Hub
              </Link>
              : where a group’s money earns most.
            </li>
          </ul>
        </div>
      </section>

      <FollowUp heading="Get Thursday’s result the minute it’s out" />
      <p className="mt-6 text-sm text-ink-soft">
        Rates are the weighted averages of accepted bids at the CBK’s latest auction, with its published price per KES 100.{" "}
        <a href={file.sourcePage} className="underline underline-offset-2">
          CBK results
        </a>
        . <em>Information, not advice.</em>
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
