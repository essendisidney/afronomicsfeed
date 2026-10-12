import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Questions } from "@/components/seo/Questions";
import { FollowUp } from "@/components/ui/FollowUp";
import { ShareRow } from "@/components/ui/ShareRow";
import { loadFxQuote } from "@/lib/data/fx";
import { loadHealth } from "@/lib/data/health";
import { fundLeague, loadKenyaRates, WHT_INTEREST } from "@/lib/data/kenya-rates";
import { loadTbills } from "@/lib/data/kenya-tbills";
import { corridorsTo, countryName, loadRemittances, periodLabel } from "@/lib/data/remittances";
import { site } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Diaspora Desk — sending money home to Kenya and earning on it",
  description:
    "For Kenyans abroad: the cheapest way to send money home from each country, today's shilling rates, and what money earns at home after tax in Treasury bills, money market funds and savings accounts. From the World Bank, the CBK and the fund managers.",
  alternates: { canonical: `${site.url}/diaspora` },
};

const usd200 = (pct: number) => `$${((200 * pct) / 100).toFixed(2)}`;
const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-US")}`;
const pct = (n: number) => `${n.toFixed(2)}%`;

export default async function DiasporaPage() {
  const corridors = corridorsTo("kenya").filter((c) => c.services >= 5);
  const period = loadRemittances()?.period;
  const fx = await loadFxQuote();
  const perKes = (code: string) => (fx?.rates[code] && fx.rates.KES ? fx.rates.KES / fx.rates[code] : null);
  const currencies = (["USD", "GBP", "EUR"] as const).map((c) => ({ code: c, kes: perKes(c) })).filter((x) => x.kes);

  // What KES 100,000 earns at home in a year, after the 15% withholding tax.
  const bill = loadTbills().rows.find((r) => r.tenor === 364);
  const doubted = new Set((loadHealth()?.items ?? []).filter((x) => x.area === "Money market funds" && (x.status === "late" || x.status === "failed")).map((x) => x.name));
  const fund = fundLeague().find((f) => !doubted.has(f.name));
  const savings = loadKenyaRates().bank_rates?.rows?.[0];
  const earn = [
    bill ? { what: "364-day Treasury bill", rate: bill.weighted_avg_rate, note: `CBK auction of ${bill.value_date}`, href: "/markets/kenya-tbills/auction" } : null,
    fund ? { what: `Highest-yielding money market fund we can confirm (${fund.name})`, rate: fund.gross, note: `manager’s published yield, read ${fund.readOn}`, href: "/rates/kenya/money-market-funds" } : null,
    savings ? { what: "Bank savings account, industry average", rate: savings.savings, note: `CBK, ${savings.month}`, href: "/rates/kenya" } : null,
  ].filter((x): x is NonNullable<typeof x> => x != null);
  const usd = perKes("USD");

  const items = [
    {
      q: "What is the cheapest way to send money to Kenya?",
      a: corridors.length
        ? `It depends on where you send from. In the World Bank's latest survey, the cheapest service surveyed cost ${corridors
            .slice(0, 3)
            .map((c) => `${usd200(c.cheapest.cost_pct)} to send $200 from ${countryName(c.src_name)} (${c.cheapest.firm})`)
            .join(", ")}. Check the provider's live quote, the amount that arrives in shillings, before you send.`
        : "Compare the total cost, fee plus exchange-rate margin, on each provider's own quote screen.",
    },
    {
      q: "Can I buy Kenyan Treasury bills from abroad?",
      a: "Bids go through the CBK's DhowCSD platform, which needs a CSD account and a Kenyan bank account to pay from. The CBK's DhowCSD portal sets out who can open one and what it needs. Interest is taxed at 15% withholding.",
    },
  ];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Diaspora Desk" }]}
      kicker="Diaspora Desk · Kenya"
      title="Money home, and what it earns there"
      lede={
        <p>
          For Kenyans abroad: the cheapest way to send money home from where you live, today’s shilling, and what the money earns in Kenya after tax. Every
          figure from the World Bank, the Central Bank of Kenya or the fund managers themselves.
        </p>
      }
    >
      {currencies.length ? (
        <section className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-rule bg-rule">
          {currencies.map((c) => (
            <div key={c.code} className="bg-surface px-4 py-4">
              <p className="font-serif text-2xl text-ink">{kes(c.kes!)}</p>
              <p className="mt-1 text-[12px] text-muted">per 1 {c.code} today</p>
            </div>
          ))}
        </section>
      ) : null}
      {fx ? <p className="mt-2 text-[12px] text-muted">Mid-market reference rates ({fx.sourceName}, {fx.updated.slice(5, 16)}). Providers pay you less than this; that gap is part of the cost below.</p> : null}

      <section className="mt-12">
        <SectionTitle kicker="1 · Send" title="Cheapest way to send $200 home, by where you live" note={period ? `World Bank survey, ${periodLabel(period)}: fee plus exchange-rate margin.` : undefined} />
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Sending from</th>
                <th className="text-right">Cheapest surveyed</th>
                <th className="text-right">Average service</th>
              </tr>
            </thead>
            <tbody>
              {corridors.map((c) => (
                <tr key={c.src}>
                  <td className="font-medium text-ink">{countryName(c.src_name)}</td>
                  <td className="text-right">
                    <span className="font-semibold">{usd200(c.cheapest.cost_pct)}</span>
                    <span className="block text-[11px] text-muted">{c.cheapest.firm}</span>
                  </td>
                  <td className="text-right">{usd200(c.avg_cost_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm">
          <Link href="/send-money/kenya" className="font-semibold text-forest underline underline-offset-2">
            Every service ranked by cost, with a link to send →
          </Link>
        </p>
      </section>

      <section className="mt-12">
        <SectionTitle kicker="2 · Earn" title="What KES 100,000 earns at home in a year, after tax" note={`After Kenya’s ${Math.round(WHT_INTEREST * 100)}% withholding tax on interest. Past yields do not promise future ones.`} />
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Where</th>
                <th className="text-right">Rate</th>
                <th className="text-right">KES 100,000 earns</th>
                {usd ? <th className="text-right">In dollars, today</th> : null}
              </tr>
            </thead>
            <tbody>
              {earn.map((e) => {
                const net = 100000 * (e.rate / 100) * (1 - WHT_INTEREST);
                return (
                  <tr key={e.what}>
                    <td>
                      <Link href={e.href} className="font-medium text-ink hover:text-forest">
                        {e.what}
                      </Link>
                      <span className="block text-[11px] text-muted">{e.note}</span>
                    </td>
                    <td className="text-right">{pct(e.rate)}</td>
                    <td className="text-right font-semibold">{kes(net)}</td>
                    {usd ? <td className="text-right">${(net / usd).toFixed(0)}</td> : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[12px] text-muted">
          A shilling return is earned in shillings: if the shilling weakens against your currency, part of it is lost when you change it back.
        </p>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="3 · Invest from abroad" title="How it works" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>
              <strong className="text-ink">Treasury bills and bonds:</strong> bids go through the CBK’s DhowCSD platform, which needs a CSD account and a Kenyan bank
              account to pay from; the CBK’s portal sets out who can open one. Minimum KES 50,000 non-competitive.{" "}
              <Link href="/markets/kenya-tbills/auction" className="underline underline-offset-2">
                Likely rates before each auction
              </Link>
              .
            </li>
            <li>
              <strong className="text-ink">Money market funds:</strong> unit trusts approved by the Capital Markets Authority; many managers open accounts online.{" "}
              <Link href="/rates/kenya/money-market-funds" className="underline underline-offset-2">
                Every fund we can read, after tax
              </Link>
              .
            </li>
            <li>
              <strong className="text-ink">Tax:</strong> interest on both is taxed at 15% withholding, deducted before you are paid.
            </li>
          </ul>
        </div>
        <div>
          <SectionTitle kicker="4 · Check first" title="Before you send money to any investment" />
          <ul className="mt-4 space-y-3 text-[14px] leading-6 text-ink-soft">
            <li>Pay a fund or broker only into an account in the firm’s own name, never a person’s, and check the firm on the Capital Markets Authority’s list of licensees.</li>
            <li>For land, get an official title search from the Ministry of Lands (online on Ardhisasa where the registry is on it) before paying anything, done by someone you trust who is not the seller’s agent.</li>
            <li>
              Borrowing on behalf of family?{" "}
              <Link href="/rates/kenya/loan-apps" className="underline underline-offset-2">
                Check the loan app is licensed and what it really costs
              </Link>
              .
            </li>
            <li>A return far above the Treasury bill usually means far more risk, or no return at all.</li>
          </ul>
        </div>
      </section>

      <div className="mt-10">
        <ShareRow text="For Kenyans abroad: the cheapest way to send money home, and what it earns there after tax:" path="/diaspora" />
      </div>
      <FollowUp heading="Get the shilling, the bill rate and the best fund every week" />
      <p className="mt-6 text-sm text-ink-soft">
        Sending to Nigeria, Ghana or elsewhere?{" "}
        <Link href="/send-money" className="underline underline-offset-2">
          Every African country
        </Link>
        . <em>Information, not advice.</em>
      </p>
      <Questions items={items} />
    </PageShell>
  );
}
