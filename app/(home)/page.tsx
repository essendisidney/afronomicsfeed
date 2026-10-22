import type { Metadata } from "next";
import Link from "next/link";
import { LeadStory, MoveRow, movesRule, SectionHead, StoryRow, TodayStrip, ToolTiles } from "@/components/home/FrontPage";
import { SinceLastVisit } from "@/components/home/SinceLastVisit";
import { SectionNav, type SectionLink } from "@/components/layout/SectionNav";
import { ButtonLink } from "@/components/ui/Button";
import { SubscribeForm } from "@/components/ui/SubscribeForm";
import { institutionalPilot, institutionalTier, localInstitutionPrices, localPriceText } from "@/lib/billing/ratecard";
import { renderTime } from "@/lib/data/fetcher";
import { editorialRows, editorialScore } from "@/lib/editorial";
import { formatDate } from "@/lib/format";
import { frontPageRows } from "@/lib/front-page";
import { loadLedger, score } from "@/lib/ledger";
import { visibleReceipts } from "@/lib/receipts";
import { pickLead, rotate, slotOf } from "@/lib/rotation";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";
import { whatChanged } from "@/lib/today";
import { numbersThatMoved } from "@/lib/today-board";
import { tools } from "@/lib/tools";

export const revalidate = 900;

const homeTitle = `${site.name}: what African money did today, and why`;
const homeDescription =
  "Africa's dated record of what money did, why it happened and what happened next: a daily verdict with the receipts, government borrowing costs, currencies and savings rates from the source, and our forecast record in public.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: fitDescription(homeDescription),
  alternates: { canonical: site.url, languages: { en: site.url, sw: `${site.url}/sw` }, types: { "application/rss+xml": [{ url: "/rss.xml", title: `${site.name} RSS` }] } },
  openGraph: { title: homeTitle, description: homeDescription, url: site.url, siteName: site.name, locale: "en_KE", type: "website" },
  // The image is ./opengraph-image.tsx: today's lead story and its number (this route group keeps it off other pages).
  twitter: { card: "summary_large_image", title: homeTitle, description: fitDescription(homeDescription, 200) },
};

const todayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Nairobi" });

/**
 * Today, laid out as a front page (redesign preview): the figures that moved, the lead story, a row per reader topic,
 * the tools, then the Morning, our record and the institutional offer. A section bar under the header jumps between
 * the parts and marks the one in view. Freshness ("Yesterday", "New") is worked out here, on the server, from each
 * item's date and the time of this render (renderTime), so the browser prints exactly what the server sent. The lead,
 * the rows and the tools rotate every 3 hours from the same time (lib/rotation.ts).
 */
