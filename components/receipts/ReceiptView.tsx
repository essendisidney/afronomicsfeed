import Link from "next/link";
import { PaystackCheckout } from "@/components/billing/PaystackCheckout";
import { BarChart } from "@/components/charts/BarChart";
import { ChartFrame } from "@/components/charts/ChartFrame";
import { ChartTools } from "@/components/charts/ChartTools";
import { asOfLabel } from "@/components/evidence/EvidenceTag";
import { statusLabel, statusTone } from "@/components/record/EditorialCalls";
import { ReceiptBody } from "@/components/receipts/ReceiptBody";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { chartAnchor, chartExport } from "@/lib/charts/receipt-charts";
import { editorialRows } from "@/lib/editorial";
import { deskSlug, receiptEvidence, sectorNames, type Receipt, type ReceiptChart, type ReceiptTile } from "@/lib/receipts";
import { isPercentUnit } from "@/lib/charts/render";

/**
 * One Receipt, in the order RECEIPTS.md sets: the free piece, its calls, "Go deeper" (Pro), and the next-chapter
 * sign-up. The verdict line, the figure tiles and the lead chart sit at the top so the point is made without
 * scrolling. Drafts carry a banner and are never public.
 */

const fmtDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const receiptDate = (iso: string) => fmtDay.format(new Date(`${iso}T00:00:00Z`));

export function ReceiptMeta({ r }: { r: Receipt }) {
  const desk = deskSlug(r.desk);
  return (
    // Two lines reserved on phones: the body font can arrive late there and wrap this line (layout shift on /receipts).
    <p className="t-label flex min-h-8 flex-wrap content-start items-center gap-x-2 gap-y-1 text-muted sm:min-h-0">
      {desk ? (
        <Link href={`/receipts/desks/${desk}`} className="text-forest hover:text-ink">
          {r.desk.replace(/^Afronomics /, "")}
        </Link>
      ) : (
        <span>{r.desk}</span>
      )}
      <span aria-hidden="true">·</span>
      <span>{r.type === "verdict" ? "Receipt" : "Data Receipt"}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={r.date}>{receiptDate(r.date)}</time>
      {r.status !== "published" ? <span className="rounded border border-warn px-1.5 py-0.5 text-warn">Draft, not public</span> : null}
    </p>
  );
}

export function VerdictLine({ r, size = "lg" }: { r: Receipt; size?: "lg" | "md" }) {
  if (!r.verdict) return null;
  return (
    <div className={`border-l-4 border-accent ${size === "lg" ? "mt-5 pl-4" : "mt-3 pl-3"}`}>
      <p className="t-label text-opinion">Our verdict · Opinion</p>
      <p className={`mt-1 font-semibold text-ink text-balance ${size === "lg" ? "text-[1.15rem] leading-7 sm:text-[1.3rem]" : "text-[1rem] leading-6"}`}>{r.verdict}</p>
    </div>
  );
}

export function FigureTiles({ r, tiles }: { r: Receipt; tiles: ReceiptTile[] }) {
  if (!tiles.length) return null;
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3">
      {tiles.map((t) => {
        const ev = receiptEvidence(r, t.source);
        return (
          <li key={t.label} className="rounded-xl border border-rule bg-surface px-4 py-3">
            <p className="t-label text-muted">{t.label}</p>
            <p className="tabular mt-1 text-[1.6rem] font-semibold leading-none text-ink sm:text-[1.9rem]">{t.value}</p>
            {t.note ? <p className="mt-1.5 text-[12.5px] leading-5 text-ink-soft">{t.note}</p> : null}
            {ev ? <p className="mt-1.5 text-[11.5px] text-muted">{ev.source}, {asOfLabel(ev.asOf)}</p> : null}
          </li>
        );
      })}
    </ul>
  );
}

/** One Receipt chart; `n` is its place in the Receipt, from 1, which names its anchor and its embed. */
export function ReceiptChartView({ r, chart, n }: { r: Receipt; chart: ReceiptChart; n: number }) {
  const pct = isPercentUnit(chart.unit);
  return (
    <ChartFrame
      id={chartAnchor(n)}
      title={chart.title}
      unit={chart.unit}
      evidence={receiptEvidence(r, chart.source)}
      tools={<ChartTools chart={chartExport(r, chart, n)} />}
    >
      <BarChart
        data={chart.data}
        unit={chart.unit}
        highlight={chart.highlight}
        reference={chart.reference}
        annotations={chart.annotations}
        label={`${chart.title}. ${chart.data.map((d) => `${d.label}: ${d.value}${pct ? "%" : ""}`).join("; ")}`}
        format={(v) => `${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}${pct ? "%" : ""}`}
      />
    </ChartFrame>
  );
}

