import Link from "next/link";
import { asOfLabel, EvidenceTag } from "@/components/evidence/EvidenceTag";
import { BarChart } from "@/components/charts/BarChart";
import { VerdictLine } from "@/components/receipts/ReceiptView";
import { ShareNumberButton } from "@/components/share/ShareNumberButton";
import { ButtonLink } from "@/components/ui/Button";
import { shareLink, todayTileIds } from "@/lib/share";
import { freshness, type StoryCard } from "@/lib/front-page";
import { deskSlug, receiptEvidence, sectorNames, type Receipt, type ReceiptChart } from "@/lib/receipts";
import type { TodayMove } from "@/lib/today";
import type { BoardTile } from "@/lib/today-board";
import type { Tool } from "@/lib/tools";
import { isPercentUnit } from "@/lib/charts/render";

/**
 * The parts of the front page (redesign preview). Every section is a landmark with an id the section bar on Today
 * (components/layout/SectionNav.tsx) jumps to; `scroll-mt-28` lands it below the header and the bar. Text that could
 * wrap differently when a font arrives sits in a box of fixed height, so nothing below it moves.
 */

export function SectionHead({ id, title, blurb, more, moreLabel }: { id: string; title: string; blurb?: string; more?: string; moreLabel?: string }) {
  return (
    <div className="af-section-head flex items-end justify-between gap-3 border-b border-rule pb-1.5">
      <div className="min-w-0">
        <h2 id={id} className="t-h2 text-ink">
          {title}
        </h2>
        {blurb ? <p className="hidden text-[13px] leading-5 text-muted sm:block">{blurb}</p> : null}
      </div>
      {more ? (
        <Link href={more} className="inline-flex min-h-11 shrink-0 items-center text-[14px] font-semibold text-forest hover:text-ink">
          See all<span className="sr-only"> {moreLabel ?? title}</span>
          <span aria-hidden="true">&nbsp;→</span>
        </Link>
      ) : null}
    </div>
  );
}

