import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/data/PageShell";
import { EvidenceTag, asOfLabel } from "@/components/evidence/EvidenceTag";
import { LEDGER_FILE, LEDGER_HISTORY, TARGET, backtest, loadLedger, score, type LedgerRow } from "@/lib/ledger";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";

export const revalidate = 3600;

const description =
  "Every Kenya Treasury bill range Afronomics publishes, written down before bids close and graded by code against the Central Bank's result. Hits, misses and calibration, with a free CSV.";

export const metadata: Metadata = {
  title: "Our record: forecasts graded against results",
  description: fitDescription(description),
  alternates: { canonical: `${site.url}/record` },
};

const pct = (n: number) => `${n.toFixed(2)}%`;
const share = (n: number | null) => (n == null ? "—" : `${Math.round(n * 100)}%`);

function Result({ r }: { r: LedgerRow }) {
  const o = r.outcome;
  if (!o) return <span className="text-muted">Waiting for CBK</span>;
  if (o.status === "no_result") return <span className="text-muted">No result published</span>;
  return (
    <span className="inline-flex flex-col items-end gap-1">
      <span>
        {pct(o.result_rate!)}{" "}
        <span className={o.inside ? "text-up" : "text-down"}>{o.inside ? "inside" : `${o.side} by ${o.miss_bps} bp`}</span>
      </span>
      {o.source ? <EvidenceTag source="CBK auction results" href={o.source} asOf={o.result_value_date!} /> : null}
    </span>
  );
}