export function ReceiptView({ r }: { r: Receipt }) {
  const [lead, ...rest] = r.charts;
  // The ledger's own rows for this Receipt (ids RC-<slug>-<n>, scripts/calls_ledger.py), so each call shows its status.
  const ledger = new Map(editorialRows().filter((x) => x.receipt === r.slug).map((x) => [x.id, x]));
  return (
    <article className="mx-auto max-w-3xl">
      {r.status !== "published" ? (
        <div role="note" className="mb-5 rounded-xl border border-warn/60 bg-surface px-4 py-3 text-[14px] leading-6 text-ink">
          <strong>Draft, shown on preview deployments only.</strong> It publishes when every open check has been done against a primary document.
          {r.verify.length ? (
            <details className="mt-1 text-[13px] text-ink-soft">
              <summary className="cursor-pointer font-semibold text-ink">{r.verify.length} open checks</summary>
              <ul className="mt-1 list-disc space-y-1 pl-5">
                {r.verify.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
      <ReceiptMeta r={r} />
      <h1 className="t-display mt-3 text-ink text-balance">{r.title}</h1>
      <VerdictLine r={r} />
      <FigureTiles r={r} tiles={r.tiles} />
      {lead ? (
        <div className="mt-5">
          <ReceiptChartView r={r} chart={lead} n={1} />
        </div>
      ) : null}

      <div className="mt-8">
        <ReceiptBody content={r.free} />
      </div>

      {rest.length ? (
        <div className="mt-8 grid grid-cols-1 gap-4">
          {rest.map((c, i) => (
            <ReceiptChartView key={c.title} r={r} chart={c} n={i + 2} />
          ))}
        </div>
      ) : null}

      {r.disclosure ? <p className="mt-6 text-[13px] leading-5 text-muted">Disclosure: {r.disclosure}</p> : null}
      <p className="mt-2 text-[13px] leading-5 text-muted">
        By the {r.desk}. Checked against the sources below and published under our{" "}
        <Link href="/method" className="underline underline-offset-2">
          house rules
        </Link>
        ; Afronomics Feed is accountable for every word.{" "}
        <Link href="/corrections" className="underline underline-offset-2">
          Report a correction
        </Link>
        .
      </p>

      {r.calls.length ? (
        <section aria-labelledby="calls" className="mt-10 rounded-2xl border border-rule bg-surface px-5 py-5">
          <h2 id="calls" className="t-h2 text-ink">
            Our calls, on the record
          </h2>
          <p className="mt-1 text-[14px] text-ink-soft">
            {r.status === "published"
              ? "Each is dated and graded against the source named, when it publishes. Win or lose, it stays on the record."
              : "These go on the public record when this Receipt is published; a call whose date has passed by then is left off."}
          </p>
          <ol className="mt-4 divide-y divide-rule">
            {r.calls.map((c, i) => {
              const row = ledger.get(`RC-${r.slug}-${i + 1}`);
              return (
                <li key={c.statement} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <p className="min-w-0 text-[15px] leading-6 text-ink sm:flex-1">{c.statement}</p>
                  {/* A fixed-width column, so a long source name wraps inside it instead of squeezing the call. */}
                  <p className="tabular text-[12.5px] text-muted sm:w-60 sm:flex-none sm:text-right">
                    Settled by {c.check_source}, {receiptDate(c.check_date)}
                    {row ? (
                      <Link href={`/record#${row.id}`} className={`t-label mt-0.5 block ${statusTone[row.status]}`}>
                        {statusLabel[row.status]}
                      </Link>
                    ) : null}
                  </p>
                </li>
              );
            })}
          </ol>
          <Link href="/record" className="mt-2 inline-flex min-h-11 items-center text-[14px] font-semibold text-forest hover:text-ink">
            Our record →
          </Link>
        </section>
      ) : null}

      {r.full ? (
        <section aria-labelledby="go-deeper" className="on-night mt-6 rounded-2xl bg-night px-5 py-6 text-night-ink sm:px-6">
          <h2 id="go-deeper" className="t-h2">
            Coming with Pro: the full file
          </h2>
          {/* Until Pro sign-in and the full files are built (docs/rebuild/phase-7e-r3-plan.md, R3), this lists what the
              full file will hold; nothing here is sold as already delivered. */}
          <p className="mt-1 text-[14px] text-night-soft">Being built now. Pro readers get each part the day it is published.</p>
          <div className="receipt-full mt-2 text-[15px] leading-6 text-night-soft">
            <ReceiptBody content={r.full.replace(/^##[^\n]*\n/, "")} />
          </div>
          <div className="mt-4 max-w-md">
            <PaystackCheckout plan="pro" label="Get Pro, KES 1,500 a month" variant="accent" />
          </div>
        </section>
      ) : null}

      <section aria-labelledby="next-chapter" className="mt-6 rounded-2xl border border-rule bg-surface px-5 py-5">
        <h2 id="next-chapter" className="t-h2 text-ink">
          Get the next chapter first
        </h2>
        <p className="mt-1 text-[14px] text-ink-soft">
          {r.followUps.length
            ? `Next: ${r.followUps.filter((f) => f.date >= r.date).map((f) => `${f.what}, ${receiptDate(f.date)}`).slice(0, 2).join("; ")}.`
            : "The next Receipt, before 06:00."}
        </p>
        <div className="mt-3">
          <SubscribeForm button="Send it to me" />
        </div>
      </section>

      <section aria-labelledby="sources" className="mt-10">
        <h2 id="sources" className="t-h2 text-ink">
          Sources
        </h2>
        <ol className="mt-3 space-y-1.5 text-[14px] leading-6">
          {r.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2 hover:text-forest">
                {s.name}
              </a>
              <span className="text-muted">, {receiptDate(s.date)}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-[13px] text-muted">
          Sector: {sectorNames[r.sector] ?? r.sector}
          {r.series ? (
            <>
              {" · "}
              <Link href={`/receipts/series/${r.series}`} className="underline underline-offset-2">
                The {r.series} file
              </Link>
            </>
          ) : null}
        </p>
      </section>
    </article>
  );
}
