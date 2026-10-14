import type { Metadata } from "next";
import Link from "next/link";
import { NewsletterBand } from "@/components/data/NewsletterBand";
import { EvidenceTag } from "@/components/evidence/EvidenceTag";
import { ButtonLink } from "@/components/ui/Button";
import { institutionalPilot, institutionalTier, localInstitutionPrices, localPriceText } from "@/lib/billing/ratecard";
import { getLatestArticles } from "@/lib/content";
import { articleHref, categoryLabel, formatDate } from "@/lib/format";
import { fitDescription } from "@/lib/seo";
import { site } from "@/lib/site";
import { ourRecord, whatChanged, type TodayMove } from "@/lib/today";

export const revalidate = 900;

const homeTitle = `${site.name}: what African money did today, and why`;
const homeDescription =
  "Africa's dated record of what money did, why it happened and what happened next: government borrowing costs, currencies and savings rates from the source, with our forecast record in public.";

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: fitDescription(homeDescription),
  alternates: { canonical: site.url, languages: { en: site.url, sw: `${site.url}/sw` }, types: { "application/rss+xml": [{ url: "/rss.xml", title: `${site.name} RSS` }] } },
  openGraph: { title: homeTitle, description: homeDescription, url: site.url, siteName: site.name, locale: "en_KE", type: "website" },
};

const todayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Nairobi" });

