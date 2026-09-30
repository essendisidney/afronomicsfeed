import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { PageShell } from "@/components/data/PageShell";
import { ProjectTable } from "@/components/data/ProjectTable";
import { WireList } from "@/components/data/WireList";
import { SectionTitle, SourceLine } from "@/components/data/parts";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { getArticlesByCategory, toIndexItem } from "@/lib/content";
import { renderTime } from "@/lib/data/fetcher";
import { pairHref } from "@/lib/data/fx";
import { projectsSource } from "@/lib/data/projects";
import { bpsText, buildWeeklyEdition, fxText, headlines, pctText } from "@/lib/editions/weekly";
import { site } from "@/lib/site";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "The Afronomics Weekly — Africa’s week in numbers",
  description:
    "Every Monday: Kenya T-bill and bond auction results, African currency moves, World Bank Board dates and the week’s business headlines from across 54 economies — each figure sourced.",
  alternates: { canonical: `${site.url}/weekly` },
};

const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });

export default async function WeeklyPage() {
  const now = renderTime();
  const edition = await buildWeeklyEdition(now);
  const lines = headlines(edition);
  const archive = getArticlesByCategory("weekly").map(toIndexItem);
  const fxMoves = edition.fx?.moves.slice(0, 10) ?? [];

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { label: "Weekly" }]}
      kicker={`The Afronomics Weekly · week of ${longDate.format(new Date(edition.weekOf))}`}
      title="Africa’s week in numbers"
      lede={
        lines.length ? (
          <ul className="space-y-2">
            {lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : (
          <p>Rates, currencies, development finance and the headlines that moved African markets this week.</p>
        )
      }
      aside={
        <div className="border border-rule bg-paper-2 px-4 py-4 text-sm text-ink-soft">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">How this edition is made</p>
          <p className="mt-2 leading-6">
            Assembled from the datasets on this site as they update — central-bank auction notices, the archived FX reference, the World Bank
            project register and publisher feeds. Every figure links to its source.
          </p>
          <p className="mt-2 font-mono text-[10px] text-muted">Generated {new Date(edition.generatedAt).toUTCString().replace(" GMT", " UTC")}</p>
        </div>
      }
    >
      <div className="grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <SectionTitle kicker="Rates" title="Kenya government auctions" href="/markets/kenya-tbills" hrefLabel="Full history →" />
          {edition.bills.length ? (
            <table className="data-table mt-2">
              <thead>
                <tr>
                  <th>Treasury bill</th>
                  <th>Auction</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Change</th>
                  <th className="text-right">Subscription</th>
                </tr>
              </thead>
              <tbody>
                {edition.bills.map((bill) => (
                  <tr key={bill.tenor}>
                    <td>
                      <a href={bill.source} target="_blank" rel="noopener noreferrer" className="hover:text-forest">
                        {bill.label}
                      </a>
                    </td>
                    <td className="font-mono text-xs">{shortDate.format(new Date(bill.date))}</td>
                    <td className="text-right font-mono text-sm">{bill.rate.toFixed(3)}%</td>
                    <td className="text-right font-mono text-xs">{bpsText(bill.changeBps)}</td>
                    <td className="text-right font-mono text-xs">{bill.subscription == null ? "—" : `${bill.subscription.toFixed(0)}%`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {edition.bonds.length ? (
            <table className="data-table mt-6">
              <thead>
                <tr>
                  <th>Treasury bond</th>
                  <th>Auction</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Accepted</th>
                  <th className="text-right">Bid-to-cover</th>
                </tr>
              </thead>
              <tbody>
                {edition.bonds.map((bond) => (
                  <tr key={`${bond.issue}-${bond.value_date}-${bond.kind}`}>
                    <td>
                      <a href={bond.source} target="_blank" rel="noopener noreferrer" className="font-mono text-xs hover:text-forest">
                        {bond.issue}
                      </a>
                      <span className="ml-2 text-[11px] text-muted">{bond.kind}</span>
                    </td>
                    <td className="font-mono text-xs">{shortDate.format(new Date(bond.value_date))}</td>
                    <td className="text-right font-mono text-sm">{bond.weighted_avg_rate.toFixed(3)}%</td>
                    <td className="text-right font-mono text-xs">{bond.accepted_kes_m == null ? "—" : `KES ${(bond.accepted_kes_m / 1000).toFixed(1)}bn`}</td>
                    <td className="text-right font-mono text-xs">{bond.bid_to_cover == null ? "—" : bond.bid_to_cover.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          <SourceLine name="Central Bank of Kenya" href="https://www.centralbank.go.ke/bills-bonds/" detail="auction result notices; each row links to its notice" />
        </section>

        <section className="lg:col-span-5">
          <SectionTitle kicker="Currencies" title="Biggest moves against the dollar" href="/markets" hrefLabel="All rates →" />
          {fxMoves.length ? (
            <>
              <table className="data-table mt-2">
                <tbody>
                  {fxMoves.map((move) => (
                    <tr key={move.code}>
                      <td>
                        <Link href={pairHref(move.code)} className="hover:text-forest">
                          {move.name}
                        </Link>
                      </td>
                      <td className="text-right font-mono text-xs">{fxText(move.now)}</td>
                      <td className={`text-right font-mono text-xs ${move.changePct >= 0 ? "text-forest" : "text-gold"}`}>{pctText(move.changePct, 2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-muted">
                Change in each currency’s value against the US dollar, {shortDate.format(new Date(fxMoves[0].from))} to{" "}
                {shortDate.format(new Date(fxMoves[0].to))}. Positive means the currency strengthened.
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">
              The Afronomics FX archive began on {edition.fx?.asOf ? longDate.format(new Date(edition.fx.asOf)) : "30 September 2026"}; week-on-week moves appear
              here once a full week is recorded.
            </p>
          )}
          <SourceLine name="ExchangeRate-API" href="https://www.exchangerate-api.com/" detail="daily mid-market reference, archived by Afronomics" />
        </section>
      </div>

      <section className="mt-14">
        <SectionTitle kicker="The Wire" title="Stories that moved the week" href="/news" hrefLabel="All headlines →" />
        <WireList items={edition.stories} now={now} />
      </section>

      <section className="mt-14">
        <SectionTitle
          kicker="Capital"
          title="World Bank Board dates, next six weeks"
          href="/capital"
          hrefLabel="Full pipeline →"
          note="Operations in the pipeline with an expected Board date between today and six weeks out, as published by the World Bank."
        />
        <div className="mt-4">
          <ProjectTable projects={edition.boards} />
        </div>
        <SourceLine name={projectsSource.name} href={projectsSource.url} />
      </section>

      {edition.signals.length ? (
        <section className="mt-14">
          <SectionTitle kicker="Signals" title="Prints worth a second look" href="/signals" />
          <ul className="mt-2 grid gap-px bg-rule sm:grid-cols-2">
            {edition.signals.map((signal) => (
              <li key={signal.id} className="bg-paper px-4 py-4">
                <Link href={`/data/${signal.def.slug}`} className="text-[15px] leading-snug text-ink hover:text-forest">
                  {signal.headline}
                </Link>
                <p className="mt-1 text-xs text-ink-soft">{signal.detail}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-7">
          {/* eslint-disable-next-line @next/next/no-img-element -- generated chart image, served as-is so it can be republished */}
          <img src="/charts/week.png" alt="Chart of the week: 364-day Treasury bill rates across five African markets" width={1200} height={630} className="h-auto w-full border border-rule" />
        </div>
        <div className="lg:col-span-5">
          <SectionTitle kicker="Chart of the week" title="Free to republish" />
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            Newsrooms, analysts and bloggers may use this chart in print, online or on social media, unchanged, with the credit “Source: Afronomics,
            compiled from central-bank auction results”. It updates as each market reports.
          </p>
          <a href="/charts/week.png" download="afronomics-chart-of-the-week.png" className="mt-4 inline-block bg-forest px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-paper hover:bg-forest-deep">
            Download PNG
          </a>
        </div>
      </section>

      <NewsletterBand lede="This edition, in your inbox every Monday morning, East Africa time. Free." />

      {archive.length ? (
        <section className="mt-16 max-w-3xl">
          <SectionTitle kicker="Archive" title="Earlier weekly notes" />
          <div className="mt-8 space-y-12">
            {archive.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