export default async function TodayPage() {
  const now = renderTime();
  const moves = await whatChanged();
  const tiles = numbersThatMoved();
  const receipts = visibleReceipts();
  // Rotation (lib/rotation.ts): the lead, the rows and the tools take turns every 3 hours, Nairobi time.
  const lead = pickLead(receipts, now);
  const rows = frontPageRows(lead?.slug ?? null, receipts, now);
  const homeTools = rotate(tools.filter((t) => t.home), slotOf(now));
  const ledger = loadLedger();
  const live = score(ledger.rows);
  const calls = editorialScore(editorialRows());
  const nextGrade = ledger.rows.filter((r) => !r.outcome).map((r) => r.auction_value_date).sort()[0];
  const kenya = localInstitutionPrices.find((p) => p.id === "kenya");
  const today = new Date(now);
  // "Since your last visit": the same four figures as numbers (percent), and the newest Receipts.
  const marks = tiles.map((t) => ({ id: t.id, label: t.label.replace(/ by yield, after tax$/, ""), value: Number.parseFloat(t.value) })).filter((m) => Number.isFinite(m.value));
  const newest = [...receipts].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8).map((r) => ({ slug: r.slug, title: r.title }));

  const sections: SectionLink[] = [
    { id: "today", label: "Today" },
    { id: "top-story", label: "Top story" },
    ...rows.map((r) => ({ id: r.anchor, label: r.chip })),
    { id: "tools", label: "Tools" },
    { id: "morning", label: "The Morning" },
  ];

  const changed = moves.length ? (
    <>
      <ul className="divide-y divide-rule">
        {moves.map((m) => (
          <MoveRow key={m.id} move={m} />
        ))}
      </ul>
      <p className="mt-2 text-[12px] leading-5 text-muted">{movesRule}</p>
    </>
  ) : null;

  return (
    <div>
      <h1 className="sr-only">Afronomics Today: Africa&rsquo;s dated record of what money did, why it happened, and what happened next</h1>
      <SectionNav sections={sections} label="Today's sections" />

      <div className="mx-auto max-w-7xl px-4 pb-4 pt-1 sm:px-6 sm:pt-4">
        {/* One line that never wraps (both parts nowrap and short), so its height is the same before and after the fonts load. */}
        <p className="t-label flex items-center justify-between gap-3 whitespace-nowrap text-muted sm:justify-start">
          <span>
            <span className="hidden sm:inline">Today · </span>
            <time dateTime={today.toISOString().slice(0, 10)}>{todayFmt.format(today)}</time>
          </span>
          <Link href="/sw" lang="sw" hrefLang="sw" className="inline-flex min-h-11 items-center normal-case tracking-normal text-forest underline underline-offset-2">
            <span className="sm:hidden">Kiswahili</span>
            <span className="hidden sm:inline">Soma kwa Kiswahili</span>
          </Link>
        </p>

        <section id="today" aria-labelledby="today-h" className="mt-1 scroll-mt-28">
          <SectionHead id="today-h" title="Today in 30 seconds" more="/numbers" moreLabel="rates and data" />
          <TodayStrip tiles={tiles} />
          <SinceLastVisit marks={marks} stories={newest} now={today.toISOString()} />
          {changed && lead ? (
            <details className="mt-2 rounded-xl border border-rule bg-surface px-4 lg:hidden">
              <summary className="flex min-h-11 cursor-pointer items-center text-[14px] font-semibold text-ink">What changed this week ({moves.length})</summary>
              <div className="pb-3">{changed}</div>
            </details>
          ) : null}
          <Link href="/record" className="group mt-1 flex min-h-11 items-center text-[13.5px] leading-5 text-ink-soft hover:text-ink">
            <span className="tabular">
              <span className="font-semibold text-ink">Our record:</span>{" "}
              {live.graded
                ? `${live.inside} of ${live.graded} published ranges held the result`
                : `${ledger.rows.length} ranges published before bids close${nextGrade ? `, the first graded with the results for value ${formatDate(nextGrade)}` : ""}`}
              {calls.open ? ` · ${calls.open} call${calls.open === 1 ? "" : "s"} open${calls.nextDue ? `, first due ${formatDate(calls.nextDue)}` : ""}` : ""}
              <span className="text-forest group-hover:text-ink"> →</span>
            </span>
          </Link>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <section id="top-story" aria-label="Top story" className="min-w-0 scroll-mt-28 lg:col-span-8">
            {lead ? (
              <LeadStory r={lead} now={now} />
            ) : (
              <div className="rounded-2xl border border-rule bg-surface px-5 py-2 sm:px-6">
                <h2 className="t-h2 pt-4 text-ink">What changed</h2>
                {changed}
              </div>
            )}
          </section>
          {changed && lead ? (
            <aside aria-labelledby="changed-h" className="hidden min-w-0 lg:col-span-4 lg:block">
              <h2 id="changed-h" className="t-h3 border-b border-rule pb-2 text-ink">
                What changed this week
              </h2>
              {changed}
            </aside>
          ) : null}
        </div>

        {rows.map((row) => (
          <section key={row.id} id={row.anchor} aria-labelledby={`${row.anchor}-h`} className="mt-8 scroll-mt-28 sm:mt-12">
            <SectionHead id={`${row.anchor}-h`} title={row.title} blurb={row.blurb} more={row.more} moreLabel={`${row.title} stories`} />
            <StoryRow items={row.items} now={now} />
          </section>
        ))}

        <section id="tools" aria-labelledby="tools-h" className="mt-8 scroll-mt-28 sm:mt-12">
          <SectionHead id="tools-h" title="Tools" blurb="Calculators and checkers that answer one question each" more="/tools" moreLabel="tools" />
          <ToolTiles items={homeTools} />
        </section>

        <div className="mt-8 grid gap-3 sm:mt-10 lg:grid-cols-2">
          <section id="morning" aria-labelledby="signup" className="scroll-mt-28 rounded-2xl border border-rule bg-paper-2 px-5 py-5 sm:px-6">
            <p className="t-label text-forest">Free, every weekday</p>
            <h2 id="signup" className="mt-1.5 font-serif text-[1.45rem] leading-tight text-ink">
              The Morning, before 07:30
            </h2>
            <p className="mt-1 text-[14px] leading-6 text-ink-soft">Every weekday: what moved overnight, and what it means for your money. Free.</p>
            <div className="mt-2">
              <SubscribeForm button="Send it to me" />
            </div>
          </section>

          <section aria-labelledby="for-institutions-band" className="on-night rounded-2xl bg-night px-5 py-5 text-night-ink ring-1 ring-night-line sm:px-6">
            <p className="t-label text-accent">For institutions</p>
            <h2 id="for-institutions-band" className="mt-1.5 font-serif text-[1.45rem] leading-tight text-night-ink text-balance">
              Boards, banks, SACCOs and funds: the full dated record, by API, pack or CSV.
            </h2>
            <p className="tabular mt-1.5 text-[14px] leading-6 text-night-soft">
              {institutionalTier("analyst").name} from USD {institutionalTier("analyst").monthlyUsd} a month
              {kenya ? `; Kenyan institutions from ${localPriceText(kenya, "analyst")}` : ""}. Free {institutionalPilot.days}-day pilot.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-3">
              <ButtonLink href={institutionalPilot.href} size="sm" variant="accent" data-track="pricing_cta_click">
                Start a pilot
              </ButtonLink>
              <Link href="/for-institutions" className="inline-flex min-h-11 items-center px-1 text-[13px] font-semibold text-night-ink underline decoration-night-muted underline-offset-4 hover:decoration-night-ink">
                What institutions get
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