function MoveCard({ move }: { move: TodayMove }) {
  return (
    <li className="flex flex-col rounded-2xl border border-rule bg-surface px-5 py-5">
      <p className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${move.direction === "up" ? "text-up" : "text-down"}`}>
        <span aria-hidden="true">{move.direction === "up" ? "▲" : "▼"}</span> {move.kind === "fx" ? "Currency" : "Government borrowing"}
      </p>
      <h3 className="mt-2 font-serif text-[1.3rem] leading-snug text-ink text-balance">
        <Link href={move.href} className="hover:text-forest">
          {move.headline}
        </Link>
      </h3>
      {move.shillings ? <p className="tabular mt-3 text-[15px] font-semibold leading-6 text-ink">{move.shillings}.</p> : null}
      <p className="mt-2 text-[14px] leading-6 text-ink-soft">
        <span className="font-semibold text-ink">Who it touches:</span> {move.touches}.
      </p>
      <div className="mt-auto pt-4">
        <EvidenceTag {...move.evidence} />
      </div>
    </li>
  );
}

export default async function TodayPage() {
  const [moves, record] = await Promise.all([whatChanged(), Promise.resolve(ourRecord())]);
  const stories = getLatestArticles(3);
  const kenya = localInstitutionPrices.find((p) => p.id === "kenya");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="border-b border-rule pb-6">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-muted">
          Today · <time dateTime={new Date().toISOString().slice(0, 10)}>{todayFmt.format(new Date())}</time>
        </p>
        <h1 className="mt-2 max-w-3xl font-serif text-[2rem] leading-tight text-ink text-balance sm:text-[2.6rem]">
          Africa&rsquo;s dated record of what money did, why it happened, and what happened next.
        </h1>
        <p className="mt-3 max-w-2xl text-[16px] leading-7 text-ink-soft">
          Every figure names its source and the date it is as of. Tap the tag to open the source.{" "}
          <em className="not-italic font-semibold text-ink">Information, not advice.</em>{" "}
          <Link href="/sw" lang="sw" hrefLang="sw" className="underline underline-offset-2">
            Soma kwa Kiswahili
          </Link>
        </p>
      </header>

      <section aria-labelledby="what-changed" className="mt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="what-changed" className="font-serif text-2xl text-ink sm:text-3xl">
            What changed
          </h2>
          <Link href="/numbers" className="inline-flex min-h-11 items-center text-[14px] font-semibold text-forest hover:text-gold">
            All the numbers →
          </Link>
        </div>
        {moves.length ? (
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {moves.map((move) => (
              <MoveCard key={move.id} move={move} />
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-rule bg-surface px-5 py-5 text-[15px] text-ink-soft">
            No market we cover has published a changed result in the last week. The latest results are on{" "}
            <Link href="/numbers" className="underline underline-offset-2">
              Numbers
            </Link>
            .
          </p>
        )}
        <p className="mt-3 text-[13px] leading-5 text-muted">
          How these are chosen: the largest auction rate change in any market in the last 7 days (against the previous sale of the same tenor), the largest overnight
          move among traded African currencies, and the largest move in Kenya (or the next-largest elsewhere). Shilling
          effects are worked out by code from the published rates; nothing here is estimated by a model.
        </p>
      </section>

      {record ? (
        <section id="record" aria-labelledby="our-record" className="mt-12 grid gap-6 rounded-3xl border border-rule bg-surface px-6 py-7 sm:px-8 lg:grid-cols-[1fr_2fr] lg:items-center">
          <div>
            <h2 id="our-record" className="font-serif text-2xl text-ink sm:text-3xl">
              How the method has done
            </h2>
            <p className="tabular mt-3 font-serif text-[2.6rem] leading-none text-ink">{Math.round(record.share * 100)}%</p>
          </div>
          <div>
            <p className="tabular text-[16px] leading-7 text-ink">
              Before each Kenya Treasury bill auction we show a likely range for each tenor: the latest rate plus the 10th to 90th
              percentile of the last 26 weekly moves. Tested on {record.tested.toLocaleString("en-US")} past auctions in {record.tenors} tenors since
              2011, the result fell inside the range {record.inside.toLocaleString("en-US")} times. A range built this way aims for about 80%, so it
              has been too narrow.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <EvidenceTag source="Central Bank of Kenya auction results" href={record.source} asOf={record.asOf} />
              <Link href="/markets/kenya-tbills/auction" className="inline-flex min-h-11 items-center text-[14px] font-semibold text-forest hover:text-gold">
                This week&rsquo;s ranges →
              </Link>
            </div>
            <p className="mt-2 text-[13px] text-muted">
              This is a backtest: the method run over past auctions, not ranges we published at the time. From now on each week&rsquo;s range is
              published before bids close and graded by code against the CBK result.
            </p>
          </div>
        </section>
      ) : null}

      {stories.length ? (
        <section aria-labelledby="latest-stories" className="mt-12">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="latest-stories" className="font-serif text-2xl text-ink sm:text-3xl">
              Latest stories
            </h2>
            <Link href="/stories" className="inline-flex min-h-11 items-center text-[14px] font-semibold text-forest hover:text-gold">
              All stories →
            </Link>
          </div>
          <ul className="mt-4 grid gap-4 md:grid-cols-3">
            {stories.map((a) => (
              <li key={`${a.category}-${a.slug}`}>
                <Link href={articleHref(a.category, a.slug)} className="block h-full rounded-2xl border border-rule bg-surface px-5 py-5 hover:border-forest">
                  <p className="text-[12px] font-semibold text-muted">
                    {categoryLabel(a.category)} · {formatDate(a.date)}
                  </p>
                  <p className="mt-2 font-serif text-[1.2rem] leading-snug text-ink text-balance">{a.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-labelledby="for-institutions-band" className="mt-12 rounded-3xl border-2 border-forest/30 bg-surface px-6 py-7 sm:px-8">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-forest">For institutions</p>
        <h2 id="for-institutions-band" className="mt-2 max-w-2xl font-serif text-2xl leading-tight text-ink sm:text-3xl">
          Boards, banks, SACCOs and funds: the full dated record, by API or CSV.
        </h2>
        <p className="tabular mt-3 max-w-2xl text-[15px] leading-6 text-ink-soft">
          {institutionalTier("analyst").name} from USD {institutionalTier("analyst").monthlyUsd} a month and {institutionalTier("team").name} from USD{" "}
          {institutionalTier("team").monthlyUsd.toLocaleString("en-US")}
          {kenya ? `; Kenyan institutions pay ${localPriceText(kenya, "analyst")} and ${localPriceText(kenya, "team")}` : ""}. Start with a free{" "}
          {institutionalPilot.days}-day pilot.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href={institutionalPilot.href} data-track="pricing_cta_click">
            Start a {institutionalPilot.days}-day pilot
          </ButtonLink>
          <Link href="/for-institutions" className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold text-forest underline underline-offset-4">
            What institutions get
          </Link>
        </div>
      </section>

      <NewsletterBand />
    </div>
  );
}
