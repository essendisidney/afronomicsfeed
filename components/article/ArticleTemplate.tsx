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
import { articleHref, categoryLabel, categoryPath, citationText, extractHeadings, formatDate } from "@/lib/format";
import { previewBody } from "@/lib/preview";
import { site } from "@/lib/site";
import type { Article, ArticleIndexItem } from "@/lib/types";
import { ArticleJsonLd } from "./ArticleJsonLd";

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

  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <ArticleJsonLd article={article} />
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: categoryPath(article.category), label: categoryLabel(article.category) },
          { label: article.title },
        ]}
      />
      <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-gold">
        <Link href={categoryPath(article.category)} className="hover:text-forest">
          {categoryLabel(article.category)}
        </Link>
      </p>
      <h1 className="mt-3 font-serif text-4xl leading-[1.15] text-ink sm:text-5xl">
        {article.title}
      </h1>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
        <time dateTime={article.date}>{formatDate(article.date)}</time>
        <span>{article.authors.join(", ")}</span>
        {article.asOf ? (
          <span className="font-mono text-[11px] uppercase tracking-[0.12em]">
            Figures as of {formatDate(article.asOf)}
          </span>
        ) : null}
      </div>
      <div className="mt-5 flex flex-col gap-3">
        <DeskMeta urgency={article.urgency} minutes={article.minutes} fileFor={article.fileFor} />
        <LabelBadges labels={article.labels} />
        <TopicChips topics={article.topics} institutions={article.institutions} />
        <CopyCitation
          text={citationText({
            authors: article.authors,
            title: article.title,
            date: article.date,
            url,
          })}
        />
      </div>

      <section className="mt-10 border border-rule bg-paper-2 px-5 py-6">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
          Free teaser
        </h2>
        <ul className="mt-4 space-y-3 text-[15px] leading-7 text-ink-soft">
          {article.teaser.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <DeskMemo soWhat={article.soWhat} unknowns={article.unknowns} gated={article.gated} />

      {headings.length > 1 ? (
        <nav className="mt-8 border border-rule px-5 py-4">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            In this file
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a href={`#${heading.id}`} className="text-forest hover:text-gold">
                  {heading.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {article.gated ? (
        <>
          <div className="mt-10">
            <MarkdownBody content={previewBody(article.body)} />
          </div>
          <Paywall title={article.title} />
        </>
      ) : (
        <div className="mt-10">
          <MarkdownBody content={article.body} />
        </div>
      )}

      <div className="mt-14">
        <SourcesBlock sources={article.sources} />
      </div>

      {(newer || older) && (
        <nav className="no-print mt-12 grid gap-4 border-t border-rule pt-8 sm:grid-cols-2">
          {older ? (
            <Link href={articleHref(older.category, older.slug)} className="border border-rule p-4 hover:border-gold">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Older in this file</p>
              <p className="mt-2 font-serif text-lg text-ink">{older.title}</p>
            </Link>
          ) : (
            <div />
          )}
          {newer ? (
            <Link href={articleHref(newer.category, newer.slug)} className="border border-rule p-4 text-right hover:border-gold">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Newer in this file</p>
              <p className="mt-2 font-serif text-lg text-ink">{newer.title}</p>
            </Link>
          ) : null}
        </nav>
      )}

      {related.length > 0 ? (
        <section className="no-print mt-12 border-t border-rule pt-8">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
            Related on the desk
          </h2>
          <ul className="mt-5 space-y-4">
            {related.map((item) => (
              <li key={`${item.category}-${item.slug}`}>
                <Link href={articleHref(item.category, item.slug)} className="group block">
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold">
                    {categoryLabel(item.category)} · {formatDate(item.date)}
                  </p>
                  <p className="mt-1 font-serif text-xl text-ink group-hover:text-forest">{item.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