export default function RecordPage() {
  const { methods, rows, firstPublished } = loadLedger();
  const live = score(rows);
  const bt = backtest();
  const tenors = [91, 182, 364] as const;

  return (
    <PageShell
      crumbs={[{ href: "/", label: "Today" }, { label: "Our record" }]}
      kicker="Our record"
      title="Forecasts written down first, graded against the result"
      lede="Before each Kenya Treasury bill auction we publish a likely range for each bill's rate. Each range is committed to a public file before bids close, and code grades it against the Central Bank's result. Nothing is edited afterwards."
    >
      <section aria-labelledby="live" className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <h2 id="live" className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            Live ledger
          </h2>
          <p className="tabular mt-2 font-serif text-[2.4rem] leading-none text-ink">{share(live.share)}</p>
          <p className="mt-2 text-[14px] leading-6 text-ink-soft">
            {live.graded
              ? `${live.inside} of ${live.graded} graded results fell inside the range.`
              : `No result graded yet: the first ${rows.length} ranges are waiting for the auction.`}
          </p>
        </div>
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">What the method aims for</h2>
          <p className="tabular mt-2 font-serif text-[2.4rem] leading-none text-ink">{Math.round(TARGET * 100)}%</p>
          <p className="mt-2 text-[14px] leading-6 text-ink-soft">A range from the 10th to the 90th percentile of recent weekly moves should hold about four results in five.</p>
        </div>
        <div className="rounded-2xl border border-rule bg-surface px-5 py-5">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">Backtest, since 2011</h2>
          <p className="tabular mt-2 font-serif text-[2.4rem] leading-none text-ink">{share(bt.share)}</p>
          <p className="mt-2 text-[14px] leading-6 text-ink-soft">
            The same method run over {bt.tested.toLocaleString("en-US")} past auctions: {bt.inside.toLocaleString("en-US")} inside. Not ranges published at the time, and
            never added to the live figure.
          </p>
        </div>
      </section>
      {live.meanMissBps != null ? (
        <p className="tabular mt-3 text-[14px] text-ink-soft">When a result fell outside, it missed the range by {live.meanMissBps.toFixed(1)} basis points on average.</p>
      ) : null}

      <section aria-labelledby="ledger" className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="ledger" className="font-serif text-2xl text-ink">
            Every forecast
          </h2>
          <span className="flex flex-wrap gap-4 text-[14px] font-semibold">
            <a href={LEDGER_HISTORY} target="_blank" rel="noopener noreferrer" className="text-forest underline underline-offset-4">
              When each was published
            </a>
            <a href="/api/record" className="text-forest underline underline-offset-4" data-track="download_click">
              Download CSV
            </a>
          </span>
        </div>
        <div className="table-box mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Forecast ledger (scrolls sideways)">
          <table className="data-table min-w-[720px]">
            <thead>
              <tr>
                <th scope="col">Auction</th>
                <th scope="col">Bill</th>
                <th scope="col" className="text-right">
                  Range
                </th>
                <th scope="col" className="text-right">
                  Written
                </th>
                <th scope="col" className="text-right">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <th scope="row" className="row-label">
                    <time dateTime={r.auction_value_date}>{asOfLabel(r.auction_value_date)}</time>
                  </th>
                  <td>{r.tenor}-day</td>
                  <td className="text-right" data-num>
                    {pct(r.low)} – {pct(r.high)}
                    <span className="block text-[11px] text-muted">from {pct(r.from_rate)} on {asOfLabel(r.from_value_date)}</span>
                  </td>
                  <td className="text-right text-[13px]" data-num>
                    {r.written_at.replace("T", " ").slice(0, 16)} UTC
                    <span className="block text-[11px] text-muted">
                      bids {r.outcome ? "closed" : "close"} {r.bids_close.replace("T", " ").slice(0, 16)} UTC
                    </span>
                  </td>
                  <td className="text-right" data-num>
                    <Result r={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="by-tenor" className="mt-10">
        <h2 id="by-tenor" className="font-serif text-2xl text-ink">
          By bill
        </h2>
        <div className="table-box mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Results by bill (scrolls sideways)">
          <table className="data-table min-w-[520px]">
            <thead>
              <tr>
                <th scope="col">Bill</th>
                <th scope="col" className="text-right">
                  Live: inside
                </th>
                <th scope="col" className="text-right">
                  Backtest: inside
                </th>
              </tr>
            </thead>
            <tbody>
              {tenors.map((t) => {
                const s = score(rows.filter((r) => r.tenor === t));
                const b = bt.byTenor.find((x) => x.tenor === t);
                return (
                  <tr key={t}>
                    <th scope="row" className="row-label">
                      {t}-day
                    </th>
                    <td className="text-right" data-num>
                      {s.graded ? `${s.inside} of ${s.graded} (${share(s.share)})` : "None graded yet"}
                    </td>
                    <td className="text-right" data-num>
                      {b ? `${b.inside.toLocaleString("en-US")} of ${b.tested.toLocaleString("en-US")} (${share(b.inside / b.tested)})` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="method" className="mt-10 max-w-3xl text-[14px] leading-6 text-ink-soft">
        <h2 id="method" className="font-serif text-2xl text-ink">
          How it works
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          {Object.entries(methods).map(([v, text]) => (
            <li key={v}>
              <strong className="text-ink">Method {v}:</strong> {text}
            </li>
          ))}
          <li>
            Ranges are written to a{" "}
            <a href={LEDGER_FILE} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              public file
            </a>{" "}
            before bids close (Thursday, 14:00 Nairobi); the commit history shows when. A range written after bids close is refused by the code that writes it.
          </li>
          <li>The result is CBK&rsquo;s published weighted average accepted rate for that bill. A range with no result after 21 days is marked as such, never dropped.</li>
          <li>If the method changes, it gets a new version; earlier forecasts keep theirs and are reported apart.</li>
          {firstPublished.map((p) => (
            <li key={p.commit}>
              {p.note}{" "}
              <a href={p.commit} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                Commit of {p.at.replace("T", " ").slice(0, 16)} UTC
              </a>{" "}
              ({p.ids.length} forecasts).
            </li>
          ))}
        </ul>
        <p className="mt-4">
          <Link href="/markets/kenya-tbills/auction" className="font-semibold text-forest underline underline-offset-4">
            This week&rsquo;s ranges and the bid checker
          </Link>{" "}
          · Information, not advice: a range is not a recommendation to bid at any rate.
        </p>
      </section>
    </PageShell>
  );
}
