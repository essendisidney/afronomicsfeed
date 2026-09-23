import Link from "next/link";
import { articleHref, categoryLabel, formatDate } from "@/lib/format";
import type { ArticleIndexItem } from "@/lib/types";
import { DeskMeta } from "./DeskMeta";
import { LabelBadges } from "./LabelBadges";
import { TopicChips } from "./TopicChips";

export function ArticleCard({
  article,
  featured = false,
}: {
  article: ArticleIndexItem;
  featured?: boolean;
}) {
  const href = articleHref(article.category, article.slug);

  return (
    <article
      className={`flex flex-col border-t border-rule pt-6 ${featured ? "gap-4" : "gap-3"}`}
    >
      <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted">
        <span className="font-mono font-semibold text-forest">{categoryLabel(article.category)}</span>
        <time dateTime={article.date}>{formatDate(article.date)}</time>
        <DeskMeta urgency={article.urgency} minutes={article.minutes} fileFor={article.fileFor} />
      </div>
      <h2 className={`font-serif leading-snug text-ink ${featured ? "text-3xl" : "text-2xl"}`}>
        <Link href={href} className="hover:text-forest">
          {article.title}
        </Link>
      </h2>
      <LabelBadges labels={article.labels} />
      <TopicChips topics={article.topics} institutions={article.institutions} />
      <p className="text-[15px] leading-7 text-ink-soft">{article.summary}</p>
      <ul className="space-y-2 text-sm leading-6 text-ink-soft">
        {article.teaser.slice(0, 3).map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className="mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-forest hover:text-gold"
      >
        Open brief →
      </Link>
    </article>
  );
}