/** "Today in 30 seconds": the figures that moved, one compact tile each; a sideways row on a phone. */
export function TodayStrip({ tiles }: { tiles: BoardTile[] }) {
  return (
    <ul className="swipe-row -mx-4 mt-3 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
      {tiles.map((t) => {
        const tone = t.direction === "up" ? "text-up" : t.direction === "down" ? "text-down" : "text-muted";
        return (
          <li key={t.id} className="w-[44%] min-w-[10.5rem] shrink-0 sm:w-auto sm:min-w-0">
            <div className="relative flex h-full flex-col rounded-xl border border-rule bg-surface px-3 py-2.5">
              {(todayTileIds as readonly string[]).includes(t.id) ? (
                <ShareNumberButton
                  url={shareLink({ kind: "number", receipt: null, tile: t.id })}
                  text={`${t.label}: ${t.value}${t.change ? ` (${t.change})` : ""}. ${t.evidence.source}.`}
                  label={t.label}
                  className="right-0 top-0"
                />
              ) : null}
              <p className="line-clamp-2 h-8 pr-6 text-[12px] font-medium leading-4 text-muted">
                <Link href={t.href} className="after:absolute after:inset-0 hover:text-ink">
                  {t.label}
                </Link>
              </p>
              <p className="af-figure tabular mt-1 text-[1.45rem] font-semibold leading-none tracking-tight text-ink">{t.value}</p>
              <p className={`tabular mt-1 line-clamp-2 h-8 text-[12px] font-medium leading-4 ${tone}`}>
                {t.change ? (
                  <>
                    <span aria-hidden="true">{t.direction === "up" ? "▲ " : t.direction === "down" ? "▼ " : ""}</span>
                    {t.direction === "up" ? <span className="sr-only">Up: </span> : t.direction === "down" ? <span className="sr-only">Down: </span> : null}
                    {t.change}
                  </>
                ) : null}
              </p>
              <a
                href={t.evidence.href}
                target="_blank"
                rel="noopener noreferrer"
                data-track="source_click"
                aria-label={`Source: ${t.evidence.source}, ${t.evidence.dateKind === "value" ? "for value" : "as of"} ${asOfLabel(t.evidence.asOf)} (opens the source)`}
                className="relative z-10 mt-1.5 block truncate text-[11px] leading-5 text-muted underline decoration-rule underline-offset-2 hover:text-ink"
              >
                <time dateTime={t.evidence.asOf} className="tabular">
                  {t.evidence.dateKind === "value" ? "Value " : ""}
                  {asOfLabel(t.evidence.asOf)}
                </time>{" "}
                · {t.evidence.source}
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function MoveRow({ move }: { move: TodayMove }) {
  return (
    <li className="py-3">
      <p className={`t-label ${move.direction === "up" ? "text-up" : "text-down"}`}>
        <span aria-hidden="true">{move.direction === "up" ? "▲" : "▼"}</span> {move.kind === "fx" ? "Currency" : "Government borrowing"}
      </p>
      <h3 className="mt-1 font-serif text-[1.02rem] leading-snug text-ink text-balance">
        <Link href={move.href} className="hover:text-forest">
          {move.headline}
        </Link>
      </h3>
      <p className="mt-1 text-[13.5px] leading-5 text-ink-soft">
        {move.shillings ? <span className="tabular font-semibold text-ink">{move.shillings}. </span> : null}
        <span className="font-semibold text-ink">Who it touches:</span> {move.touches}.
      </p>
      <div className="mt-1.5">
        <EvidenceTag {...move.evidence} />
      </div>
    </li>
  );
}

export const movesRule =
  "How the moves are chosen: the largest auction rate change in any market in the last 7 days (against the previous sale of the same tenor), the largest overnight move among traded African currencies, and the largest move in Kenya. Shilling effects are worked out by code from the published rates; nothing here is estimated by a model. Information, not advice.";

function DeskChip({ label, kind, date, now }: { label: string; kind: string; date: string; now: number }) {
  const f = freshness(date, now);
  return (
    <p className="flex h-5 items-center gap-1.5 whitespace-nowrap text-[11px] leading-none">
      <span className="min-w-0 truncate font-semibold uppercase tracking-[0.05em]">
        <span className="text-[var(--desk)]">{label}</span>
        <span aria-hidden="true" className="text-muted">
          {" · "}
        </span>
        <span className="text-muted">{kind}</span>
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-1.5">
        {f.isNew ? <span className="rounded-full bg-ink px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-paper">New</span> : null}
        <time dateTime={date} className="text-[11.5px] text-muted">
          {f.label}
        </time>
      </span>
    </p>
  );
}

/** The lead story's chart, framed lightly (it already sits in the story's card): the finding, the bars, the source. */
function LeadChart({ r, chart }: { r: Receipt; chart: ReceiptChart }) {
  const pct = isPercentUnit(chart.unit);
  const ev = receiptEvidence(r, chart.source);
  return (
    <figure className="min-w-0 border-t border-rule pt-3 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
      <figcaption className="text-[14px] font-semibold leading-5 text-ink text-balance">
        {chart.title} <span className="text-[12px] font-normal text-muted">({chart.unit})</span>
      </figcaption>
      <div className="mt-2">
        <BarChart
          data={chart.data}
          unit={chart.unit}
          highlight={chart.highlight}
          reference={chart.reference}
          annotations={chart.annotations}
          label={`${chart.title}. ${chart.data.map((d) => `${d.label}: ${d.value}${pct ? "%" : ""}`).join("; ")}`}
          format={(v) => `${v.toLocaleString("en-US", { maximumFractionDigits: 2 })}${pct ? "%" : ""}`}
        />
      </div>
      {ev ? (
        <p className="mt-1 truncate text-[11.5px] leading-5 text-muted">
          Source:{" "}
          <a href={ev.href} target="_blank" rel="noopener noreferrer" data-track="source_click" className="underline decoration-rule underline-offset-2 hover:text-ink">
            {ev.source}
          </a>
          , {asOfLabel(ev.asOf)}
        </p>
      ) : null}
    </figure>
  );
}

/** The day's lead story, readable without a click: headline, verdict, its headline number, one chart. */
export function LeadStory({ r, now }: { r: Receipt; now: number }) {
  const desk = deskSlug(r.desk) ?? "markets";
  const tile = r.tiles[0];
  const ev = tile ? receiptEvidence(r, tile.source) : null;
  const chart = r.charts[0];
  return (
    <article aria-labelledby="lead-story" className={`desk-${desk} relative overflow-hidden rounded-2xl border border-rule bg-surface px-5 pb-5 pt-5 sm:px-6`}>
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[var(--desk)]" />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-6">
        <div className="min-w-0">
          <DeskChip label={sectorNames[desk] ?? desk} kind={r.type === "verdict" ? "Verdict" : "Data"} date={r.date} now={now} />
          <h2 id="lead-story" className="mt-2.5 font-serif text-[1.5rem] leading-[1.18] text-ink text-balance sm:text-[2rem]">
            <Link href={`/receipts/${r.slug}`} className="hover:text-forest">
              {r.title}
            </Link>
          </h2>
          <VerdictLine r={r} size="md" />
          {tile ? (
            <div className="mt-4 flex items-baseline gap-3">
              <p className="af-figure tabular shrink-0 text-[1.9rem] font-semibold leading-none tracking-tight text-ink">{tile.value}</p>
              <p className="text-[13px] leading-5 text-ink-soft">
                {tile.label}
                {ev ? <span className="block truncate text-[11.5px] text-muted">{asOfLabel(ev.asOf)} · {ev.source}</span> : null}
              </p>
            </div>
          ) : null}
          <div className="mt-5 hidden lg:block">
            <ButtonLink href={`/receipts/${r.slug}`}>Read the story</ButtonLink>
          </div>
        </div>
        {chart ? (
          <div className="mt-4 min-w-0 lg:mt-0">
            <LeadChart r={r} chart={chart} />
          </div>
        ) : null}
      </div>
      <div className="mt-4 lg:hidden">
        <ButtonLink href={`/receipts/${r.slug}`} block>
          Read the story
        </ButtonLink>
      </div>
    </article>
  );
}

export function StoryCardView({ c, now, figures }: { c: StoryCard; now: number; figures: boolean }) {
  return (
    <li className={`desk-${c.desk} w-[80%] max-w-[20rem] shrink-0 md:w-auto md:max-w-none`}>
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-rule bg-surface px-4 pb-3.5 pt-3.5 hover:border-ink">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[var(--desk)]" />
        <DeskChip label={c.deskLabel} kind={c.kind} date={c.date} now={now} />
        <h3 className="mt-2 line-clamp-3 h-[4.05rem] font-serif text-[1.02rem] leading-[1.35rem] text-ink">
          <Link href={c.href} className="after:absolute after:inset-0 hover:underline hover:decoration-1 hover:underline-offset-2">
            {c.title}
          </Link>
        </h3>
        <div className={figures ? "mt-2 h-11" : "hidden"}>
          {c.figure ? (
            <>
              <p className="af-figure tabular text-[1.3rem] font-semibold leading-6 tracking-tight text-ink">{c.figure.value}</p>
              {c.figure.label ? <p className="line-clamp-1 text-[12px] leading-5 text-muted">{c.figure.label}</p> : null}
            </>
          ) : null}
        </div>
      </article>
    </li>
  );
}

export function StoryRow({ items, now }: { items: StoryCard[]; now: number }) {
  return (
    <ul className="swipe-row -mx-4 mt-3 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 lg:grid-cols-4">
      {items.map((c) => (
        <StoryCardView key={c.key} c={c} now={now} figures={items.some((x) => x.figure)} />
      ))}
    </ul>
  );
}

/** The calculators as compact tiles: two rows that swipe sideways on a phone, a grid from md. */
export function ToolTiles({ items }: { items: Tool[] }) {
  return (
    <ul className="swipe-row -mx-4 mt-3 grid auto-cols-[minmax(11.5rem,52%)] grid-flow-col grid-rows-2 gap-2.5 overflow-x-auto px-4 pb-1 md:mx-0 md:auto-cols-auto md:grid-flow-row md:grid-cols-4 md:grid-rows-none md:overflow-visible md:px-0">
      {items.map((t) => (
        <li key={t.href} className="min-w-0">
          <Link href={t.href} className="flex h-full min-h-11 flex-col rounded-xl border border-rule bg-surface px-3 py-2.5 hover:border-ink">
            <span className="truncate text-[14px] font-semibold leading-5 text-ink">{t.title}</span>
            <span className="line-clamp-2 text-[12.5px] leading-[1.1rem] text-muted md:line-clamp-1">{t.answers}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
