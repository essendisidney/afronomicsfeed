import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { Card } from "@/components/ui/Card";
import { CopyCitation } from "@/components/ui/CopyCitation";
import { DataTable } from "@/components/ui/DataTable";
import { Stat, StatGroup } from "@/components/ui/Stat";
import { shortDate } from "@/lib/data/auction-week";
import { renderTime } from "@/lib/data/fetcher";
import { billMarkets } from "@/lib/data/sovereign-bills";
import { standingCitations } from "@/lib/citations";
import { visibleReceipts } from "@/lib/receipts";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";
import { billFigures, bondFigures, coverage, indexFigure, kenyaBills, type BillFigure, type BondFigure } from "./figures";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Press: figures to cite, method and contact",
  description: fitDescription(
    "For journalists and researchers: the latest Treasury bill and bond auction figures across African markets with their sources and dates, how to cite Afronomics, the method, charts to republish and the press contact.",
  ),
  alternates: { canonical: `${site.url}/press` },
};

const link = "font-medium text-forest underline underline-offset-2 hover:text-gold";
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const n = (v: number) => v.toLocaleString("en-US");

/**
 * The press kit (docs/rebuild/upgrade-U6-plan.md, item B). Every figure is read from the data files with its
 * publisher and date (./figures.ts); the citation log shows only once it holds an entry (data/citations.json).
 */
