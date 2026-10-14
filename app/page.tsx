import type { Metadata } from "next";
import Link from "next/link";
import { StatTile } from "@/components/data/StatTile";
import { EvidenceTag } from "@/components/evidence/EvidenceTag";
import { FigureTiles, ReceiptChartView, ReceiptMeta, VerdictLine } from "@/components/receipts/ReceiptView";
import { ButtonLink } from "@/components/ui/Button";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { institutionalPilot, institutionalTier, localInstitutionPrices, localPriceText } from "@/lib/billing/ratecard";
import { getLatestArticles } from "@/lib/content";
import { articleHref, categoryLabel, formatDate } from "@/lib/format";
import { loadLedger, score } from "@/lib/ledger";
import { visibleReceipts, type Receipt } from "@/lib/receipts";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";
import { whatChanged, type TodayMove } from "@/lib/today";
import { numbersThatMoved } from "@/lib/today-board";

export const revalidate = 900;

const homeTitle = `${site.name}: what African money did today, and why`;
const homeDescription =
  "Africa's dated record of what money did, why it happened and what happened next: a daily verdict with the receipts, government borrowing costs, currencies and savings rates from the source, and our forecast record in public.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: fitDescription(homeDescription),
  alternates: { canonical: site.url, languages: { en: site.url, sw: `${site.url}/sw` }, types: { "application/rss+xml": [{ url: "/rss.xml", title: `${site.name} RSS` }] } },
  openGraph: { title: homeTitle, description: homeDescription, url: site.url, siteName: site.name, locale: "en_KE", type: "website" },
};

const todayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Nairobi" });

/** Today's Receipt, made to be read without a click: headline, verdict, the two figures, the lead chart. */
function LeadReceipt({ r }: { r: Receipt }) {
  return (
    <article aria-labelledby="lead-receipt" className="rounded-2xl border border-rule bg-surface px-5 py-5 sm:px-6 sm:py-6">
      <ReceiptMeta r={r} />
      <h2 id="lead-receipt" className="t-display mt-3 text-ink text-balance">
        <Link href={`/receipts/${r.slug}`} className="hover:text-forest">
          {r.title}
        </Link>
      </h2>
      <VerdictLine r={r} />
      <FigureTiles r={r} tiles={r.tiles.slice(0, 2)} />
      {r.charts[0] ? (
        <div className="mt-4">
          <ReceiptChartView r={r} chart={r.charts[0]} />
        </div>
      ) : null}
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <ButtonLink href={`/receipts/${r.slug}`}>Read the Receipt, free</ButtonLink>
        {r.calls.length ? <span className="text-[13px] text-muted">{r.calls.length} dated calls on the record</span> : null}
      </div>
    </article>
  );
}

function MoveRow({ move }: { move: TodayMove }) {
  return (
    <li className="grid gap-1.5 py-4 sm:grid-cols-[1fr_auto] sm:items-start sm:gap-6">
      <div>
        <p className={`t-label ${move.direction === "up" ? "text-up" : "text-down"}`}>
          <span aria-hidden="true">{move.direction === "up" ? "▲" : "▼"}</span> {move.kind === "fx" ? "Currency" : "Government borrowing"}
        </p>
        <h3 className="mt-1 font-serif text-[1.15rem] leading-snug text-ink text-balance">
          <Link href={move.href} className="hover:text-forest">
            {move.headline}
          </Link>
        </h3>
        <p className="mt-1 text-[14px] leading-6 text-ink-soft">
          {move.shillings ? <span className="tabular font-semibold text-ink">{move.shillings}. </span> : null}
          <span className="font-semibold text-ink">Who it touches:</span> {move.touches}.
        </p>
      </div>
      <div className="sm:pt-5">
        <EvidenceTag {...move.evidence} />
      </div>
    </li>
  );
}

