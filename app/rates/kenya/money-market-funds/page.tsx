import type { Metadata } from "next";
import Link from "next/link";
import { LineChart } from "@/components/data/LineChart";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { CiteBlock } from "@/components/ui/CiteBlock";
import { fundLeague, loadFundHistory, rateOptions } from "@/lib/data/kenya-rates";
import { site } from "@/lib/site";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Kenya money market fund yields today — league table after tax",
  description:
    "Kenya money market funds ranked by what a saver keeps after 15% withholding tax, each yield read from the fund manager’s own website, against the 364-day Treasury bill and the bank savings average. Daily history, free CSV.",
  alternates: { canonical: `${site.url}/rates/kenya/money-market-funds` },
};

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const when = (s: string) => dateFmt.format(new Date(s));
const kes = (n: number) => `KES ${Math.round(n).toLocaleString("en-GB")}`;
const STALE_DAYS = 7;

const series = ["--series-1", "--series-2", "--series-3", "--series-4", "--series-5"];

export default function MoneyMarketFundsPage() {
  const funds = fundLeague();
  const { options, unread } = rateOptions();
  const bill = options.find((o) => o.name === "364-day Treasury bill");
  const savings = options.find((o) => o.name.startsWith("Bank savings"));
  const days = [...new Set(loadFundHistory().map((r) => r.date))].sort();
  const best = funds[0];
  const latestDay = days.at(-1);
  const stale = (f: (typeof funds)[number]) =>
    latestDay ? (new Date(latestDay).getTime() - new Date(f.unchangedSince).getTime()) / 86_400_000 >= STALE_DAYS : false;
  const chartRows = days.map((date) => ({
    date,
    values: Object.fromEntries(funds.map((f) => [f.name, f.points.find((p) => p.date === date)?.value ?? null])),
  }));

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/rates/kenya", label: "Kenya rates" }, { label: "Money market funds" }]}
      kicker="Afronomics dataset · Kenya"
      title="Money market fund yields, ranked"
      lede={
        <p>
          Kenya’s money market funds side by side, ranked by what a saver keeps after withholding tax. Every yield is read from the fund manager’s own
          website, never from adverts or third-party lists, and logged daily from {days[0] ? when(days[0]) : "the first read"}, so the history builds
          here and nowhere else.
        </p>
      }
      aside={
        best ? (
          <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
            <p className="text-[13px] font-medium text-muted">Highest published yield after tax</p>
            <p className="mt-1 font-serif text-3xl text-ink">{best.net.toFixed(2)}%</p>
            <p className="mt-1 text-[14px] text-ink">{best.name}</p>
            <p className="mt-1 text-[12px] text-muted">
              {best.gross.toFixed(2)}% as published · read {when(best.readOn)}
            </p>
          </div>
        ) : null
      }
    >
      {funds.length === 0 ? (
        <p className="text-sm text-muted">No fund yields have been read yet.</p>
      ) : (
        <section>
          <SectionTitle
            kicker="League table"
            title="What KES 100,000 earns in a year"
            note="Effective annual yield as the manager publishes it, before fees; after-tax applies Kenya’s 15% withholding tax on interest for residents."
          />
          <div className="mt-4 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Fund</th>
                  <th className="text-right">Published yield</th>
                  <th className="text-right">After tax</th>
                  <th className="text-right">KES 100,000, one year</th>
                  <th>Yield last changed</th>
                </tr>
              </thead>
              <tbody>
                {funds.map((f, i) => (
                  <tr key={f.name}>
                    <td className="text-xs text-muted">{i + 1}</td>
                    <td>
                      <a href={f.source} target="_blank" rel="noopener noreferrer" className="font-medium hover:text-forest">
                        {f.name}
                      </a>
                      <span className="block text-[11px] text-muted">{f.manager}</span>
                    </td>
                    <td className="text-right">{f.gross.toFixed(2)}%</td>
                    <td className="text-right font-semibold">{f.net.toFixed(2)}%</td>
                    <td className="text-right">{kes(1000 * f.net)}</td>
                    <td className="whitespace-nowrap text-xs">
                      {f.unchangedSince === f.firstRead ? `not since first read, ${when(f.firstRead)}` : when(f.unchangedSince)}
                      {stale(f) ? <span className="block text-[11px] text-danger">Unchanged for a week or more: the manager’s page may not be current</span> : null}
                    </td>
                  </tr>
                ))}
                {bill ? (
                  <tr className="bg-paper-2">
                    <td />
                    <td>
                      <Link href="/markets/kenya-tbills" className="font-medium hover:text-forest">
                        Benchmark: 364-day Treasury bill
                      </Link>
                      <span className="block text-[11px] text-muted">Central Bank of Kenya, auction of {when(bill.asOf)}</span>
                    </td>
                    <td className="text-right">{bill.gross.toFixed(2)}%</td>
                    <td className="text-right font-semibold">{bill.net.toFixed(2)}%</td>
                    <td className="text-right">{kes(1000 * bill.net)}</td>
                    <td className="text-xs text-muted">money tied up a year</td>
                  </tr>
                ) : null}
                {savings ? (
                  <tr className="bg-paper-2">
                    <td />
                    <td>
                      <span className="font-medium">Benchmark: bank savings account, industry average</span>
                      <span className="block text-[11px] text-muted">Central Bank of Kenya, {savings.asOf}</span>
                    </td>
                    <td className="text-right">{savings.gross.toFixed(2)}%</td>
                    <td className="text-right font-semibold">{savings.net.toFixed(2)}%</td>
                    <td className="text-right">{kes(1000 * savings.net)}</td>
                    <td />
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-3xl text-xs leading-5 text-muted">
            A fund’s published yield is its recent return annualised; it is not a promise of what it will pay, and fees are taken before or after it
            depending on the fund. A yield far above the Treasury bill usually means the fund holds longer or riskier paper, or that the published
            figure is old. Check the fund’s own documents before you invest. This is information, not advice.
          </p>
          {unread.length ? (
            <p className="mt-2 max-w-3xl text-xs leading-5 text-muted">
              Not read on the last run: {unread.map((u) => u.name).join(", ")}.
            </p>
          ) : null}
          <p className="mt-2 max-w-3xl text-xs leading-5 text-muted">
            Manage a Kenyan money market fund and publish your yield as text on your site? Tell us at{" "}
            <a href={`mailto:${site.contactEmail}`} className="underline underline-offset-2">
              {site.contactEmail}
            </a>{" "}
            and it joins the table.
          </p>
        </section>
      )}

      {days.length >= 7 ? (
        <section className="mt-14">
          <SectionTitle kicker="History" title="Published yields, day by day" note="Each point is the yield on the manager’s site when Afronomics read it that day." />
          <div className="mt-4">
            <LineChart
              rows={chartRows}
              series={funds.slice(0, series.length).map((f, i) => ({ key: f.name, label: f.name, color: `var(${series[i]})` }))}
              label="Kenya money market fund published yields over time"
            />
          </div>
        </section>
      ) : null}

      <p className="mt-10 text-sm text-ink-soft">
        Every way to hold shillings, bills and bonds included, is on{" "}
        <Link href="/rates/kenya" className="font-medium text-forest underline underline-offset-2">
          where your shilling earns most
        </Link>
        . Offered a rate? Use{" "}
        <Link href="/rates/kenya/check" className="font-medium text-forest underline underline-offset-2">
          is my rate fair
        </Link>
        .
      </p>
      <CiteBlock
        title="Kenya money market fund yields"
        path="/rates/kenya/money-market-funds"
        publisher="fund managers’ published yields"
        csv="/api/data/kenya-mmf"
      />
      <NewsletterBand />
    </PageShell>
  );
}