export default function PressPage() {
  const now = new Date(renderTime());
  const mail = `mailto:${site.contactEmail}?subject=${encodeURIComponent("Press")}`;
  const index = indexFigure();
  const kenya = kenyaBills();
  const bills = billFigures();
  const bonds = bondFigures();
  const cov = coverage();
  const cited = standingCitations();
  const charts = visibleReceipts()
    .filter((r) => r.charts.length)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4);
  const boiler = `according to Afronomics, which compiles Treasury bill and bond auction results published by African central banks and treasuries`;
  const datasetCite = `Afronomics (${now.getUTCFullYear()}). African Treasury bill auction results, ${billMarkets.length} markets, compiled from central-bank publications. Retrieved ${dateFmt.format(now)}, from ${site.url}/markets/tbills`;

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/about", label: "About" }, { label: "Press" }]}
      kicker="Press"
      title="Figures you can cite, and how"
      lede={
        <p>
          Afronomics reads what African central banks and treasuries publish (auction results, policy rates) the day they publish it, keeps a dated
          record, and shows every figure with its source. Quote, chart and republish it free with the credit “Source: Afronomics” and a link.
        </p>
      }
      aside={
        <Card>
          <p className="text-[14px] font-semibold text-ink">Press contact</p>
          <p className="mt-1 text-sm leading-6 text-ink-soft">
            Interviews, a figure checked before you publish, or a series we don’t yet show. We reply within one working day, Nairobi time.
          </p>
          <a href={mail} className={`mt-3 inline-flex min-h-11 items-center break-all ${link}`}>
            {site.contactEmail}
          </a>
          <p className="mt-1 text-[12.5px] text-muted">Put “Press” in the subject.</p>
        </Card>
      }
    >
      <section>
        <SectionTitle kicker="Citable now" title="The latest headline figures" note="Each sentence carries its source and date; the copy button adds the page that will keep showing it." />
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {index ? (
            <li>
              <Card className="h-full">
                <p className="text-[15px] leading-7 text-ink">{index.sentence}</p>
                <p className="mt-2 text-[12px] text-muted">
                  Method and contributions: <Link href="/markets/bill-index" className={link}>/markets/bill-index</Link>
                </p>
                <div className="mt-3">
                  <CopyCitation text={`${index.sentence} ${site.url}/markets/bill-index`} />
                </div>
              </Card>
            </li>
          ) : null}
          {kenya.map((k) => (
            <li key={k.tenor}>
              <Card className="h-full">
                <p className="text-[15px] leading-7 text-ink">{k.sentence}</p>
                <p className="mt-2 text-[12px] text-muted">
                  {k.bps == null ? "" : `${k.bps === 0 ? "Unchanged" : `${k.bps > 0 ? "+" : "−"}${Math.abs(k.bps)} bps`} on the previous ${k.tenor}-day auction. `}
                  <a href={k.source} target="_blank" rel="noopener noreferrer" data-track="source_click" className={link}>
                    The CBK’s result
                  </a>{" "}
                  · <Link href={k.path} className={link}>Our page for this auction</Link>
                </p>
                <div className="mt-3">
                  <CopyCitation text={`${k.sentence} ${site.url}${k.path}`} />
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <SectionTitle
          kicker="Every market"
          title="Latest Treasury bill rate, market by market"
          note="The longest bill each market sold at its latest auction (364-day where it sells one), each central bank's own headline rate, beside its policy rate with the date the bank prints (or the day we read it)."
          href="/markets/tbills"
          hrefLabel="T-bill monitor"
        />
        <DataTable<BillFigure>
          className="mt-3"
          label="Latest Treasury bill rate by market"
          mobile="cards"
          rows={bills}
          rowKey={(r) => r.slug}
          columns={[
            { key: "m", header: "Market", cell: (r) => r.country },
            { key: "t", header: "Bill", cell: (r) => `${r.tenor}-day` },
            { key: "r", header: "Rate", numeric: true, cell: (r) => `${r.rate.toFixed(2)}%` },
            {
              key: "d",
              header: "Value date",
              cell: (r) => (
                <Link href={r.path} className={link}>
                  {shortDate(r.date)}
                </Link>
              ),
            },
            {
              key: "p",
              header: "Policy rate",
              cell: (r) =>
                r.policy ? (
                  <a href={r.policy.source} target="_blank" rel="noopener noreferrer" data-track="source_click" className={link}>
                    {r.policy.rate.toFixed(2)}% <span className="text-muted">({r.policy.printed ? `as printed: ${r.policy.printed}` : `read ${shortDate(r.policy.readOn)}`})</span>
                  </a>
                ) : (
                  <span className="text-muted">not read</span>
                ),
            },
            {
              key: "s",
              header: "Source",
              cell: (r) => (
                <a href={r.source} target="_blank" rel="noopener noreferrer" data-track="source_click" className={link}>
                  {r.publisher}
                </a>
              ),
            },
          ]}
        />
      </section>

      <section className="mt-14">
        <SectionTitle
          kicker="Every market"
          title="Latest government bond auction, market by market"
          note="The headline line of each market's latest bond sale (the largest amount accepted, or the longest tenor where amounts are not published), with its own dated page."
          href="/markets/bonds"
          hrefLabel="All bond markets"
        />
        <DataTable<BondFigure>
          className="mt-3"
          label="Latest government bond auction by market"
          mobile="cards"
          rows={bonds}
          rowKey={(r) => r.slug}
          columns={[
            { key: "m", header: "Market", cell: (r) => r.place },
            {
              key: "d",
              header: "Date",
              cell: (r) => (
                <Link href={r.path} className={link}>
                  {shortDate(r.date)}
                  {r.settlement ? " (settlement)" : ""}
                </Link>
              ),
            },
            { key: "l", header: "Line", cell: (r) => r.line },
            { key: "r", header: "Rate", numeric: true, cell: (r) => `${r.rate.toFixed(2)}%` },
            {
              key: "s",
              header: "Source",
              cell: (r) => (
                <a href={r.source} target="_blank" rel="noopener noreferrer" data-track="source_click" className={link}>
                  {r.publisher}
                </a>
              ),
            },
          ]}
        />
      </section>

      <section className="mt-14">
        <SectionTitle kicker="The record" title="What the record holds" note="Counted from the data files when this page was built." />
        <StatGroup className="mt-4">
          <Stat label="Treasury bill markets" value={cov.billMarkets} detail={`${n(cov.billResults)} auction results`} />
          <Stat label="Bond markets" value={cov.bondMarkets} detail={`${n(cov.bondResults)} auction lines`} />
          <Stat label="Dated bill auction pages" value={n(cov.billPages)} detail="One stable address per auction" />
          <Stat label="Dated bond auction pages" value={n(cov.bondPages)} detail="Title carries the date and the rate" />
        </StatGroup>
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="How to cite" title="Credit and wording" />
          <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-ink-soft">
            <li>
              Credit: <strong className="text-ink">“Source: Afronomics”</strong>, with a link to the page the figure is on. Where the figure is one
              central bank’s, name the bank too: “Central Bank of Kenya, via Afronomics”.
            </li>
            <li>In text: “{boiler}”.</li>
            <li>Every auction has its own address that will not change; link that page rather than the home page.</li>
            <li>
              Free for news, research and teaching. Feeds, bulk data and use inside a fund, bank or firm are licensed:{" "}
              <Link href="/licensing" className={link}>licensing</Link>.
            </li>
          </ul>
          <p className="mt-4 text-[13px] font-semibold text-ink">A dataset citation</p>
          <p className="mt-1 break-words rounded-xl bg-paper-2 px-4 py-3 text-[13px] leading-6 text-ink">{datasetCite}</p>
          <div className="mt-3">
            <CopyCitation text={datasetCite} />
          </div>
        </div>
        <div>
          <SectionTitle kicker="Method" title="How the numbers are made" />
          <ul className="mt-4 space-y-3 text-[15px] leading-6">
            {[
              ["/reference", "What “according to Afronomics” means", "the rate we carry for each market, stable addresses, when each result appeared"],
              ["/method", "Sources and method", "where every series comes from and how it is checked"],
              ["/markets/bill-index", "The index method", "how the weekly African Sovereign Bill Index is computed"],
              ["/editorial-standards", "Editorial standards", "how stories are labelled, sourced and checked"],
              ["/corrections", "Corrections", "every figure we got wrong and what changed"],
              ["/record", "Our record", "our published forecast ranges, graded against the results"],
              ["/status", "Data status", "when each source was last read"],
            ].map(([href, title, note]) => (
              <li key={href}>
                <Link href={href} className={link}>
                  {title}
                </Link>
                <span className="text-ink-soft">: {note}.</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-14 grid gap-8 lg:grid-cols-2">
        <div>
          <SectionTitle kicker="Charts" title="Charts to republish" />
          <ul className="mt-4 space-y-3 text-[15px] leading-6 text-ink-soft">
            <li>
              <a href="/charts/week.png" className={link}>
                Chart of the week
              </a>
              : the latest one-year bill rate in every market, as an image that carries its own credit. Updated hourly.
            </li>
            <li>
              <Link href="/widgets" className={link}>
                Live widgets
              </Link>
              : Kenya T-bill rates, African currencies and headlines, one line of HTML each.
            </li>
            {charts.map((r) => (
              <li key={r.slug}>
                <Link href={`/receipts/${r.slug}`} className={link}>
                  {r.title}
                </Link>{" "}
                ({shortDate(r.date)}): {r.charts.length === 1 ? "one chart" : `${r.charts.length} charts`} to embed at{" "}
                <code className="break-all font-mono text-[12.5px] text-ink">{`${site.url}/embed/chart/${r.slug}/1`}</code>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <SectionTitle kicker="Logo" title="The Afronomics mark" />
          <div className="mt-4 flex flex-wrap items-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element -- a fixed 64px brand file, offered as a download */}
            <img src="/icon.svg" alt="The Afronomics mark: Af in a laterite stamp" width={64} height={64} className="rounded-2xl" />
            <ul className="space-y-2 text-[15px] leading-6">
              <li>
                <a href="/icon.svg" download="afronomics-mark.svg" className={link}>
                  Mark, SVG
                </a>
              </li>
              <li>
                <a href="/icons/icon-512.png" download="afronomics-mark-512.png" className={link}>
                  Mark, PNG 512 × 512
                </a>
              </li>
            </ul>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            Use the mark as it is, beside a credit or a link to Afronomics. Please don’t recolour it, stretch it or use it to suggest we endorse a
            product.
          </p>
        </div>
      </section>

      {cited.length ? (
        <section className="mt-14">
          <SectionTitle kicker="Cited by" title="Where our figures have been used" note={`${cited.length} logged, newest first. Each links to the piece itself.`} />
          <ul className="mt-3 divide-y divide-rule">
            {cited.slice(0, 20).map((c) => (
              <li key={c.id} className="py-3 text-[15px] leading-6">
                <a href={c.url} target="_blank" rel="noopener noreferrer" className={link}>
                  {c.title}
                </a>
                <span className="text-ink-soft">
                  {" "}
                  · {c.outlet}, {shortDate(c.date)} · used: {c.what}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-14 text-[13px] leading-6 text-muted">
        Figures as at the build of this page, {dateFmt.format(now)}, from each publisher’s own results. <em>Information, not advice.</em>
      </p>
    </PageShell>
  );
}