export default async function TodayPage() {
  const moves = await whatChanged();
  const tiles = numbersThatMoved();
  const receipts = visibleReceipts();
  const lead = receipts[0] ?? null;
  const stories = getLatestArticles(3);
  const ledger = loadLedger();
  const live = score(ledger.rows);
  const openCalls = receipts.reduce((n, r) => n + r.calls.length, 0);
  const nextGrade = ledger.rows.filter((r) => !r.outcome).map((r) => r.auction_value_date).sort()[0];
  const kenya = localInstitutionPrices.find((p) => p.id === "kenya");

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7">
      <h1 className="sr-only">Afronomics Today: Africa&rsquo;s dated record of what money did, why it happened, and what happened next</h1>
      <p className="t-label flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
        <span>
          Today · <time dateTime={new Date().toISOString().slice(0, 10)}>{todayFmt.format(new Date())}</time>
        </span>
        <Link href="/sw" lang="sw" hrefLang="sw" className="normal-case tracking-normal text-forest underline underline-offset-2">
          Soma kwa Kiswahili
        </Link>
      </p>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-8">
          {lead ? (
            <LeadReceipt r={lead} />
          ) : (
            <section aria-labelledby="what-changed-lead" className="rounded-2xl border border-rule bg-surface px-5 py-2 sm:px-6">
              <h2 id="what-changed-lead" className="t-h2 pt-4 text-ink">
                What changed
              </h2>
              <ul className="divide-y divide-rule">{moves.map((m) => <MoveRow key={m.id} move={m} />)}</ul>
            </section>
          )}
        </div>

        <aside aria-label="Numbers and record" className="flex min-w-0 flex-col gap-4 lg:col-span-4">
          <section aria-labelledby="numbers-moved">
            <div className="flex items-baseline justify-between">
              <h2 id="numbers-moved" className="t-h3 text-ink">
                Numbers that moved
              </h2>
              <Link href="/numbers" className="text-[13px] font-semibold text-forest hover:text-ink">
                All numbers →
              </Link>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {tiles.map((t) => (
                <StatTile key={t.id} label={t.label} value={t.value} change={t.change} direction={t.direction} trend={t.trend} evidence={t.evidence} href={t.href} />
              ))}
            </div>
          </section>

          <Link href="/record" className="group rounded-2xl border border-rule bg-surface px-4 py-3.5 hover:border-forest">
            <p className="t-label text-muted">Our record</p>
            <p className="tabular mt-1 text-[15px] leading-6 text-ink">
              {live.graded
                ? `${live.inside} of ${live.graded} published ranges held the result`
                : `${ledger.rows.length} ranges published before bids close${nextGrade ? `, the first graded with the results for value ${formatDate(nextGrade)}` : ""}`}
              {openCalls ? ` · ${openCalls} calls open` : ""}
              <span className="text-forest group-hover:text-ink"> →</span>
            </p>
          </Link>

          <section aria-labelledby="signup" className="rounded-2xl border border-rule bg-surface px-4 py-4">
            <h2 id="signup" className="t-h3 text-ink">
              The Morning, before 07:30
            </h2>
            <p className="mt-1 text-[13.5px] leading-5 text-ink-soft">What moved overnight and what it means for your money. Free, every weekday.</p>
            <div className="mt-3">
              <SubscribeForm button="Send it to me" />
            </div>
          </section>
        </aside>
      </div>

      {lead && moves.length ? (
        <section aria-labelledby="what-changed" className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-2">
            <h2 id="what-changed" className="t-h2 text-ink">
              What changed
            </h2>
            <Link href="/numbers" className="inline-flex min-h-11 items-center text-[14px] font-semibold text-forest hover:text-ink">
              All the numbers →
            </Link>
          </div>
          <ul className="divide-y divide-rule">{moves.map((m) => <MoveRow key={m.id} move={m} />)}</ul>
        </section>
      ) : null}
      <p className="mt-3 max-w-3xl text-[12.5px] leading-5 text-muted">
        How the moves are chosen: the largest auction rate change in any market in the last 7 days (against the previous sale of the same tenor), the
        largest overnight move among traded African currencies, and the largest move in Kenya. Shilling effects are worked out by code from the
        published rates; nothing here is estimated by a model. Information, not advice.
      </p>

      {receipts.length > 1 || stories.length ? (
        <section aria-labelledby="latest" className="mt-10">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-rule pb-2">
            <h2 id="latest" className="t-h2 text-ink">
              Latest
            </h2>
            <Link href="/receipts" className="inline-flex min-h-11 items-center text-[14px] font-semibold text-forest hover:text-ink">
              All Receipts →
            </Link>
          </div>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {receipts.slice(1, 4).map((r) => (
              <li key={r.slug} className="rounded-2xl border border-rule bg-surface px-5 py-4">
                <ReceiptMeta r={r} />
                <Link href={`/receipts/${r.slug}`} className="mt-2 block font-serif text-[1.15rem] leading-snug text-ink hover:text-forest">
                  {r.title}
                </Link>
              </li>
            ))}
            {stories.slice(0, Math.max(0, 3 - Math.max(0, receipts.length - 1))).map((a) => (
              <li key={`${a.category}-${a.slug}`}>
                <Link href={articleHref(a.category, a.slug)} className="block h-full rounded-2xl border border-rule bg-surface px-5 py-4 hover:border-forest">
                  <p className="t-label text-muted">
                    {categoryLabel(a.category)} · {formatDate(a.date)}
                  </p>
                  <p className="mt-2 font-serif text-[1.15rem] leading-snug text-ink text-balance">{a.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="for-institutions-band" className="mt-10 flex flex-col gap-4 rounded-2xl border border-rule bg-surface px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="t-label text-forest">For institutions</p>
          <h2 id="for-institutions-band" className="t-h2 mt-1 text-ink text-balance">
            Boards, banks, SACCOs and funds: the full dated record, by API, pack or CSV.
          </h2>
          <p className="tabular mt-2 text-[14px] leading-6 text-ink-soft">
            {institutionalTier("analyst").name} from USD {institutionalTier("analyst").monthlyUsd} a month
            {kenya ? `; Kenyan institutions from ${localPriceText(kenya, "analyst")}` : ""}. Free {institutionalPilot.days}-day pilot.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <ButtonLink href={institutionalPilot.href} data-track="pricing_cta_click">
            Start a pilot
          </ButtonLink>
          <Link href="/for-institutions" className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold text-forest underline underline-offset-4">
            What institutions get
          </Link>
        </div>
      </section>
    </div>
  );
}
