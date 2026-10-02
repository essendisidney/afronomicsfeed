import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { SectionTitle } from "@/components/data/parts";
import { CopyCitation } from "@/components/ui/CopyCitation";
import { billIndexLatest, indexName, indexShort } from "@/lib/data/bill-index";
import { renderTime } from "@/lib/data/fetcher";
import { billMarkets, loadBillMarket } from "@/lib/data/sovereign-bills";
import { site } from "@/lib/site";
import { rpcRead } from "@/lib/store";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "The Afronomics reference — the numbers, how they are defined, how fast they appear, how to cite them",
  description:
    "What “according to Afronomics” means: the definition of each market's Treasury bill rate, the African Sovereign Bill Index method, a stable URL for every auction, the public timeliness record and the corrections log.",
  alternates: { canonical: `${site.url}/reference` },
};

type Seen = { market: string; result_date: string; rate: number | null; first_seen_at: string; kind: string; source_published_at: string | null };
type Correction = { id: number; noted_at: string; market: string | null; page: string | null; what_was_wrong: string; what_changed: string; reason: string | null; reported_by: string | null };

const nairobi = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Nairobi" });
const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export default async function ReferencePage() {
  const now = new Date(renderTime());
  const [seenR, corrR] = await Promise.all([rpcRead("af_timeliness", {}, 900), rpcRead("af_corrections", {}, 900)]);
  const seen = seenR.ok && Array.isArray(seenR.value) ? (seenR.value as Seen[]) : [];
  const corrections = corrR.ok && Array.isArray(corrR.value) ? (corrR.value as Correction[]) : [];
  const live = seen.filter((s) => s.kind === "live");
  const index = billIndexLatest();
  const byMarket = new Map<string, (typeof billMarkets)[number]>(billMarkets.map((m) => [m.slug, m]));
  const totals = billMarkets.map((m) => ({ m, rows: loadBillMarket(m.slug).rows }));
  const results = totals.reduce((n, t) => n + t.rows.length, 0);
  const boiler = `according to Afronomics, which compiles Treasury bill auction results published by ${billMarkets.length} African central banks`;
  const cite = `Afronomics (${now.getUTCFullYear()}). African Treasury bill auction results, ${billMarkets.length} markets, compiled from central-bank publications. Retrieved ${dateFmt.format(now)}, from ${site.url}/markets/tbills`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Afronomics African Treasury bill auction results",
    description: `Treasury bill auction results (91-, 182- and 364-day rates, amounts offered, bid and accepted) for ${billMarkets.length} African markets, compiled from each central bank's published results. ${results.toLocaleString("en-US")} results.`,
    url: `${site.url}/markets/tbills`,
    license: `${site.url}/licensing`,
    creator: { "@type": "Organization", name: "Afronomics", url: site.url },
    isAccessibleForFree: true,
    temporalCoverage: `${totals.map((t) => t.rows.at(-1)?.date ?? "").filter(Boolean).sort()[0]?.slice(0, 4)}/..`,
    spatialCoverage: billMarkets.map((m) => m.country).join(", "),
    distribution: [
      { "@type": "DataDownload", encodingFormat: "application/json", contentUrl: `${site.url}/api/v1/tbills` },
      ...billMarkets.map((m) => ({ "@type": "DataDownload", encodingFormat: "text/csv", contentUrl: `${site.url}/api/data/tbills/${m.slug}` })),
    ],
  };

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Home" }, { href: "/method", label: "Sources & method" }, { label: "Reference" }]}
      kicker="The reference"
      title="What “according to Afronomics” means"
      lede={
        <p>
          A number is worth citing when its definition is fixed, its source is named, its URL does not change, its timing is on record and its
          mistakes are logged. This page is that record for every figure Afronomics publishes: the ten markets’ Treasury bill rates, the{" "}
          {indexShort}, and the measures built on them.
        </p>
      }
      aside={
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5 text-sm text-ink-soft">
          <p className="text-[14px] font-semibold text-ink">For newsrooms</p>
          <p className="mt-2 leading-6">
            Use the phrase “{boiler}”. Every figure has a page you can link that will still be there next year, and a CSV of the full series.
            Reply within the hour on a working day: {site.contactEmail}.
          </p>
          <div className="mt-3">
            <CopyCitation text={cite} />
          </div>
        </div>
      }
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <SectionTitle kicker="Definitions" title="The Afronomics rate, market by market" />
      <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">
        Each market’s “rate” is the one its central bank itself headlines, taken from the published result and never re-computed. Where a bank publishes
        several figures, this is which one we carry.
      </p>
      <div className="overflow-x-auto">
        <table className="data-table mt-4">
          <thead>
            <tr>
              <th>Market</th>
              <th>The rate we publish</th>
              <th>Publisher</th>
              <th className="text-right">Results</th>
              <th>Since</th>
            </tr>
          </thead>
          <tbody>
            {totals.map(({ m, rows }) => (
              <tr key={m.slug}>
                <td>
                  <Link href={m.href} className="font-medium hover:text-accent">
                    {m.country}
                  </Link>
                </td>
                <td className="text-sm text-ink-soft">{m.rateLabel}: the {m.rateNote}</td>
                <td className="text-sm">
                  <a href={m.sourcePage} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                    {m.publisher}
                  </a>
                </td>
                <td className="text-right text-sm">{rows.length.toLocaleString("en-US")}</td>
                <td className="text-sm text-muted">{rows.at(-1)?.date.slice(0, 4) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-soft">
        Dates are value (issue) dates as the bank prints them. Amounts are local currency, millions, where the bank publishes them; a blank means the bank
        did not. Rows the bank later restates are replaced and the change logged below.
      </p>

      <section className="mt-14">
        <SectionTitle kicker="The index" title={indexName} />
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">
          {indexShort} is published every Monday as the simple, equal-weighted average of the latest 364-day Treasury bill rate in every covered market,
          a result counting for up to 120 days after its auction, with a minimum of six markets. Equal weighting keeps it a measure of the typical
          market rather than of the two largest; the per-market contributions are published with every reading so anyone can re-weight it. The
          series is recomputed from the underlying auctions, so a corrected auction corrects the index, and the change is logged.
          {index ? ` Latest: ${index.latest.value.toFixed(2)}% for the week of ${dateFmt.format(new Date(index.latest.date))}, ${index.latest.markets} markets.` : ""}{" "}
          <Link href="/markets/bill-index" className="underline underline-offset-2">
            Method, series and contributions
          </Link>
          .
        </p>
      </section>

      <section className="mt-14">
        <SectionTitle kicker="Stable addresses" title="A URL for every number" />
        <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-rule bg-rule md:grid-cols-2">
          {[
            ["One auction", "/markets/tbills/{market}/{value-date}", "Kenya: /markets/kenya-tbills/{value-date}. Rates, amounts, the source document, and the plain-language meaning."],
            ["One market’s history", "/markets/tbills/{market}", "Every result since the series starts, chart, CSV."],
            ["The index", "/markets/bill-index", "Weekly readings, contributions, highs and lows."],
            ["Machine-readable", "/api/v1/tbills/{market}?tenor=364&from=YYYY-MM-DD", "JSON, no key, five-minute cache, attribution line in every response."],
          ].map(([what, path, note]) => (
            <div key={what} className="bg-surface px-5 py-4">
              <p className="text-[12px] font-semibold text-accent">{what}</p>
              <code className="mt-1 block text-[13px] text-ink">{path}</code>
              <p className="mt-1 text-sm text-ink-soft">{note}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          These paths will not change. If a page ever has to move, the old address will redirect permanently; nothing cited here goes dark.
        </p>
      </section>

      <section className="mt-14">
        <SectionTitle kicker="Timeliness" title="When each result appeared on Afronomics" />
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">
          Recorded automatically the first time the pipeline sees a new result, to the minute, Nairobi time. Central banks do not all stamp their
          publications, so this is our side of the record: the value date the bank printed, and when the figure was live here with its source.
          Rows marked “history load” came in with a market’s initial import rather than live detection.
        </p>
        <div className="overflow-x-auto">
          <table className="data-table mt-4">
            <thead>
              <tr>
                <th>Market</th>
                <th>Result (value date)</th>
                <th className="text-right">Rate</th>
                <th>Live on Afronomics</th>
                <th>How</th>
              </tr>
            </thead>
            <tbody>
              {seen.slice(0, 40).map((s) => {
                const m = byMarket.get(s.market);
                return (
                  <tr key={`${s.market}-${s.result_date}`}>
                    <td>
                      {m ? (
                        <Link href={m.href} className="font-medium hover:text-accent">
                          {m.country}
                        </Link>
                      ) : (
                        s.market
                      )}
                    </td>
                    <td className="text-sm">
                      <Link href={m?.slug === "kenya" ? `/markets/kenya-tbills/${s.result_date}` : `/markets/tbills/${s.market}/${s.result_date}`} className="hover:text-accent">
                        {s.result_date}
                      </Link>
                    </td>
                    <td className="text-right text-sm">{s.rate == null ? "—" : `${Number(s.rate).toFixed(2)}%`}</td>
                    <td className="text-sm">{nairobi.format(new Date(s.first_seen_at))} EAT</td>
                    <td className="text-xs text-muted">{s.kind === "live" ? "pipeline" : "history load"}</td>
                  </tr>
                );
              })}
              {!seen.length ? (
                <tr>
                  <td colSpan={5} className="text-sm text-muted">
                    The record starts with the next result.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          {live.length} live detections in the last 90 days. The pipeline checks every central bank three times each working day and the monitor every
          twenty minutes; alerts go out the same minute a result is confirmed.
        </p>
      </section>

      <section className="mt-14" id="corrections">
        <SectionTitle kicker="Corrections" title={corrections.length ? `${corrections.length} correction${corrections.length === 1 ? "" : "s"} to published figures` : "No corrections to published figures yet"} />
        <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-soft">
          When a figure changes after publication — a bank restates a result, a document was misread, a row was duplicated — the change is recorded here
          with what was wrong, what changed and why. Editorial corrections to articles are on the{" "}
          <Link href="/corrections" className="underline underline-offset-2">
            corrections page
          </Link>
          . Report an error: {site.contactEmail}.
        </p>
        {corrections.length ? (
          <ul className="mt-4 divide-y divide-rule">
            {corrections.map((c) => (
              <li key={c.id} className="py-4 text-sm">
                <p className="text-[12px] text-muted">
                  {dateFmt.format(new Date(c.noted_at))}
                  {c.market ? ` · ${byMarket.get(c.market)?.country ?? c.market}` : ""}
                  {c.page ? (
                    <>
                      {" · "}
                      <Link href={c.page} className="underline">
                        {c.page}
                      </Link>
                    </>
                  ) : null}
                </p>
                <p className="mt-1">
                  <strong>Wrong:</strong> {c.what_was_wrong}
                </p>
                <p>
                  <strong>Changed:</strong> {c.what_changed}
                </p>
                {c.reason ? <p className="text-ink-soft">{c.reason}</p> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-14 grid gap-8 md:grid-cols-3 text-sm leading-6 text-ink-soft">
        <div>
          <h3 className="font-serif text-xl text-ink">What we never do</h3>
          <p className="mt-2">Estimate a missing figure, let a model write a number, smooth a series, or change a published value without logging it.</p>
        </div>
        <div>
          <h3 className="font-serif text-xl text-ink">What we check</h3>
          <p className="mt-2">Every parsed result is tested against the notice’s own arithmetic (low ≤ average ≤ high, cost ≤ face value, dates within the auction window) before it is published; anything failing is held, not guessed.</p>
        </div>
        <div>
          <h3 className="font-serif text-xl text-ink">Licence</h3>
          <p className="mt-2">
            Free to quote, chart and republish with the credit “Source: Afronomics, compiled from [publisher]” and a link. Commercial redistribution is{" "}
            <Link href="/licensing" className="underline underline-offset-2">
              licensed
            </Link>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
}
