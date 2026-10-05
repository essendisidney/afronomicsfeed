import type { Metadata } from "next";
import Link from "next/link";
import { LineChart } from "@/components/data/LineChart";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { bankRateHistory, fairBench, rateOptions } from "@/lib/data/kenya-rates";
import { FairRate } from "@/components/data/FairRate";
import { site } from "@/lib/site";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Where your shilling earns most — Kenya T-bills, money market funds and bank rates compared",
  description:
    "Every place to put Kenya shillings on one scale, after tax: Treasury bills and bonds, money market fund yields from the managers themselves, and the Central Bank of Kenya’s bank deposit and savings averages. Updated as each publishes.",
  alternates: { canonical: `${site.url}/rates/kenya` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthFmt = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });
const when = (s: string) => (s.length === 7 ? monthFmt.format(new Date(`${s}-01`)) : dateFmt.format(new Date(s)));

export default function KenyaRatesPage() {
  const { options, unread, updatedAt } = rateOptions();
  const bench = fairBench();
  const best = options[0];
  const bill91 = options.find((o) => o.name === "91-day Treasury bill");
  const savings = options.find((o) => o.name.startsWith("Bank savings"));
  const history = bankRateHistory(72).map((r) => ({ date: `${r.month}-01`, values: { deposit: r.deposit, savings: r.savings, lending: r.lending } }));
  const max = Math.max(...options.map((o) => o.gross), 1);
  const groups: RateOptionGroup[] = ["Government", "Money market funds", "Banks"];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/markets", label: "Markets" }, { label: "Kenya rates" }]}
      kicker="Afronomics comparison · Kenya"
      title="Where your shilling earns most"
      lede={
        <p>
          Every place to put Kenya shillings, on one scale, after withholding tax. Government paper from the Central Bank’s auction results, fund yields
          from each manager’s own published figure, and the Central Bank’s averages for what banks pay.
          {best && savings ? ` Right now the gap between the best option and a bank savings account is ${(best.net - savings.net).toFixed(1)} points a year.` : ""}
        </p>
      }
      aside={
        best ? (
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-medium text-muted">Highest after tax today</p>
            <p className="mt-1 font-serif text-3xl text-ink">{best.net.toFixed(2)}%</p>
            <p className="mt-1 text-[14px] text-ink">{best.name}</p>
            <p className="mt-1 text-[12px] text-muted">
              {best.gross.toFixed(2)}% before {Math.round(best.tax * 100)}% withholding tax · {when(best.asOf)}
            </p>
          </div>
        ) : null
      }
    >
      {bench ? (
        <div className="mb-10">
          <FairRate bench={bench} />
        </div>
      ) : null}
      <section>
        <SectionTitle kicker="Compared" title="Annual return, before and after tax" note="Sorted by what you keep. Bars show the published rate; the darker part is what remains after withholding tax." />
        <div className="mt-4 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Option</th>
                <th className="w-[28%]"></th>
                <th className="text-right">Published</th>
                <th className="text-right">After tax</th>
                <th>Money tied up</th>
                <th>As of</th>
              </tr>
            </thead>
            <tbody>
              {groups.flatMap((group) => {
                const rows = options.filter((o) => o.group === group);
                if (!rows.length) return [];
                return [
                  <tr key={group}>
                    <th colSpan={6} className="bg-paper-2 pt-4 text-[13px] font-semibold text-ink">
                      {group}
                    </th>
                  </tr>,
                  ...rows.map((o) => (
                    <tr key={o.name}>
                      <td>
                        <a href={o.source} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-forest">
                          {o.name}
                        </a>
                        <span className="block text-[11px] text-muted">{o.publisher}</span>
                      </td>
                      <td>
                        <div className="relative h-3 w-full overflow-hidden rounded-full bg-paper-3">
                          <div className="absolute inset-y-0 left-0 rounded-full bg-accent/35" style={{ width: `${(o.gross / max) * 100}%` }} />
                          <div className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${(o.net / max) * 100}%` }} />
                        </div>
                      </td>
                      <td className="text-right">{o.gross.toFixed(2)}%</td>
                      <td className="text-right font-semibold">{o.net.toFixed(2)}%</td>
                      <td className="text-xs text-ink-soft">{o.lockIn}</td>
                      <td className="whitespace-nowrap text-xs">{when(o.asOf)}</td>
                    </tr>
                  )),
                ];
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
          After-tax figures apply Kenya’s withholding tax on interest for residents: 15% on bills, deposits and fund returns, 10% on bonds of ten years or
          more, none on infrastructure bonds. Bonds shown are the latest auction nearest each point on the curve; every issue is on the bond page. Fund yields are the managers’ effective annual yields before fees shown as
          published; past yield is not a promise of future yield. Bank figures are industry averages from the Central Bank; individual banks pay more or less.
          This is information, not advice.
        </p>
        {unread.length ? (
          <p className="mt-2 max-w-3xl text-xs leading-5 text-muted">
            Funds not yet read from their managers’ sites: {unread.map((u) => u.name).join(", ")}. More are added as a text source for each is found.
          </p>
        ) : null}
        <p className="mt-3 text-sm">
          <Link href="/rates/kenya/money-market-funds" className="font-medium text-forest underline underline-offset-2">
            Money market funds ranked, with daily yield history →
          </Link>
        </p>
      </section>

      {bill91 && savings ? (
        <section className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule sm:grid-cols-3">
          {[
            { k: "KES 100,000 in the 91-day bill, one year, after tax", v: `KES ${(100000 * bill91.net / 100).toFixed(0)}` },
            { k: "The same in a bank savings account", v: `KES ${(100000 * savings.net / 100).toFixed(0)}` },
            { k: "Difference over a year", v: `KES ${(100000 * (bill91.net - savings.net) / 100).toFixed(0)}` },
          ].map((item) => (
            <div key={item.k} className="bg-surface px-5 py-5">
              <p className="font-serif text-3xl text-ink">{item.v}</p>
              <p className="mt-1 text-[13px] text-ink-soft">{item.k}</p>
            </div>
          ))}
        </section>
      ) : null}

      {history.length > 12 ? (
        <section className="mt-14">
          <SectionTitle kicker="Banks" title="What banks pay and charge, last six years" note="Weighted averages across all commercial banks, monthly, from the Central Bank of Kenya." />
          <div className="mt-4">
            <LineChart
              rows={history}
              series={[
                { key: "lending", label: "Lending", color: "var(--series-2)" },
                { key: "deposit", label: "Deposit", color: "var(--series-1)" },
                { key: "savings", label: "Savings", color: "var(--series-3)" },
              ]}
              label="Kenya commercial bank weighted average rates over time"
            />
          </div>
          <SourceLine name="Central Bank of Kenya" href="https://www.centralbank.go.ke/commercial-banks-weighted-average-rates/" detail={`monthly weighted averages${updatedAt ? ` · read ${updatedAt.slice(0, 10)}` : ""}`} />
        </section>
      ) : null}

      <p className="mt-10 text-sm text-ink-soft">
        Compare government borrowing costs across Africa on the{" "}
        <Link href="/markets/tbills" className="font-medium text-forest underline underline-offset-2">
          T-bill monitor
        </Link>
        .
      </p>
      <CiteBlock title="Where your shilling earns most: Kenya rates compared" path="/rates/kenya" publisher="the Central Bank of Kenya and fund managers’ published yields" />
      <NewsletterBand />
    </PageShell>
  );
}

type RateOptionGroup = "Government" | "Money market funds" | "Banks";
