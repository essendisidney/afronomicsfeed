import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CopyCitation } from "@/components/ui/CopyCitation";
import { LabelBadges } from "@/components/ui/LabelBadges";
import { MarkdownBody } from "@/components/ui/MarkdownBody";
import { Paywall } from "@/components/ui/Paywall";
import { SourcesBlock } from "@/components/ui/SourcesBlock";
import { DeskMemo } from "@/components/ui/DeskMemo";
import { DeskMeta } from "@/components/ui/DeskMeta";
import { TopicChips } from "@/components/ui/TopicChips";
import { StorySignup } from "@/components/ui/StorySignup";
import { ShareBar } from "@/components/share/ShareBar";
import { QuoteShare } from "@/components/share/QuoteShare";
import { PilotCta, showsPilotCta } from "@/components/article/PilotCta";
import { articleHref, categoryLabel, categoryPath, citationText, extractHeadings, formatDate } from "@/lib/format";
import { previewBody } from "@/lib/preview";
import { readingMinutes } from "@/lib/reading";
import { site } from "@/lib/site";
import type { Article, ArticleIndexItem } from "@/lib/types";
import { ArticleJsonLd } from "./ArticleJsonLd";
import { ReadingProgress } from "./ReadingProgress";

/**
 * The reading page for briefs, explainers and the Weekly. One centred column of about 68 characters, with the
 * headline block a little wider; on large screens a share rail sits in the left gutter, clear of the text and of
 * the floating install button (bottom right).
 */
const grid =
  "mx-auto max-w-7xl px-4 sm:px-6 lg:grid lg:grid-cols-[minmax(4.5rem,1fr)_minmax(0,46rem)_minmax(0,1fr)] lg:gap-x-12";

function Dot() {
  return <span aria-hidden="true" className="h-1 w-1 rounded-full bg-rule" />;
}

export function ArticleTemplate({
  article,
  related,
  newer,
  older,
}: {
  article: Article;
  related: ArticleIndexItem[];
  newer: ArticleIndexItem | null;
  older: ArticleIndexItem | null;
}) {
  const url = `${site.url}${articleHref(article.category, article.slug)}`;
  const headings = article.gated ? [] : extractHeadings(article.body);
  const minutes = readingMinutes(article.body);
  const section = categoryLabel(article.category);
  // Many stories end with their own "Information, not advice." line; the template adds one only where they do not.
  const bodySaysNotAdvice = !article.gated && /information, not advice/i.test(article.body);

  return (
    <article className="pb-16" aria-labelledby="story-title">
      <ArticleJsonLd article={article} />
      <ReadingProgress targetId="story-body" />

      <header className="relative border-b border-rule">
        <div className={`relative ${grid}`}>
          <div className="max-w-[56rem] pb-8 pt-6 sm:pt-8 lg:col-span-2 lg:col-start-2 lg:pb-12 lg:pt-12">
            <Breadcrumbs
              items={[
                { href: "/", label: "Home" },
                { href: categoryPath(article.category), label: section },
                { label: article.title },
              ]}
            />
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span aria-hidden="true" className="h-0.5 w-8 rounded-full bg-accent" />
              <Link
                href={categoryPath(article.category)}
                className="-my-3 inline-flex min-h-11 items-center text-[12px] font-semibold uppercase tracking-[0.2em] text-accent hover:text-forest"
              >
                {section}
              </Link>
              <LabelBadges labels={article.labels} />
            </div>
            <h1
              id="story-title"
              className="mt-4 font-serif text-[2.15rem] leading-[1.04] tracking-[-0.015em] text-ink text-balance sm:text-5xl sm:leading-[1.02] lg:text-[3.6rem]"
            >
              {article.title}
            </h1>
            <p className="mt-5 max-w-[46rem] text-[1.125rem] leading-[1.55] text-ink-soft text-pretty sm:text-[1.3rem]">
              {article.summary}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 border-y border-rule py-3.5 text-[14px] text-muted">
              <span className="font-semibold text-ink">By {article.authors.join(", ")}</span>
              <Dot />
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              <Dot />
              <span>{minutes} min read</span>
              {article.asOf ? (
                <>
                  <Dot />
                  <span>Figures as of {formatDate(article.asOf)}</span>
                </>
              ) : null}
              <Dot />
              <a href="#sources" className="-my-3 inline-flex min-h-11 items-center font-semibold text-forest underline decoration-rule underline-offset-4 hover:text-accent">
                Sources &amp; method
              </a>
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <ShareBar url={url} title={article.title} summary={article.summary} networks={["whatsapp", "linkedin", "x", "facebook", "email"]} />
              <DeskMeta urgency={article.urgency} fileFor={article.fileFor} />
            </div>
          </div>
        </div>
      </header>

      <div className={grid}>
        <div className="hidden lg:col-start-1 lg:block lg:justify-self-end">
          <div className="sticky top-36 mt-[22rem]">
            <ShareBar url={url} title={article.title} summary={article.summary} variant="rail" />
          </div>
        </div>

        <div className="min-w-0 lg:col-start-2">
          <section aria-labelledby="short-version" className="mt-10 rounded-3xl border border-rule bg-surface px-5 py-6 sm:px-7">
            <h2 id="short-version" className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-accent">
              The short version
            </h2>
            <ol className="mt-4 space-y-3.5">
              {article.teaser.map((item, index) => (
                <li key={item} className="flex gap-4 text-[16px] leading-7 text-ink">
                  <span aria-hidden="true" className="mt-0.5 font-serif text-[1.35rem] leading-6 text-accent">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </section>

          <DeskMemo soWhat={article.soWhat} unknowns={article.unknowns} gated={article.gated} />

          {headings.length > 1 ? (
            <nav aria-labelledby="toc-heading" className="mt-8 border-l-2 border-accent/60 pl-5">
              <p id="toc-heading" className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-muted">
                In this story
              </p>
              <ol className="mt-2 text-[15px] sm:mt-3 sm:space-y-1.5">
                {headings.map((heading, index) => (
                  <li key={heading.id} className="flex items-center gap-3 sm:items-start">
                    <span aria-hidden="true" className="w-5 shrink-0 font-mono text-[12.5px] leading-6 text-muted">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <a href={`#${heading.id}`} className="flex min-h-11 items-center text-forest underline sm:block sm:min-h-0 decoration-transparent underline-offset-4 hover:text-accent hover:decoration-accent">
                      {heading.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <div id="story-body" className="mt-10">
            {article.gated ? (
              <>
                <MarkdownBody content={previewBody(article.body)} />
                <Paywall title={article.title} />
              </>
            ) : (
              <QuoteShare url={url} title={article.title}>
                <MarkdownBody content={article.body} />
              </QuoteShare>
            )}
          </div>

          <div aria-hidden="true" className="mt-12 flex items-center gap-3 text-accent">
            <span className="h-px flex-1 bg-rule" />
            <span className="h-2 w-2 rotate-45 bg-accent" />
            <span className="h-px flex-1 bg-rule" />
          </div>

          {bodySaysNotAdvice ? null : (
            <p className="mt-6 text-[14px] leading-6 text-muted">
              <em className="font-semibold not-italic text-ink-soft">Information, not advice.</em> Figures are as published by
              the sources listed below; check the issuer&rsquo;s own documents before you save, invest or borrow.
            </p>
          )}

          <ShareBar url={url} title={article.title} summary={article.summary} variant="block" className="mt-8" />

          <div className="mt-8">
            <SourcesBlock sources={article.sources}>
              <p className="mb-3 text-[13px] text-muted">Cite this story</p>
              <CopyCitation text={citationText({ authors: article.authors, title: article.title, date: article.date, url })} />
              <div className="mt-4">
                <TopicChips topics={article.topics} institutions={article.institutions} />
              </div>
            </SourcesBlock>
          </div>

          {showsPilotCta(article) ? <PilotCta slug={article.slug} /> : null}

          {!article.gated ? (
            <aside aria-labelledby="morning-cta" className="on-night no-print relative mt-8 overflow-hidden rounded-3xl bg-night px-6 py-7 text-night-ink sm:px-8 sm:py-8">
              <p className="relative text-[11.5px] font-semibold uppercase tracking-[0.18em] text-accent">The Morning · free, every weekday</p>
              <h2 id="morning-cta" className="relative mt-2 font-serif text-[1.65rem] leading-tight text-balance sm:text-3xl">
                Rates, currencies and auction results before the day starts.
              </h2>
              <div className="relative mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/subscribe"
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-night-ink px-5 text-[14.5px] font-semibold text-night hover:bg-white"
                >
                  Get the Morning by email
                </Link>
                <Link href="/alerts" className="inline-flex min-h-11 items-center justify-center px-2 text-[14px] font-semibold text-night-soft underline decoration-night-line underline-offset-4 hover:text-night-ink">
                  Or set a free rate alert
                </Link>
              </div>
            </aside>
          ) : null}
          {!article.gated ? <StorySignup /> : null}

          {related.length > 0 ? (
            <section aria-labelledby="related-heading" className="no-print mt-14">
              <h2 id="related-heading" className="text-[11.5px] font-semibold uppercase tracking-[0.18em] text-muted">
                Read next
              </h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {related.map((item, index) => (
                  <li key={`${item.category}-${item.slug}`} className={index === 0 ? "sm:col-span-2" : undefined}>
                    <Link
                      href={articleHref(item.category, item.slug)}
                      className="group flex h-full flex-col rounded-2xl border border-rule bg-surface p-5 transition-colors hover:border-accent"
                    >
                      <span className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-accent">
                        {categoryLabel(item.category)} · {formatDate(item.date)}
                      </span>
                      <span className={`mt-2 font-serif leading-snug text-ink text-balance group-hover:text-forest ${index === 0 ? "text-2xl" : "text-xl"}`}>
                        {item.title}
                      </span>
                      {index === 0 ? <span className="mt-2 line-clamp-2 text-[14.5px] leading-6 text-ink-soft">{item.summary}</span> : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {newer || older ? (
            <nav aria-label={`More in ${section}`} className="no-print mt-10 grid gap-3 border-t border-rule pt-8 sm:grid-cols-2">
              {older ? (
                <Link href={articleHref(older.category, older.slug)} className="group rounded-2xl p-4 hover:bg-paper-2">
                  <span className="block text-[12px] font-semibold text-muted">&larr; Older in {section}</span>
                  <span className="mt-1.5 block font-serif text-lg leading-snug text-ink group-hover:text-forest">{older.title}</span>
                </Link>
              ) : (
                <div />
              )}
              {newer ? (
                <Link href={articleHref(newer.category, newer.slug)} className="group rounded-2xl p-4 text-right hover:bg-paper-2">
                  <span className="block text-[12px] font-semibold text-muted">Newer in {section} &rarr;</span>
                  <span className="mt-1.5 block font-serif text-lg leading-snug text-ink group-hover:text-forest">{newer.title}</span>
                </Link>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>
    </article>
  );
}
